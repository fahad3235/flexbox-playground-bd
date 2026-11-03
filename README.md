# Flexbox Playground BD

A free, fully offline, bilingual (English/Bangla) interactive playground for
learning CSS Flexbox. Change container and item settings, watch a live
preview update instantly, and copy the generated CSS into your own project.

Live demo (after Pages is enabled): https://fahad3235.github.io/flexbox-playground-bd/

## Problem

Flexbox is one of the first layout tools every web student must learn, but
reading property tables does not build intuition. This playground closes that
gap: every control maps to exactly one CSS property, the preview reacts
immediately, and the generated stylesheet shows precisely what changed.

## Features

1. **Container controls** — flex-direction, flex-wrap, justify-content,
   align-items, align-content, and gap (0-40 px).
2. **Live preview** — 1-8 coloured boxes that re-layout instantly; click a
   box to select it.
3. **Per-box controls** — flex-grow (0-3), flex-shrink (0-3), order (-5 to 5),
   and align-self for the selected box.
4. **Presets** — Centered box, Navbar, Card row, Sidebar + content, and
   Column stack, each setting container and box values in one click.
5. **Generated CSS** — container stylesheet plus one rule per box, with a
   Copy CSS button.
6. **Saved layouts** — save named layouts in localStorage, load or delete
   them, and export/import layouts as JSON with strict validation
   (malformed imports are rejected with the current layout untouched).
7. **Bilingual UI + responsive preview** — English/Bangla toggle persisted
   in localStorage (Bangla digits when Bangla is active), plus Full /
   Tablet (768 px) / Mobile (390 px) preview widths.

## Stack

- Vanilla HTML, CSS, and JavaScript — no framework, no build step.
- No network requests at runtime: the app works fully offline from a static
  file host or a local file.
- All user data stays in the browser's localStorage.

## Prerequisites

Any modern browser. For running the tests, Node.js 18+.

## Run locally

```sh
# Open the app (no server needed):
#   index.html
# Or serve it:
npx serve .
```

## Development commands

```sh
node --check app.js
node tests/test.js        # Node unit tests
node tests/smoke.mjs      # headless-Chrome smoke tests (uses /opt/meta-chromium/chrome on this VM)
```

## Testing

- `tests/test.js`: 8/8 unit tests — exact default container CSS, column/center
  math, invalid-value fallbacks and gap clamping, per-box CSS, full-CSS item
  rules, all five presets, strict layout validation, and Bangla digits.
- `tests/smoke.mjs`: 15/15 headless-Chrome checks — default render, direction
  and gap updates, navbar preset, per-box grow, invalid/valid JSON import,
  save + reload persistence, Bangla toggle, mobile preview width, and zero
  console/page errors.
- See `TEST_RESULTS.md` for the full hand-verified results.

## Deployment

Static site. Enable GitHub Pages on the `main` branch, root folder, and the
app serves from the repository root (`index.html`).

## Limitations

- The preview uses fixed-size coloured boxes, so it demonstrates layout
  behaviour, not a complete page design.
- Generated CSS uses `flex: <grow> <shrink> 1 auto` shorthand for boxes;
  the `1 auto` basis keeps boxes visible at their content size.
- Browser rendering of flex layout may vary very slightly between engines;
  the values themselves follow the CSS Flexible Box Layout specification.
- Copy CSS uses the Clipboard API when available and otherwise still
  reports success after selecting the generated text path in code; in
  sandboxed iframes clipboard permission may be denied, in which case the
  user can select the code block manually.

## Status

MVP complete. Offline, tested, and ready to use.
