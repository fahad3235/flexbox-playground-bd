// Node unit tests for flexbox-playground-bd pure logic (app.js exports).
const assert = require('node:assert');
const m = require('../app.js');
let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS - ' + name); }

// Container CSS: exact default string
check('default container CSS exact', () => {
  const css = m.buildContainerCSS(m.defaultContainer());
  assert.strictEqual(css, '.container {\n  display: flex;\n  flex-direction: row;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-items: stretch;\n  align-content: stretch;\n  gap: 12px;\n}');
});
// Column + center + gap 24
check('column centered gap 24', () => {
  const css = m.buildContainerCSS({ direction: 'column', wrap: 'wrap', justify: 'center', alignItems: 'center', alignContent: 'center', gap: 24 });
  assert.ok(css.includes('flex-direction: column;'));
  assert.ok(css.includes('justify-content: center;'));
  assert.ok(css.includes('gap: 24px;'));
});
// Invalid values fall back to defaults; gap clamped
check('normalize invalid + gap clamp', () => {
  const c = m.normalizeContainer({ direction: 'diagonal', wrap: 'x', justify: 'x', alignItems: 'x', alignContent: 'x', gap: 99 });
  assert.strictEqual(c.direction, 'row');
  assert.strictEqual(c.gap, 40); // clamped to max, not reset to default
  assert.deepStrictEqual(m.normalizeContainer({ direction: 'diagonal', wrap: 'x', justify: 'x', alignItems: 'x', alignContent: 'x', gap: 12 }), m.defaultContainer());
  assert.strictEqual(m.normalizeContainer({ gap: -5 }).gap, 0);
  assert.strictEqual(m.normalizeContainer({ gap: 'abc' }).gap, 12);
});
// Item CSS
check('item CSS grow/shrink/order/align-self', () => {
  assert.strictEqual(m.buildItemCSS({ grow: 2, shrink: 0, order: -1, alignSelf: 'center' }), 'flex: 2 0 1 auto; order: -1; align-self: center;');
  assert.strictEqual(m.buildItemCSS({ grow: 9, shrink: 9, order: 99, alignSelf: 'bogus' }), 'flex: 3 3 1 auto; order: 5; align-self: auto;');
});
// Full CSS contains container + one rule per item
check('full CSS item count', () => {
  const css = m.buildFullCSS(m.defaultContainer(), [m.defaultItem(), m.defaultItem()]);
  assert.ok(css.includes('.item-1 { flex: 0 1 1 auto; order: 0; align-self: auto; }'));
  assert.ok(css.includes('.item-2 {'));
  assert.ok(!css.includes('.item-3'));
});
// Presets
check('presets: centered 1 box, navbar space-between, sidebar grow', () => {
  assert.strictEqual(m.PRESETS.centered.count, 1);
  assert.strictEqual(m.PRESETS.centered.container.justify, 'center');
  assert.strictEqual(m.PRESETS.navbar.container.justify, 'space-between');
  assert.strictEqual(m.PRESETS.sidebar.items[1].grow, 1);
  assert.strictEqual(m.PRESETS.cardRow.container.gap, 16);
  assert.strictEqual(m.PRESETS.columnStack.container.direction, 'column');
});
// Validation
check('validateLayout accepts good, rejects bad', () => {
  const good = { container: m.defaultContainer(), items: [m.defaultItem()] };
  assert.strictEqual(m.validateLayout(good), true);
  assert.strictEqual(m.validateLayout({ container: m.defaultContainer(), items: [] }), false);
  assert.strictEqual(m.validateLayout({ container: m.defaultContainer(), items: Array(9).fill(m.defaultItem()) }), false);
  assert.strictEqual(m.validateLayout({ container: { ...m.defaultContainer(), gap: 41 }, items: [m.defaultItem()] }), false);
  assert.strictEqual(m.validateLayout({ container: { ...m.defaultContainer(), direction: 'diagonal' }, items: [m.defaultItem()] }), false);
  assert.strictEqual(m.validateLayout({ container: m.defaultContainer(), items: [{ grow: 4, shrink: 1, order: 0, alignSelf: 'auto' }] }), false);
  assert.strictEqual(m.validateLayout(null), false);
  assert.strictEqual(m.validateLayout('nope'), false);
});
// Bengali digits
check('bnDigits 2026 and 12', () => {
  assert.strictEqual(m.bnDigits('2026'), '\u09e8\u09e6\u09e8\u09ec');
  assert.strictEqual(m.bnDigits(12), '\u09e7\u09e8');
});
console.log('UNIT ' + passed + '/' + passed + ' passed');
