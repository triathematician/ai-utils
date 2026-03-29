# Design Canvas — UI Guidelines

Guidelines for building **design-canvas** apps in this repo. Design-canvas is a design category: dark, precise, single-file visual layout and design tools with direct canvas interaction. No template — start from `display-wall/display-wall.html` and strip to what you need.

---

## Philosophy

- **Visual-first.** The canvas is the primary interface. Controls and chrome are minimal, kept out of the way.
- **Single HTML file.** No build step. External libs (e.g. Three.js) loaded via CDN only when genuinely needed.
- **Dark precision aesthetic.** Near-black backgrounds, tight borders, monospace UI text, muted grid overlays. Feels like a pro tool.
- **No persistence required.** State lives in memory. Use `localStorage` only if the app genuinely needs to survive page refresh.

---

## Color & Theme

Single fixed dark theme — no theme switcher.

```css
:root {
  --bg:           #0a0b0e;   /* page / renderer background */
  --surface:      #0f1116;   /* card / panel backgrounds */
  --surface2:     #161a22;   /* inset / cell backgrounds */
  --border:       #1e2330;   /* subtle borders */
  --border-bright:#2e3650;   /* hover / active borders */
  --accent:       #4af0c8;   /* primary highlight (teal) */
  --accent3:      #f05c7b;   /* destructive / danger */
  --text:         #e8ecf5;   /* primary text */
  --text-dim:     #5a6380;   /* secondary text */
  --text-dimmer:  #2e3450;   /* ghost / placeholder text */
}
```

Teal (`--accent`) is the single interactive colour. Use `--accent3` only for destructive actions.

---

## Background Texture

Apply a faint grid overlay to the page via `body::before`:

```css
body::before {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(74,240,200,0.012) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74,240,200,0.012) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

---

## Typography

- **UI text:** `JetBrains Mono` — all labels, buttons, status, hints.
- **Display / branding:** `Syne` (weight 700–800) — app name, section headers.
- Load both from Google Fonts.
- Tiny sizes throughout: labels at `7–9px`, buttons at `8px`, status at `9–10px`.
- Use `letter-spacing: 0.1–0.3em` on uppercase labels.

---

## Layout

Split the viewport into two equal halves (or adjust as needed):

```css
--half: 50vh;
#top-half { height: var(--half); }   /* 2D canvas / grid interaction */
#bot-half  { height: var(--half); }  /* 3D preview or secondary canvas */
```

All interactive canvases use `position: absolute; inset: 0; width: 100%; height: 100%`. Recompute sizes on `window.resize` (debounce ~60 ms).

### Top-half chrome

```
┌─ topbar: app name · dimensions · config summary ──────────┐
│  canvas / grid area (fills available space)               │
├─ bottombar: status text          [Action] [Danger Btn] ───┤
│  hints strip: Drag — select  Ctrl+V — paste  …            │
└───────────────────────────────────────────────────────────┘
```

---

## Component Patterns

### Buttons

```css
.btn {
  background: transparent; border: 1px solid var(--border-bright);
  color: var(--text-dim); font-family: 'JetBrains Mono', monospace;
  font-size: 8px; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 4px 10px; border-radius: 3px; cursor: pointer;
}
.btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(74,240,200,0.05); }
.btn.danger:hover { border-color: var(--accent3); color: var(--accent3); background: rgba(240,92,123,0.05); }
```

### Keyboard hints strip

Show all shortcuts below the canvas as `<kbd>` elements. Never use native `title` tooltips.

```html
<div id="hints">
  <div class="hint"><kbd>Ctrl+V</kbd> — paste</div>
  <div class="hint">Drag — select</div>
  …
</div>
```

### Toast (feedback)

One fixed `#toast` element. Auto-dismisses after ~2 s. Never use `alert()`.

```javascript
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2000);
}
```

### Rubber-band selection

Track `mousedown`/`mousemove`/`mouseup` on the canvas container. Render a fixed `#rubber-band` div; hit-test elements on every `mousemove`.

```css
#rubber-band {
  position: fixed; display: none; border-radius: 2px; pointer-events: none; z-index: 100;
  border: 1.5px solid var(--accent); background: rgba(74,240,200,0.06);
}
```

### Context menu

Single `#ctx-menu` element, shown on `contextmenu` event. Dismiss on `click` or `Escape`.

```css
#ctx-menu {
  position: fixed; background: var(--surface); border: 1px solid var(--border-bright);
  border-radius: 5px; padding: 3px 0; display: none; min-width: 155px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.7);
}
```

---

## Building a New App in This Ecosystem

- [ ] Start from `display-wall/display-wall.html` — copy the CSS variables, background texture, fonts, and chrome skeleton
- [ ] Keep a single fixed dark theme; do not add a theme switcher
- [ ] Use `JetBrains Mono` for UI text, `Syne` for display headings
- [ ] Split into two halves (`--half: 50vh`) or adapt proportions as needed
- [ ] Implement `#toast` and `toast()` for all user feedback
- [ ] Show keyboard shortcuts in a hints strip using `<kbd>` — never `title` attributes
- [ ] Add rubber-band selection if the app has selectable items
- [ ] Add `#ctx-menu` only if right-click actions add real value
- [ ] Load CDN libraries (Three.js, etc.) only when the feature genuinely requires them
- [ ] Handle `window.resize` with a short debounce; recompute all canvas/cell dimensions
