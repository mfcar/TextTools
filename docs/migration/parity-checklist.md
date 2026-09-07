# TextTools — Migration Parity Checklist

Reference for the Angular 13 → 22 rebuild. Every item below exists in the current (Angular 13) app and must still work in the rebuilt app. Derived from the current source; live screenshots were intentionally skipped (the old app does not build reliably on Node 24).

## Tools (24) — each takes the current buffer as input and overwrites it with the output

Verify each produces identical output to the old app for representative inputs, **plus** the new edge-case handling noted in the plan.

### Encodings

- [ ] Base64 Encode — string → base64 (new: UTF-8-safe, incl. non-Latin1)
- [ ] Base64 Decode — base64 → string (new: invalid input → error, no crash)
- [ ] Binary Encode — string → binary
- [ ] Binary Decode — binary → string (new: invalid input → error)
- [ ] Hexadecimal Encode — string → hex
- [ ] Hexadecimal Decode — hex → string (new: invalid input → error)
- [ ] UTF8 Encode — encode to UTF-8 (new: replace deprecated `unescape`)
- [ ] UTF8 Decode — decode UTF-8
- [ ] URLEncode — encode special characters
- [ ] URLDecode — decode special characters
- [ ] Escape — characters → HTML entities

### Case / format

- [ ] Uppercase
- [ ] Lowercase
- [ ] Camel Case
- [ ] Kebab Case
- [ ] Snake Case
- [ ] Deburr — strip accents/special chars

### Line / string ops

- [ ] Sort Lines Asc
- [ ] Sort Lines Desc
- [ ] Text Reverser
- [ ] Trim — trim both sides
- [ ] Split — params: `separator` (default `-`), `limit` (default 2)
- [ ] Repeat — param: `n` (default 3)
- [ ] Minify JSON — (new: invalid JSON → friendly error)

## App behaviors

- [ ] Single editor buffer with live char count + line count (new: multi-tab; grapheme-aware count)
- [ ] Command palette opens via button and keyboard shortcut (old: `Ctrl+Shift+F`)
- [ ] Palette search filters by name/description (accent-insensitive)
- [ ] Tools with parameters prompt for parameter values before running
- [ ] Command list sidebar shows all tools (name/icon/description)
- [ ] History sidebar lists executed commands (new: live-updating, undo/replay)
- [ ] Copy buffer to clipboard
- [ ] Download buffer as a file (name/extension/charset)
- [ ] Rename the canvas/tab

## New in the rebuild (not in old app)

- [ ] Multiple tabs/documents (create, switch, rename, close)
- [ ] Light/dark theme
- [ ] Responsive layout (mobile) + labeled, accessible editor
- [ ] Installable PWA, works offline; tabs/history persist across refresh
