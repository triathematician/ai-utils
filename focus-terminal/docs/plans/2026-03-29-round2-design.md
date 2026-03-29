# Focus Terminal Round 2 — Design
**Date:** 2026-03-29

## Scope

8 items: 6 bug fixes / small features, 1 design system addition, 1 documentation artifact.

---

## Section 1: Bug Fixes & Small Features

### 1. Balance grid squares — render as `■` characters

**Problem:** `.sq` spans use hardcoded `7px × 7px` pixel dimensions, visually mismatched with the score-line `■` character which is font-sized.

**Fix:** Render each colored square as a `■` Unicode character — identical to the score-line character. Both sides of the row now use the same font, same size, natural line-height alignment.

CSS changes:
- `.sq`: remove `width`, `height`, `display: inline-block` → `display: inline`
- `.sq-imp-today`, `.sq-imp-week`, `.sq-nim-today`, `.sq-nim-week`: switch from `background` to `color`
- `.sq-nim-week`: remove `border: 1px solid var(--dim)`

JS change in `addSqItems`:
- `s.textContent = '■'`
- Remove `s.title = item.text`
- Call `addTooltip(s, item)` — same instant custom overlay used by Eisenhower matrix items

### 2. Remove NIM-WEEK legend border

**Problem:** The legend span for NIM-WEEK has `border:1px solid var(--dim); display:inline-block; line-height:1` wrapping the full text — creates a visible box around "NIM-WEEK ■".

**Fix:** Remove those inline styles from the span. Keep `color: var(--grid-notimportant-week)` as-is. Low contrast on dark themes is intentional — lowest priority category is visually de-emphasized.

### 3 & 4. Popup / help overlay width

**Problem:** Both overlays use `min-width: 400px; max-width: 560px`, which truncates longer backlog items and help text.

**Fix:** `min-width: 640px; max-width: min(90vw, 960px)` — uses viewport units to stay within screen on small displays.

The help overlay is the only overlay (it handles both `/help` and `/backlog list`) so one change covers both.

### 5. `/theme` with no argument picks a random theme

**Problem:** `/theme` alone shows a list of theme names. Not useful — user already knows themes from `/help`.

**Fix:** When `name` is empty in `setTheme()`, pick randomly from the 6 valid themes excluding the current theme. Apply and confirm with status message.

### 6. Backlog done/fixed tracking

**Data model:** Add `done: false` to each backlog item on creation. Migration guard in `handleBacklog` treats missing `done` as `false`.

**Commands:**
- `/backlog done [n]` — toggles `done` on item at 1-based index `n`; status confirms
- `/backlog list` — shows `[x]` prefix for done items, `[ ]` for pending
- `/backlog export` — uses `- [x]` for done items, `- [ ]` for pending (already-standard markdown task syntax)

---

## Section 2: Categorical Color Palette

### Overview

10 CSS variables `--cat-1` through `--cat-10` added to `:root` and each `[data-theme]` block. Purpose: data visualization, item tagging, and cross-app design tokens for the focus-terminal ecosystem.

### Palettes

**Legacy** (dark CRT amber — high contrast neons):
```css
--cat-1: #ffb000;  /* amber — primary */
--cat-2: #ff4444;  /* red */
--cat-3: #ff8800;  /* orange */
--cat-4: #00ff41;  /* matrix green */
--cat-5: #00bbff;  /* cyan */
--cat-6: #aa44ff;  /* purple */
--cat-7: #ff44aa;  /* pink */
--cat-8: #ffff44;  /* yellow */
--cat-9: #00ffaa;  /* teal */
--cat-10: #ffffff; /* white */
```

**Solar** (solarized — canonical palette):
```css
--cat-1: #b58900;  /* yellow */
--cat-2: #cb4b16;  /* orange */
--cat-3: #dc322f;  /* red */
--cat-4: #d33682;  /* magenta */
--cat-5: #6c71c4;  /* violet */
--cat-6: #268bd2;  /* blue */
--cat-7: #2aa198;  /* cyan */
--cat-8: #859900;  /* green */
--cat-9: #657b83;  /* base0 */
--cat-10: #93a1a1; /* base1 */
```

**Monk** (light bg — dark readable tones):
```css
--cat-1: #2a2a2a;  /* near-black */
--cat-2: #aa2200;  /* dark red */
--cat-3: #005588;  /* dark blue */
--cat-4: #336600;  /* dark green */
--cat-5: #884400;  /* dark orange */
--cat-6: #550055;  /* dark purple */
--cat-7: #006666;  /* dark teal */
--cat-8: #7a5000;  /* brown */
--cat-9: #555500;  /* olive */
--cat-10: #003344; /* dark navy */
```

**Space** (dark navy — neon):
```css
--cat-1: #00ffff;  /* cyan */
--cat-2: #ff00aa;  /* hot pink */
--cat-3: #00ff88;  /* green */
--cat-4: #ffff00;  /* yellow */
--cat-5: #ff6060;  /* coral */
--cat-6: #7788ff;  /* blue */
--cat-7: #aa66ff;  /* purple */
--cat-8: #ffffff;  /* white */
--cat-9: #00ccff;  /* sky blue */
--cat-10: #ff8800; /* orange */
```

**Synth** (dark purple — neon synthwave):
```css
--cat-1: #ff00ff;  /* magenta — primary */
--cat-2: #00ffff;  /* cyan */
--cat-3: #00ff88;  /* green */
--cat-4: #ffaa00;  /* amber */
--cat-5: #ff0066;  /* hot pink */
--cat-6: #6600ff;  /* deep purple */
--cat-7: #ff6600;  /* orange */
--cat-8: #00aaff;  /* sky blue */
--cat-9: #ffff00;  /* yellow */
--cat-10: #ff44aa; /* pink */
```

**DOS** (blue bg — CGA bright):
```css
--cat-1: #ffffff;  /* white */
--cat-2: #55ffff;  /* bright cyan */
--cat-3: #55ff55;  /* bright green */
--cat-4: #ff5555;  /* bright red */
--cat-5: #ffff55;  /* bright yellow */
--cat-6: #ff55ff;  /* bright magenta */
--cat-7: #5555ff;  /* bright blue */
--cat-8: #aaaaaa;  /* light grey */
--cat-9: #ffaa55;  /* orange */
--cat-10: #55aaaa; /* teal */
```

---

## Section 3: UI Guidelines Document

### Location

`docs/ui-guidelines.md` — committed to repo, no in-app command needed.

### Structure

1. **Philosophy** — local-first, no build step, single HTML file, terminal aesthetic
2. **Theme system** — CSS variable architecture, how to extend themes, theme names and their character
3. **Categorical palette** — `--cat-1..10` purpose, contrast rules, when to use which slot
4. **Typography** — font stack per theme, `--font-size` base, em-based scaling
5. **Layout patterns** — 3-row grid, panel structure, border conventions, header format (`◈ LABEL`)
6. **Component patterns** — overlays (shared help/content popup), console row, boot sequence log types, tooltip
7. **Terminal interaction conventions** — command syntax (`/cmd [arg]`), status messages, boot log levels (`sys/ask/ans/info/warn/sep`)
8. **Building a new app in the ecosystem** — checklist: which CSS variables to inherit, how to structure the HTML shell, how to wire the console, how to register theme support

---

## Constraints

- Single HTML file, no build step
- All state in localStorage
- All new CSS uses existing variable system
- No new external dependencies
