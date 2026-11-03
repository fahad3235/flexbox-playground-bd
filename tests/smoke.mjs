// Headless-Chrome smoke test for flexbox-playground-bd (raw CDP, file://).
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CHROME = '/opt/meta-chromium/chrome';
const PAGE = 'file:///home/hatch/workspace/muse-project-factory/builds/flexbox-playground-bd/index.html';
const PORT = 9225;
const policyPath = '/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt';
const policySha = createHash('sha256').update(readFileSync(policyPath)).digest('hex');
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  '--disable-extensions', '--no-first-run',
  `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/fx-chrome-profile',
  `--hatch-webgl-allowed-domains-file=${policyPath}`,
  `--hatch-webgl-allowed-domains-sha256=${policySha}`,
  'about:blank',
], { stdio: 'ignore' });

const errors = [];
let ws, nextId = 1;
const pending = new Map();
function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error('evaluate failed: ' + expr + ' :: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  return r.result.result.value;
}
let passed = 0, failed = 0;
function check(name, cond, extra = '') {
  if (cond) { passed++; console.log('PASS - ' + name); }
  else { failed++; console.log('FAIL - ' + name + ' ' + extra); }
}
async function setSelect(id, v) {
  await ev(`(function(){var el=document.getElementById('${id}');el.value='${v}';el.dispatchEvent(new Event('change',{bubbles:true}));})()`);
}
async function setInput(id, v) {
  await ev(`(function(){var el=document.getElementById('${id}');el.value='${v}';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));})()`);
}
try {
  let wsUrl = null;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (r.ok) {
        const list = await r.json();
        const page = list.find((t) => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) wsUrl = page.webSocketDebuggerUrl;
      }
    } catch {}
    if (!wsUrl) await sleep(500);
  }
  if (!wsUrl) throw new Error('chrome debugging endpoint did not come up');
  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errors.push('exception: ' + JSON.stringify(d.params.exceptionDetails).slice(0, 200));
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errors.push('console.error: ' + JSON.stringify(d.params.args).slice(0, 200));
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: PAGE });
  await sleep(1500);
  await ev(`localStorage.clear()`);
  await send('Page.reload', { ignoreCache: true });
  await sleep(1500);

  check('title renders', (await ev(`document.title`)).includes('Flexbox Playground BD'));
  check('default 3 boxes', (await ev(`document.querySelectorAll('.box').length`)) === 3);
  check('default CSS row + gap 12', (await ev(`document.getElementById('css-out').textContent`)).includes('flex-direction: row;') && (await ev(`document.getElementById('css-out').textContent`)).includes('gap: 12px;'));
  check('saved empty state visible', (await ev(`document.getElementById('saved-empty').textContent`)).includes('No saved layouts'));

  await setSelect('direction', 'column');
  await sleep(300);
  check('direction column updates preview + CSS', (await ev(`getComputedStyle(document.getElementById('preview')).flexDirection`)) === 'column' && (await ev(`document.getElementById('css-out').textContent`)).includes('flex-direction: column;'));

  await setInput('gap', '24');
  await sleep(300);
  check('gap 24 updates CSS', (await ev(`document.getElementById('css-out').textContent`)).includes('gap: 24px;'));

  await ev(`document.querySelector('[data-preset="navbar"]').click()`);
  await sleep(300);
  check('navbar preset: 4 boxes + space-between', (await ev(`document.querySelectorAll('.box').length`)) === 4 && (await ev(`document.getElementById('css-out').textContent`)).includes('justify-content: space-between;'));

  await ev(`document.querySelector('[data-box="1"]').click()`);
  await setSelect('selectedItem', '1');
  await setInput('grow', '2');
  await sleep(300);
  check('selected box 2 grow 2 in CSS', (await ev(`document.getElementById('css-out').textContent`)).includes('.item-2 { flex: 2 1 1 auto;'));

  await setInput('import-text', 'not json{{{');
  await ev(`document.getElementById('import-btn').click()`);
  await sleep(300);
  check('invalid import rejected with message', (await ev(`document.getElementById('import-msg').textContent`)).includes('Invalid'));

  await setInput('import-text', '{"container":{"direction":"column","wrap":"nowrap","justify":"center","alignItems":"center","alignContent":"stretch","gap":8},"items":[{"grow":0,"shrink":1,"order":0,"alignSelf":"auto"},{"grow":1,"shrink":1,"order":0,"alignSelf":"auto"}]}');
  await ev(`document.getElementById('import-btn').click()`);
  await sleep(300);
  check('valid import: 2 boxes + column + grow item', (await ev(`document.querySelectorAll('.box').length`)) === 2 && (await ev(`document.getElementById('css-out').textContent`)).includes('flex-direction: column;') && (await ev(`document.getElementById('css-out').textContent`)).includes('.item-2 { flex: 1 1 1 auto;'));

  await setInput('layout-name', 'My Test Layout');
  await ev(`document.getElementById('save-btn').click()`);
  await sleep(300);
  check('save layout appears in list', (await ev(`document.getElementById('saved-list').textContent`)).includes('My Test Layout'));

  await send('Page.reload', { ignoreCache: true });
  await sleep(1500);
  check('saved layout persists after reload', (await ev(`document.getElementById('saved-list').textContent`)).includes('My Test Layout'));

  await ev(`document.getElementById('lang-btn').click()`);
  await sleep(300);
  check('BN toggle changes title + lang button', (await ev(`document.getElementById('app-title').textContent`)) !== 'Flexbox Playground BD' && (await ev(`document.getElementById('lang-btn').textContent`)) === 'English');

  await setSelect('previewSize', '390');
  await sleep(300);
  check('mobile preview class + narrow width', (await ev(`document.getElementById('preview-wrap').className`)).includes('narrow') && (await ev(`document.getElementById('preview-wrap').offsetWidth`)) <= 430);

  check('zero console/page errors', errors.length === 0, JSON.stringify(errors).slice(0, 300));
  console.log(`SMOKE ${passed}/${passed + failed} passed`);
  if (failed) process.exitCode = 1;
} catch (e) {
  console.error('SMOKE ERROR', e);
  process.exitCode = 1;
} finally {
  try { ws?.close(); } catch {}
  chrome.kill();
}
