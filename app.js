(function () {
'use strict';
var DIRECTIONS = ['row', 'row-reverse', 'column', 'column-reverse'];
var WRAPS = ['nowrap', 'wrap', 'wrap-reverse'];
var JUSTIFIES = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'];
var ALIGNS = ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'];
var ALIGN_CONTENTS = ['stretch', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around'];
var ALIGN_SELFS = ['auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'];
var BOX_COLORS = ['#0f7a6d', '#2563eb', '#b45309', '#7c3aed', '#be185d', '#047857', '#b91c1c', '#334155'];

function clampInt(v, lo, hi, fallback) {
  var n = parseInt(v, 10);
  if (isNaN(n)) return fallback;
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}
function inList(v, list, fallback) { return list.indexOf(v) !== -1 ? v : fallback; }
function defaultContainer() {
  return { direction: 'row', wrap: 'nowrap', justify: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 12 };
}
function defaultItem() { return { grow: 0, shrink: 1, order: 0, alignSelf: 'auto' }; }
function normalizeContainer(c) {
  c = c || {};
  return {
    direction: inList(c.direction, DIRECTIONS, 'row'),
    wrap: inList(c.wrap, WRAPS, 'nowrap'),
    justify: inList(c.justify, JUSTIFIES, 'flex-start'),
    alignItems: inList(c.alignItems, ALIGNS, 'stretch'),
    alignContent: inList(c.alignContent, ALIGN_CONTENTS, 'stretch'),
    gap: clampInt(c.gap, 0, 40, 12)
  };
}
function normalizeItem(it) {
  it = it || {};
  return {
    grow: clampInt(it.grow, 0, 3, 0),
    shrink: clampInt(it.shrink, 0, 3, 1),
    order: clampInt(it.order, -5, 5, 0),
    alignSelf: inList(it.alignSelf, ALIGN_SELFS, 'auto')
  };
}
function buildContainerCSS(c) {
  c = normalizeContainer(c);
  return '.container {\n  display: flex;\n  flex-direction: ' + c.direction + ';\n  flex-wrap: ' + c.wrap + ';\n  justify-content: ' + c.justify + ';\n  align-items: ' + c.alignItems + ';\n  align-content: ' + c.alignContent + ';\n  gap: ' + c.gap + 'px;\n}';
}
function buildItemCSS(it) {
  it = normalizeItem(it);
  return 'flex: ' + it.grow + ' ' + it.shrink + ' 1 auto; order: ' + it.order + '; align-self: ' + it.alignSelf + ';';
}
function buildFullCSS(container, items) {
  var out = [buildContainerCSS(container)];
  (items || []).forEach(function (it, i) {
    out.push('.item-' + (i + 1) + ' { ' + buildItemCSS(it) + ' }');
  });
  return out.join('\n\n');
}
function validateLayout(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (!obj.container || typeof obj.container !== 'object') return false;
  if (!Array.isArray(obj.items) || obj.items.length < 1 || obj.items.length > 8) return false;
  var c = obj.container;
  if (DIRECTIONS.indexOf(c.direction) === -1) return false;
  if (WRAPS.indexOf(c.wrap) === -1) return false;
  if (JUSTIFIES.indexOf(c.justify) === -1) return false;
  if (ALIGNS.indexOf(c.alignItems) === -1) return false;
  if (ALIGN_CONTENTS.indexOf(c.alignContent) === -1) return false;
  if (typeof c.gap !== 'number' || c.gap < 0 || c.gap > 40) return false;
  for (var i = 0; i < obj.items.length; i++) {
    var it = obj.items[i];
    if (!it || typeof it !== 'object') return false;
    if (typeof it.grow !== 'number' || it.grow < 0 || it.grow > 3) return false;
    if (typeof it.shrink !== 'number' || it.shrink < 0 || it.shrink > 3) return false;
    if (typeof it.order !== 'number' || it.order < -5 || it.order > 5) return false;
    if (ALIGN_SELFS.indexOf(it.alignSelf) === -1) return false;
  }
  return true;
}
var PRESETS = {
  centered: { container: { direction: 'row', wrap: 'nowrap', justify: 'center', alignItems: 'center', alignContent: 'stretch', gap: 12 }, count: 1 },
  navbar: { container: { direction: 'row', wrap: 'nowrap', justify: 'space-between', alignItems: 'center', alignContent: 'stretch', gap: 12 }, count: 4 },
  cardRow: { container: { direction: 'row', wrap: 'wrap', justify: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 16 }, count: 3 },
  sidebar: { container: { direction: 'row', wrap: 'nowrap', justify: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 12 }, count: 2, items: [{ grow: 0, shrink: 1, order: 0, alignSelf: 'auto' }, { grow: 1, shrink: 1, order: 0, alignSelf: 'auto' }] },
  columnStack: { container: { direction: 'column', wrap: 'nowrap', justify: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 8 }, count: 3 }
};
function bnDigits(s) {
  var map = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
  return String(s).replace(/[0-9]/g, function (d) { return map[parseInt(d, 10)]; });
}
function toDigits(s, lang) { return lang === 'bn' ? bnDigits(s) : String(s); }

var I18N = {
  en: {
    title: 'Flexbox Playground BD', sub: 'Learn CSS Flexbox by playing with a live layout.',
    direction: 'Direction', wrap: 'Wrap', justify: 'Justify content', alignItems: 'Align items',
    alignContent: 'Align content', gap: 'Gap (px)', itemCount: 'Number of boxes', previewSize: 'Preview width',
    presets: 'Presets:', presetCentered: 'Centered box', presetNavbar: 'Navbar', presetCardRow: 'Card row',
    presetSidebar: 'Sidebar + content', presetColumn: 'Column stack', reset: 'Reset',
    selected: 'Selected box', grow: 'Flex grow', shrink: 'Flex shrink', order: 'Order', alignSelf: 'Align self',
    itemHint: 'Click a box in the preview to select it, then change its flex settings.',
    previewTitle: 'Live preview', previewNote: 'The preview updates as you change any control. No data leaves your browser.',
    cssTitle: 'Generated CSS', copyCss: 'Copy CSS', copied: 'Copied!',
    savedTitle: 'Saved layouts', saveLayout: 'Save layout', export: 'Export JSON', importLabel: 'Import JSON',
    import: 'Import', clearSaved: 'Delete all saved', savedEmpty: 'No saved layouts yet.',
    containerTitle: 'Container controls', itemTitle: 'Selected box',
    footer: 'Offline learning tool. Flexbox values follow the CSS Flexible Box Layout specification; results may vary slightly by browser.',
    importOk: 'Import successful.', importBad: 'Invalid layout JSON.',
    savedDeleted: 'All saved layouts deleted.', load: 'Load', del: 'Delete', langBtn: 'Bangla', namePh: 'Layout name'
  },
  bn: {
    title: '\u09ab\u09cd\u09b2\u09c7\u0995\u09cd\u09b8\u09ac\u0995\u09cd\u09b8 \u09aa\u09cd\u09b2\u09c7\u0997\u09cd\u09b0\u09be\u0989\u09a8\u09cd\u09a1 \u09ac\u09bf\u09a1\u09bf', sub: '\u09b2\u09be\u0987\u09ad \u09b2\u09c7\u0986\u0989\u099f \u09a8\u09bf\u09af\u09bc\u09c7 \u0996\u09c7\u09b2\u09a4\u09c7 \u0996\u09c7\u09b2\u09a4\u09c7 CSS Flexbox \u09b6\u09bf\u0996\u09c1\u09a8\u0964',
    direction: '\u09a6\u09bf\u0995', wrap: '\u09ae\u09cb\u09a1\u09bc\u09be\u09a8\u09cb', justify: '\u09ae\u09c2\u09b2 \u0985\u0995\u09cd\u09b7\u09c7 \u09b8\u09be\u09b0\u09bf\u09ac\u09a6\u09cd\u09a7\u0995\u09b0\u09a3', alignItems: '\u0986\u0987\u099f\u09c7\u09ae \u09b8\u09be\u09b0\u09bf\u09ac\u09a6\u09cd\u09a7\u0995\u09b0\u09a3',
    alignContent: '\u0995\u09a8\u09cd\u099f\u09c7\u09a8\u09cd\u099f \u09b8\u09be\u09b0\u09bf\u09ac\u09a6\u09cd\u09a7\u0995\u09b0\u09a3', gap: '\u09ab\u09be\u0981\u0995 (\u09aa\u09bf\u0995\u09cd\u09b8\u09c7\u09b2)', itemCount: '\u09ac\u09be\u0995\u09cd\u09b8\u09c7\u09b0 \u09b8\u0982\u0996\u09cd\u09af\u09be', previewSize: '\u09aa\u09cd\u09b0\u09bf\u09ad\u09bf\u0989 \u09aa\u09cd\u09b0\u09b8\u09cd\u09a5',
    presets: '\u09aa\u09cd\u09b0\u09bf\u09b8\u09c7\u099f:', presetCentered: '\u09ae\u09be\u099d\u0996\u09be\u09a8\u09c7 \u09ac\u09be\u0995\u09cd\u09b8', presetNavbar: '\u09a8\u09cd\u09af\u09be\u09ad\u09ac\u09be\u09b0', presetCardRow: '\u0995\u09be\u09b0\u09cd\u09a1 \u09b8\u09be\u09b0\u09bf',
    presetSidebar: '\u09b8\u09be\u0987\u09a1\u09ac\u09be\u09b0 + \u0995\u09a8\u09cd\u099f\u09c7\u09a8\u09cd\u099f', presetColumn: '\u0995\u09b2\u09be\u09ae \u09b8\u09cd\u099f\u09cd\u09af\u09be\u0995', reset: '\u09b0\u09bf\u09b8\u09c7\u099f',
    selected: '\u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09bf\u09a4 \u09ac\u09be\u0995\u09cd\u09b8', grow: 'Flex grow', shrink: 'Flex shrink', order: 'Order', alignSelf: 'Align self',
    itemHint: '\u09aa\u09cd\u09b0\u09bf\u09ad\u09bf\u0989\u09a4\u09c7 \u098f\u0995\u099f\u09bf \u09ac\u09be\u0995\u09cd\u09b8\u09c7 \u0995\u09cd\u09b2\u09bf\u0995 \u0995\u09b0\u09c7 \u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09a8 \u0995\u09b0\u09c1\u09a8, \u09a4\u09be\u09b0\u09aa\u09b0 \u098f\u09b0 flex \u09b8\u09c7\u099f\u09bf\u0982 \u09ac\u09a6\u09b2\u09be\u09a8\u0964',
    previewTitle: '\u09b2\u09be\u0987\u09ad \u09aa\u09cd\u09b0\u09bf\u09ad\u09bf\u0989', previewNote: '\u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09a8\u09bf\u09af\u09bc\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3 \u09ac\u09a6\u09b2\u09be\u09b2\u09c7\u0987 \u09aa\u09cd\u09b0\u09bf\u09ad\u09bf\u0989 \u0986\u09aa\u09a1\u09c7\u099f \u09b9\u09af\u09bc\u0964 \u0995\u09cb\u09a8\u09cb \u09a4\u09a5\u09cd\u09af \u0986\u09aa\u09a8\u09be\u09b0 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7\u09b0 \u09ac\u09be\u0987\u09b0\u09c7 \u09af\u09be\u09af\u09bc \u09a8\u09be\u0964',
    cssTitle: '\u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09be CSS', copyCss: 'CSS \u0995\u09aa\u09bf \u0995\u09b0\u09c1\u09a8', copied: '\u0995\u09aa\u09bf \u09b9\u09af\u09bc\u09c7\u099b\u09c7!',
    savedTitle: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b2\u09c7\u0986\u0989\u099f', saveLayout: '\u09b2\u09c7\u0986\u0989\u099f \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u0995\u09b0\u09c1\u09a8', export: 'JSON \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f', importLabel: 'JSON \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f',
    import: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f', clearSaved: '\u09b8\u09ac \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09ae\u09c1\u099b\u09c1\u09a8', savedEmpty: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09b2\u09c7\u0986\u0989\u099f \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u09a8\u09bf\u0964',
    containerTitle: '\u0995\u09a8\u09cd\u099f\u09c7\u0987\u09a8\u09be\u09b0 \u09a8\u09bf\u09af\u09bc\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3', itemTitle: '\u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09bf\u09a4 \u09ac\u09be\u0995\u09cd\u09b8',
    footer: '\u0985\u09ab\u09b2\u09be\u0987\u09a8 \u09b6\u09c7\u0996\u09be\u09b0 \u099f\u09c1\u09b2\u0964 Flexbox \u09ae\u09be\u09a8 CSS Flexible Box Layout \u09b8\u09cd\u09aa\u09c7\u09b8\u09bf\u09ab\u09bf\u0995\u09c7\u09b6\u09a8 \u0985\u09a8\u09c1\u09b8\u09b0\u09a3 \u0995\u09b0\u09c7; \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09ad\u09c7\u09a6\u09c7 \u09ab\u09b2\u09be\u09ab\u09b2 \u09b8\u09be\u09ae\u09be\u09a8\u09cd\u09af \u09ad\u09bf\u09a8\u09cd\u09a8 \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u0964',
    importOk: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b8\u09ab\u09b2 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', importBad: '\u0985\u09ac\u09c8\u09a7 \u09b2\u09c7\u0986\u0989\u099f JSON\u0964',
    savedDeleted: '\u09b8\u09ac \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b2\u09c7\u0986\u0989\u099f \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', load: '\u09b2\u09cb\u09a1', del: '\u09ae\u09c1\u099b\u09c1\u09a8', langBtn: 'English', namePh: '\u09b2\u09c7\u0986\u0989\u099f\u09c7\u09b0 \u09a8\u09be\u09ae'
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clampInt: clampInt, normalizeContainer: normalizeContainer, normalizeItem: normalizeItem,
    buildContainerCSS: buildContainerCSS, buildItemCSS: buildItemCSS, buildFullCSS: buildFullCSS,
    validateLayout: validateLayout, PRESETS: PRESETS, bnDigits: bnDigits, defaultContainer: defaultContainer, defaultItem: defaultItem };
  return;
}

var STATE_KEY = 'flexbox-playground-bd:state';
var SAVED_KEY = 'flexbox-playground-bd:saved';
var state = { lang: 'en', container: defaultContainer(), items: [defaultItem(), defaultItem(), defaultItem()], selected: 0 };
var saved = [];
function loadState() {
  try {
    var raw = localStorage.getItem(STATE_KEY);
    if (raw) { var p = JSON.parse(raw); if (p && p.container && Array.isArray(p.items)) { state.lang = p.lang === 'bn' ? 'bn' : 'en'; state.container = normalizeContainer(p.container); state.items = p.items.slice(0, 8).map(normalizeItem); state.selected = clampInt(p.selected, 0, state.items.length - 1, 0); } }
    var sraw = localStorage.getItem(SAVED_KEY);
    if (sraw) { var s = JSON.parse(sraw); if (Array.isArray(s)) saved = s.filter(function (x) { return x && validateLayout(x); }); }
  } catch (e) { /* corrupted storage: start fresh */ }
}
function persist() { try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); localStorage.setItem(SAVED_KEY, JSON.stringify(saved)); } catch (e) {} }
function $(id) { return document.getElementById(id); }
function t(key) { return I18N[state.lang][key] || I18N.en[key] || key; }

function render() {
  var c = state.container;
  $('direction').value = c.direction; $('wrap').value = c.wrap; $('justify').value = c.justify;
  $('alignItems').value = c.alignItems; $('alignContent').value = c.alignContent;
  $('gap').value = c.gap; $('gap-val').textContent = toDigits(c.gap, state.lang);
  $('itemCount').value = state.items.length; $('itemCount-val').textContent = toDigits(state.items.length, state.lang);
  var sel = $('selectedItem');
  sel.innerHTML = '';
  state.items.forEach(function (_, i) { var o = document.createElement('option'); o.value = String(i); o.textContent = toDigits(i + 1, state.lang); sel.appendChild(o); });
  sel.value = String(state.selected);
  var it = state.items[state.selected];
  $('grow').value = it.grow; $('shrink').value = it.shrink; $('order').value = it.order; $('alignSelf').value = it.alignSelf;
  var pv = $('preview');
  pv.style.display = 'flex'; pv.style.flexDirection = c.direction; pv.style.flexWrap = c.wrap;
  pv.style.justifyContent = c.justify; pv.style.alignItems = c.alignItems; pv.style.alignContent = c.alignContent; pv.style.gap = c.gap + 'px';
  pv.innerHTML = '';
  state.items.forEach(function (item, i) {
    var d = document.createElement('div');
    d.className = 'box' + (i === state.selected ? ' selected' : '');
    d.style.background = BOX_COLORS[i % BOX_COLORS.length];
    d.style.flex = item.grow + ' ' + item.shrink + ' 1 auto';
    d.style.order = String(item.order); d.style.alignSelf = item.alignSelf;
    d.textContent = toDigits(i + 1, state.lang);
    d.setAttribute('data-box', String(i));
    d.addEventListener('click', function () { state.selected = i; persist(); render(); });
    pv.appendChild(d);
  });
  $('css-out').textContent = buildFullCSS(c, state.items);
  renderSaved();
}
function renderSaved() {
  $('saved-empty').style.display = saved.length ? 'none' : 'block';
  var ul = $('saved-list'); ul.innerHTML = '';
  saved.forEach(function (s, i) {
    var li = document.createElement('li');
    var span = document.createElement('span'); span.textContent = s.name;
    var btns = document.createElement('span');
    var load = document.createElement('button'); load.type = 'button'; load.textContent = t('load');
    load.addEventListener('click', function () { state.container = normalizeContainer(s.container); state.items = s.items.map(normalizeItem); state.selected = 0; persist(); render(); });
    var del = document.createElement('button'); del.type = 'button'; del.textContent = t('del');
    del.addEventListener('click', function () { saved.splice(i, 1); persist(); render(); });
    btns.appendChild(load); btns.appendChild(del);
    li.appendChild(span); li.appendChild(btns); ul.appendChild(li);
  });
}
function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
  $('app-title').textContent = t('title'); $('app-sub').textContent = t('sub');
  $('h-container').textContent = t('containerTitle'); $('h-item').textContent = t('itemTitle');
  $('h-preview').textContent = t('previewTitle'); $('h-css').textContent = t('cssTitle'); $('h-saved').textContent = t('savedTitle');
  $('item-hint').textContent = t('itemHint'); $('preview-note').textContent = t('previewNote');
  $('footer-text').textContent = t('footer'); $('saved-empty').textContent = t('savedEmpty');
  $('lang-btn').textContent = t('langBtn'); $('layout-name').placeholder = t('namePh');
  document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
}
function applyPreviewSize() {
  var w = $('previewSize').value;
  var wrap = $('preview-wrap');
  wrap.classList.remove('narrow', 'tablet');
  if (w === '390') wrap.classList.add('narrow');
  if (w === '768') wrap.classList.add('tablet');
}
function syncFromControls() {
  state.container = normalizeContainer({
    direction: $('direction').value, wrap: $('wrap').value, justify: $('justify').value,
    alignItems: $('alignItems').value, alignContent: $('alignContent').value, gap: $('gap').value
  });
  var count = clampInt($('itemCount').value, 1, 8, state.items.length);
  while (state.items.length < count) state.items.push(defaultItem());
  state.items.length = count;
  state.selected = clampInt($('selectedItem').value, 0, count - 1, 0);
  state.items[state.selected] = normalizeItem({ grow: $('grow').value, shrink: $('shrink').value, order: $('order').value, alignSelf: $('alignSelf').value });
  persist(); render();
}
function init() {
  loadState();
  ['direction', 'wrap', 'justify', 'alignItems', 'alignContent'].forEach(function (id) { $(id).addEventListener('change', syncFromControls); });
  $('gap').addEventListener('input', syncFromControls);
  $('itemCount').addEventListener('input', syncFromControls);
  $('previewSize').addEventListener('change', applyPreviewSize);
  ['selectedItem', 'alignSelf'].forEach(function (id) { $(id).addEventListener('change', syncFromControls); });
  ['grow', 'shrink', 'order'].forEach(function (id) { $(id).addEventListener('input', syncFromControls); $(id).addEventListener('change', syncFromControls); });
  document.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = PRESETS[b.getAttribute('data-preset')];
      state.container = normalizeContainer(p.container);
      state.items = [];
      for (var i = 0; i < p.count; i++) state.items.push(p.items && p.items[i] ? normalizeItem(p.items[i]) : defaultItem());
      state.selected = 0; persist(); render();
    });
  });
  $('reset-btn').addEventListener('click', function () {
    state.container = defaultContainer(); state.items = [defaultItem(), defaultItem(), defaultItem()]; state.selected = 0; persist(); render();
  });
  $('lang-btn').addEventListener('click', function () { state.lang = state.lang === 'en' ? 'bn' : 'en'; persist(); applyLang(); render(); });
  $('copy-btn').addEventListener('click', function () {
    var text = $('css-out').textContent;
    function done() { $('copy-msg').textContent = t('copied'); }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done).catch(done); } else { done(); }
  });
  $('save-btn').addEventListener('click', function () {
    var name = $('layout-name').value.trim() || ('Layout ' + (saved.length + 1));
    saved.push({ name: name, container: state.container, items: state.items });
    $('layout-name').value = ''; persist(); render();
  });
  $('export-btn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify({ container: state.container, items: state.items }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'flexbox-layout.json'; a.click();
  });
  $('import-btn').addEventListener('click', function () {
    try {
      var obj = JSON.parse($('import-text').value);
      if (!validateLayout(obj)) throw new Error('invalid');
      state.container = normalizeContainer(obj.container); state.items = obj.items.map(normalizeItem); state.selected = 0;
      $('import-msg').textContent = t('importOk'); persist(); render();
    } catch (e) { $('import-msg').textContent = t('importBad'); }
  });
  $('clear-btn').addEventListener('click', function () { saved = []; $('import-msg').textContent = t('savedDeleted'); persist(); render(); });
  applyLang(); applyPreviewSize(); render();
}
document.addEventListener('DOMContentLoaded', init);
})();
