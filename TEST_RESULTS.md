# Test results — flexbox-playground-bd

Run date: 2026-11-03 (Asia/Dhaka). All results are real runs, not estimates.

## Node unit tests — 8/8 passed

`node tests/test.js`

- Default container CSS matches exactly (row, nowrap, flex-start, stretch,
  stretch, gap 12px).
- Column + center + gap 24 renders the expected declarations.
- Invalid direction/wrap/justify/align values fall back to defaults; gap 99
  clamps to 40, gap -5 clamps to 0, non-numeric gap falls back to 12.
- Per-box CSS: grow 2 / shrink 0 / order -1 / align-self center renders
  `flex: 2 0 1 auto; order: -1; align-self: center;`; out-of-range values
  clamp (grow 9 -> 3, order 99 -> 5, bogus align-self -> auto).
- Full CSS contains exactly one rule per box (2 boxes -> .item-1, .item-2,
  no .item-3).
- Presets verified: centered = 1 box + justify center; navbar =
  space-between; sidebar second box grow 1; card row gap 16; column stack
  direction column.
- validateLayout: accepts a good layout; rejects empty items, 9 items,
  gap 41, bogus direction, grow 4, null, and non-object input.
- Bangla digits: 2026 -> Bengali digits, 12 -> Bengali digits.

## Headless-Chrome smoke tests — 15/15 passed, 0 console/page errors

`node tests/smoke.mjs` (raw CDP, /opt/meta-chromium/chrome, file://)

- Title renders; default 3 boxes; default CSS row + gap 12px; saved-empty
  state visible.
- Direction column: computed preview flex-direction is column and CSS
  contains `flex-direction: column;`.
- Gap 24: CSS contains `gap: 24px;`.
- Navbar preset: 4 boxes and `justify-content: space-between;`.
- Selected box 2, grow 2: CSS contains `.item-2 { flex: 2 1 1 auto;`.
- Invalid import (`not json{{{`) rejected with an "Invalid" message and
  the layout untouched.
- Valid import (column, center, 2 boxes, second box grow 1) applied:
  2 boxes, column CSS, `.item-2 { flex: 1 1 1 auto;`.
- Save layout "My Test Layout" appears in the list and persists after a
  page reload (localStorage).
- Bangla toggle changes the app title out of English and the language
  button label becomes "English".
- Mobile preview (390px option) adds the narrow class and the preview wrap
  measures at most 430px wide.
- Zero console/page errors across the whole run.

## Repairs

- One test-side fix only: the unit test first expected gap 99 to reset to
  the default 12; the app correctly clamps to the maximum 40. The test was
  corrected; no app code changed for it.
- No app-logic bugs found in either suite.

## Pages build fix

The first GitHub Pages build failed because Jekyll tried to process
TEST_RESULTS.md and tripped on a `{{{` sequence in the invalid-import test
description. Fix: an empty `.nojekyll` file at the repo root tells GitHub
Pages to serve the static files as-is without Jekyll processing. No app
code changed for this fix.

## Source hygiene

All shipped sources are pure ASCII (Bangla UI strings are `\uXXXX` escapes
in app.js, verified with grep); no network requests are made at runtime.
