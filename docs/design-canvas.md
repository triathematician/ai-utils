# Design Canvas — UI Guidelines

Guidelines for building **design-canvas** apps in this repo. Design-canvas is a design category: precise, single-file visual layout and design tools with direct canvas interaction. No template — start from `display-wall/display-wall.html` and strip to what you need. All guidelines below are inspiration; adapt freely to the app's needs.

---

## Philosophy

- **Visual-first.** The canvas is the primary interface. Controls and chrome are minimal — keep them out of the way and maximise design space.
- **Single HTML file.** No build step. External libs (e.g. Three.js) loaded via CDN only when genuinely needed.
- **Precision aesthetic.** Tight borders, monospace UI text, muted grid overlays. The UI should feel like a pro tool, not a consumer app. Dark themes work well; use whatever palette fits.
- **No persistence required.** State lives in memory. Use `localStorage` only if the app genuinely needs to survive page refresh.

---

## Color & Theme

`display-wall.html` uses a near-black dark palette as a starting point — adapt to taste:

```css
:root {
  --bg:           #0a0b0e;   /* page / renderer background */
  --surface:      #0f1116;   /* card / panel backgrounds */
  --surface2:     #161a22;   /* inset / cell backgrounds */
  --border:       #1e2330;   /* subtle borders */
  --border-bright:#2e3650;   /* hover / active borders */
  --accent:       #4af0c8;   /* primary highlight */
  --accent3:      #f05c7b;   /* destructive / danger */
  --text:         #e8ecf5;   /* primary text */
  --text-dim:     #5a6380;   /* secondary text */
  --text-dimmer:  #2e3450;   /* ghost / placeholder text */
}
```

Use a single accent color for interactive states and a second only for destructive actions. Minimal color — the design subject should be the visual focus, not the chrome.

---

## Background Texture

A faint grid overlay reinforces the precision aesthetic without distracting from the canvas content:

```css
body::before {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(74,240,200,0.012) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74,240,200,0.012) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

Adjust the grid color and opacity to suit your palette.

---

## Typography

`display-wall.html` uses `JetBrains Mono` for all UI text and `Syne` (800) for the app name/branding — both via Google Fonts. The key vibes:

- Tiny type — labels at `7–9px`, buttons at `8px`, status at `9–10px`. Let the canvas breathe.
- `letter-spacing: 0.1–0.3em` on uppercase labels.
- Monospace keeps the tool feel without being terminal-heavy.

Swap fonts as needed; the small sizing and generous spacing matter more than the specific typeface.

---

## Layout

`display-wall.html` splits the viewport 50/50 between a 2D canvas area and a 3D preview — adjust proportions to suit:

```css
--half: 50vh;
#top-half { height: var(--half); }   /* 2D canvas / grid interaction */
#bot-half  { height: var(--half); }  /* 3D preview or secondary view */
```

All interactive canvases use `position: absolute; inset: 0; width: 100%; height: 100%`. Recompute sizes on `window.resize` (debounce ~60 ms).

### Chrome pattern

Keep chrome compact — a narrow topbar, a bottombar for status/actions, and a hints strip. The canvas fills everything in between.

---

## Component Patterns

### Buttons

Minimal — ghost style by default, accent color only on hover. Keep count low.

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

- [ ] Start from `display-wall/display-wall.html` — cherry-pick the CSS variables, background texture, fonts, and chrome you need
- [ ] Adapt the color palette freely; keep accent usage minimal so the canvas stays the focus
- [ ] Use tiny monospace type for all chrome; generous sizing on the canvas itself
- [ ] Split into halves or adapt proportions — canvas fills the bulk of the viewport
- [ ] Implement `#toast` and `toast()` for all user feedback — never `alert()`
- [ ] Show keyboard shortcuts in a hints strip using `<kbd>` — never `title` attributes
- [ ] Add rubber-band selection if the app has selectable items
- [ ] Add `#ctx-menu` only if right-click actions add real value
- [ ] Load CDN libraries (Three.js, etc.) only when the feature genuinely requires them
- [ ] Handle `window.resize` with a short debounce; recompute all canvas/cell dimensions
