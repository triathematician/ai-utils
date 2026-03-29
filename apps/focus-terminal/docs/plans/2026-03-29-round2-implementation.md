# Focus Terminal Round 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 6 bugs/small features, add per-theme categorical color palette, and write an ecosystem UI guidelines doc.

**Architecture:** Single HTML file (`focus-terminal/focus-terminal.html`). All CSS and JS inline. No build step. State in localStorage. No test framework — verification is manual browser inspection. Guidelines doc is a plain markdown file at `docs/ui-guidelines.md`.

**Tech Stack:** Vanilla HTML/CSS/JS, localStorage, Google Fonts.

---

## Reference: Key Locations

- `.sq` CSS: line 340
- `.sq-*` color classes: lines 346–349
- Balance grid legend HTML: line 631
- Help overlay HTML (width inline style): line 671
- `addSqItems` function body: lines 1253–1260
- `handleBacklog()`: lines 1554–1570
- `exportBacklog()`: lines 1572–1578
- `setTheme()`: lines 1595–1605
- `:root` CSS vars block: line 13
- Each `[data-theme="X"]` block: lines 34, 53, 72, 91, 110

---

## Task 1: Balance grid squares — render as `■` characters with `addTooltip`

**File:** `focus-terminal/focus-terminal.html`

### Step 1: Rewrite `.sq` and `.sq-*` CSS (lines 340–349)

Find:
```css
.sq {
  width: 7px;
  height: 7px;
  display: inline-block;
  flex-shrink: 0;
}
.sq-imp-today { background: var(--grid-important-today); }
.sq-imp-week  { background: var(--grid-important-week); }
.sq-nim-today { background: var(--grid-notimportant-today); }
.sq-nim-week  { background: var(--grid-notimportant-week); border: 1px solid var(--dim); }
```

Replace with:
```css
.sq { display: inline; flex-shrink: 0; cursor: default; }
.sq-imp-today { color: var(--grid-important-today); }
.sq-imp-week  { color: var(--grid-important-week); }
.sq-nim-today { color: var(--grid-notimportant-today); }
.sq-nim-week  { color: var(--grid-notimportant-week); }
```

### Step 2: Rewrite `addSqItems` (lines 1253–1260)

Find:
```javascript
    const addSqItems = (cls, items) => {
      items.forEach(item => {
        const s = document.createElement('span');
        s.className = 'sq '+cls;
        s.title = item.text;
        sqs.appendChild(s);
      });
    };
```

Replace with:
```javascript
    const addSqItems = (cls, items) => {
      items.forEach(item => {
        const s = document.createElement('span');
        s.className = 'sq '+cls;
        s.textContent = '■';
        addTooltip(s, item);
        sqs.appendChild(s);
      });
    };
```

### Step 3: Verify

Open in browser. Balance grid colored squares should now be `■` characters, same visual size as the score-line `■`. Hovering a square should show the instant custom tooltip overlay (no browser delay) with item text, dimension, quadrant, etc. — identical to hovering a matrix item.

### Step 4: Commit
```bash
cd D:/code/ai-utils/focus-terminal
git add focus-terminal.html
git commit -m "fix: balance grid squares use ■ char + addTooltip for instant overlay"
```

---

## Task 2: Remove NIM-WEEK legend border

**File:** `focus-terminal/focus-terminal.html`

### Step 1: Find the legend HTML (line 631)

Find:
```html
<span style="color:var(--grid-notimportant-week);border:1px solid var(--dim);display:inline-block;line-height:1">NIM-WEEK ■</span>
```

Replace with:
```html
<span style="color:var(--grid-notimportant-week)">NIM-WEEK ■</span>
```

### Step 2: Verify

Balance grid legend should show four colored labels with no box around NIM-WEEK.

### Step 3: Commit
```bash
git add focus-terminal.html
git commit -m "fix: remove border box from NIM-WEEK balance grid legend"
```

---

## Task 3: Widen help/backlog overlay

**File:** `focus-terminal/focus-terminal.html`

### Step 1: Find the overlay inner div (line 671)

Find:
```html
  <div style="background:var(--bg);border:1px solid var(--border);padding:16px 20px;min-width:400px;max-width:560px;width:90%;font-family:var(--font);color:var(--fg);font-size:0.9em;">
```

Replace with:
```html
  <div style="background:var(--bg);border:1px solid var(--border);padding:16px 20px;min-width:640px;max-width:min(90vw,960px);width:90%;font-family:var(--font);color:var(--fg);font-size:0.9em;">
```

### Step 2: Verify

Type `/help` — overlay should be wider, commands visible without wrapping. Type `/backlog [text]` a few times with long strings, then `/backlog list` — items should be fully visible.

### Step 3: Commit
```bash
git add focus-terminal.html
git commit -m "fix: widen help/backlog overlay to 640px min, 960px max"
```

---

## Task 4: `/theme` with no argument picks a random theme

**File:** `focus-terminal/focus-terminal.html`

### Step 1: Find `setTheme()` (lines 1595–1605)

```javascript
function setTheme(name) {
  const valid = ['legacy','solar','monk','space','synth','dos'];
  const themes = {legacy:'',solar:'solar',monk:'monk',space:'space',synth:'synth',dos:'dos'};
  if (!valid.includes(name)) {
    statusMsg(`Themes: ${valid.join(' | ')}`); return;
  }
  db.theme = name;
  document.documentElement.setAttribute('data-theme', themes[name]);
  saveDB();
  statusMsg(`Theme: ${name}`);
}
```

Replace with:
```javascript
function setTheme(name) {
  const valid = ['legacy','solar','monk','space','synth','dos'];
  const themes = {legacy:'',solar:'solar',monk:'monk',space:'space',synth:'synth',dos:'dos'};
  if (!name) {
    const others = valid.filter(t => t !== (db.theme||'legacy'));
    name = others[Math.floor(Math.random() * others.length)];
  }
  if (!valid.includes(name)) {
    statusMsg(`Themes: ${valid.join(' | ')}`); return;
  }
  db.theme = name;
  document.documentElement.setAttribute('data-theme', themes[name]);
  saveDB();
  statusMsg(`Theme: ${name}`);
}
```

### Step 2: Verify

Type `/theme` repeatedly — theme should change to a different random theme each time, never the same as current. Type `/theme dos` — should apply `dos` theme directly. Type `/theme invalid` — should show theme list.

### Step 3: Commit
```bash
git add focus-terminal.html
git commit -m "feat: /theme with no arg picks a random theme excluding current"
```

---

## Task 5: Backlog done/fixed tracking

**File:** `focus-terminal/focus-terminal.html`

### Step 1: Add `done: false` to backlog item creation in `handleBacklog()` (line 1563)

Find:
```javascript
  db.backlog.push({
    id: Date.now()+'_'+Math.random().toString(36).slice(2,6),
    text: arg,
    createdAt: new Date().toISOString()
  });
```

Replace with:
```javascript
  db.backlog.push({
    id: Date.now()+'_'+Math.random().toString(36).slice(2,6),
    text: arg,
    done: false,
    createdAt: new Date().toISOString()
  });
```

### Step 2: Add `/backlog done [n]` handler and update list display in `handleBacklog()`

Find the full `handleBacklog` function:
```javascript
function handleBacklog(arg) {
  if (!arg || arg === 'list') {
    if (!db.backlog.length) { statusMsg('Backlog is empty.'); return; }
    showHelp('BACKLOG', db.backlog.map((b,i)=>`${i+1}. ${b.text}`));
    return;
  }
  if (arg === 'export') {
    exportBacklog(); return;
  }
  db.backlog.push({
    id: Date.now()+'_'+Math.random().toString(36).slice(2,6),
    text: arg,
    done: false,
    createdAt: new Date().toISOString()
  });
  saveDB();
  statusMsg(`Backlog: added "${arg}" (${db.backlog.length} item${db.backlog.length===1?'':'s'})`);
}
```

Replace with:
```javascript
function handleBacklog(arg) {
  if (!arg || arg === 'list') {
    if (!db.backlog.length) { statusMsg('Backlog is empty.'); return; }
    showHelp('BACKLOG', db.backlog.map((b,i)=>`${b.done?'[x]':'[ ]'} ${i+1}. ${b.text}`));
    return;
  }
  if (arg === 'export') {
    exportBacklog(); return;
  }
  if (arg.startsWith('done ') || arg.startsWith('fix ')) {
    const n = parseInt(arg.split(' ')[1]);
    const item = db.backlog[n-1];
    if (!item) { statusMsg(`No backlog item #${n}.`); return; }
    item.done = !item.done;
    saveDB();
    statusMsg(`Backlog #${n} marked ${item.done ? 'done' : 'open'}: "${item.text}"`);
    return;
  }
  db.backlog.push({
    id: Date.now()+'_'+Math.random().toString(36).slice(2,6),
    text: arg,
    done: false,
    createdAt: new Date().toISOString()
  });
  saveDB();
  statusMsg(`Backlog: added "${arg}" (${db.backlog.length} item${db.backlog.length===1?'':'s'})`);
}
```

### Step 3: Update `exportBacklog()` to use `[x]` for done items (line 1576)

Find:
```javascript
    + db.backlog.map(b=>`- [ ] ${b.text}`).join('\n') + '\n';
```

Replace with:
```javascript
    + db.backlog.map(b=>`- ${b.done?'[x]':'[ ]'} ${b.text}`).join('\n') + '\n';
```

### Step 4: Update `/help` default lines to include `done` command

Find in `showHelp()`:
```javascript
    '/backlog [text]  add item to backlog',
    '/backlog list    show all backlog items',
    '/backlog export  download backlog as .txt',
```

Replace with:
```javascript
    '/backlog [text]    add item to backlog',
    '/backlog list      show all backlog items',
    '/backlog done [n]  toggle item #n as done/open',
    '/backlog export    download backlog as .txt',
```

### Step 5: Verify

- `/backlog write tests` → adds item
- `/backlog list` → shows `[ ] 1. write tests`
- `/backlog done 1` → status says "marked done"
- `/backlog list` → shows `[x] 1. write tests`
- `/backlog done 1` → toggles back to open
- `/backlog export` → file uses `- [x]` / `- [ ]` correctly
- Reload page → done state persists (old items without `done` field treat as open — `b.done` is `undefined` which is falsy, so `b.done?'[x]':'[ ]'` → `[ ]` ✓)

### Step 6: Commit
```bash
git add focus-terminal.html
git commit -m "feat: backlog done/fixed tracking with /backlog done [n]"
```

---

## Task 6: Categorical color palette — add `--cat-1..10` to all themes

**File:** `focus-terminal/focus-terminal.html`

Add 10 CSS variables to `:root` and to each of the 6 `[data-theme]` overrides.

### Step 1: Add to `:root` (after the last existing variable in the `:root` block, around line 32)

Find the closing `}` of `:root` after `--quadrant-ni: #555;`:
```css
  --quadrant-ni: #555;
}
```

Replace with:
```css
  --quadrant-ni: #555;
  /* categorical palette */
  --cat-1: #ffb000;
  --cat-2: #ff4444;
  --cat-3: #ff8800;
  --cat-4: #00ff41;
  --cat-5: #00bbff;
  --cat-6: #aa44ff;
  --cat-7: #ff44aa;
  --cat-8: #ffff44;
  --cat-9: #00ffaa;
  --cat-10: #ffffff;
}
```

### Step 2: Add to `[data-theme="solar"]` (after `--quadrant-ni: #4a5456;`)

Find:
```css
  --quadrant-ni: #4a5456;
}
[data-theme="monk"] {
```

Replace with:
```css
  --quadrant-ni: #4a5456;
  --cat-1: #b58900;
  --cat-2: #cb4b16;
  --cat-3: #dc322f;
  --cat-4: #d33682;
  --cat-5: #6c71c4;
  --cat-6: #268bd2;
  --cat-7: #2aa198;
  --cat-8: #859900;
  --cat-9: #657b83;
  --cat-10: #93a1a1;
}
[data-theme="monk"] {
```

### Step 3: Add to `[data-theme="monk"]` (after `--quadrant-ni: #aaa;`)

Find:
```css
  --quadrant-ni: #aaa;
}
[data-theme="space"] {
```

Replace with:
```css
  --quadrant-ni: #aaa;
  --cat-1: #2a2a2a;
  --cat-2: #aa2200;
  --cat-3: #005588;
  --cat-4: #336600;
  --cat-5: #884400;
  --cat-6: #550055;
  --cat-7: #006666;
  --cat-8: #7a5000;
  --cat-9: #555500;
  --cat-10: #003344;
}
[data-theme="space"] {
```

### Step 4: Add to `[data-theme="space"]` (after `--quadrant-ni: #304060;`)

Find:
```css
  --quadrant-ni: #304060;
}
[data-theme="synth"] {
```

Replace with:
```css
  --quadrant-ni: #304060;
  --cat-1: #00ffff;
  --cat-2: #ff00aa;
  --cat-3: #00ff88;
  --cat-4: #ffff00;
  --cat-5: #ff6060;
  --cat-6: #7788ff;
  --cat-7: #aa66ff;
  --cat-8: #ffffff;
  --cat-9: #00ccff;
  --cat-10: #ff8800;
}
[data-theme="synth"] {
```

### Step 5: Add to `[data-theme="synth"]` (after `--quadrant-ni: #440044;`)

Find:
```css
  --quadrant-ni: #440044;
}
[data-theme="dos"] {
```

Replace with:
```css
  --quadrant-ni: #440044;
  --cat-1: #ff00ff;
  --cat-2: #00ffff;
  --cat-3: #00ff88;
  --cat-4: #ffaa00;
  --cat-5: #ff0066;
  --cat-6: #6600ff;
  --cat-7: #ff6600;
  --cat-8: #00aaff;
  --cat-9: #ffff00;
  --cat-10: #ff44aa;
}
[data-theme="dos"] {
```

### Step 6: Add to `[data-theme="dos"]` (after `--quadrant-ni: #5555ff;`)

Find:
```css
  --quadrant-ni: #5555ff;
}
```

Replace with:
```css
  --quadrant-ni: #5555ff;
  --cat-1: #ffffff;
  --cat-2: #55ffff;
  --cat-3: #55ff55;
  --cat-4: #ff5555;
  --cat-5: #ffff55;
  --cat-6: #ff55ff;
  --cat-7: #5555ff;
  --cat-8: #aaaaaa;
  --cat-9: #ffaa55;
  --cat-10: #55aaaa;
}
```

### Step 7: Verify

Open browser DevTools. Inspect `:root` computed styles and verify `--cat-1` through `--cat-10` are present. Switch themes and verify values change.

### Step 8: Commit
```bash
git add focus-terminal.html
git commit -m "feat: add --cat-1..10 categorical color palette to all themes"
```

---

## Task 7: UI Guidelines document

**File:** `docs/ui-guidelines.md` (new file)

Create the file with this exact content:

```markdown
# Focus Terminal — UI Guidelines

Guidelines for building apps in the focus-terminal ecosystem. These conventions define how lightweight, local-first, terminal-aesthetic apps in this collection should look, behave, and interoperate.

---

## Philosophy

- **Local-first, no server.** All state in `localStorage`. Apps work offline and persist without accounts.
- **Single HTML file.** No build step, no bundler, no dependencies beyond optional Google Fonts. Ship by copying one file.
- **Terminal aesthetic.** Monospace fonts, dark backgrounds (with light theme support), box-drawing characters, CRT colour palettes. The UI should feel like a productive tool, not a consumer app.
- **YAGNI.** Every feature earns its place. No modals for things that fit in a status bar.

---

## Theme System

Themes are applied via a `data-theme` attribute on `<html>`. The default (no attribute) is the `legacy` amber/CRT theme.

```html
<html data-theme="solar">
```

### Available themes

| Name | Character |
|------|-----------|
| `legacy` | Amber CRT, dark background, high contrast |
| `solar` | Solarized dark — muted, professional |
| `monk` | Light background, minimal, print-like |
| `space` | Dark navy, neon accents |
| `synth` | Dark purple, synthwave neon |
| `dos` | Classic blue DOS screen, CGA palette |

### CSS variable contract

Every app must define (or inherit) these variables:

```css
--bg          /* page background */
--fg          /* primary text */
--accent      /* highlight, active states, headers */
--dim         /* secondary/muted text */
--muted       /* subtle backgrounds, hover states */
--border      /* panel borders */
--success     /* confirmations, positive states */
--warn        /* warnings, destructive actions */
--font        /* font-family stack */
--font-size   /* base font size (default 20px) */
--line-h      /* line-height (default 1.4) */
```

All sizing should be `em`-based so apps scale when `--font-size` changes.

---

## Categorical Colour Palette

Each theme exposes `--cat-1` through `--cat-10`: 10 distinguishable colours that work against that theme's background. Use them for:

- **Data visualisation** — series colours in charts/graphs
- **Item tagging** — colour-coded labels on tasks or items
- **Cross-app tokens** — consistent meaning across apps (e.g. always use `--cat-2` for "alert" state)

### Contrast rules

- On dark themes (legacy, solar, space, synth, dos): all `--cat-N` values have sufficient contrast against `--bg`.
- On light themes (monk): all `--cat-N` values are dark enough to read on `--bg`.
- Never use `--cat-N` for large text blocks — only labels, badges, and small indicators.

### Suggested semantic assignments

| Slot | Suggested use |
|------|--------------|
| `--cat-1` | Primary / brand (matches `--accent`) |
| `--cat-2` | Danger / alert |
| `--cat-3` | Warning / moderate |
| `--cat-4` | Success / positive |
| `--cat-5` | Info / neutral highlight |
| `--cat-6..10` | Free — use for dimensions, series, tags |

---

## Typography

- Font families are set per-theme via `--font`. Three families are loaded: `VT323` (retro), `Fira Code` (modern mono), `Source Code Pro` (neutral mono).
- Base size is `--font-size` (20px default). All font sizes in components use `em` so they scale together.
- Use `letter-spacing: 2px` on uppercase labels and headers.
- Avoid mixing font weights within a single panel — bold is reserved for the ONE THING display.

---

## Layout Patterns

### Page structure

```
┌─────────────────────────────────────┐  30vh
│  TOP ROW — primary focus content    │
├───────────────────────┬─────────────┤  60vh
│  MAIN PANEL           │  SIDE PANEL │
├───────────────────────┴─────────────┤  10vh
│  CONSOLE ROW                        │
└─────────────────────────────────────┘
```

The `#app` grid: `grid-template-rows: 30vh 60vh 10vh`.

### Panel headers

Every panel starts with a header line in this format:

```
◈ LABEL TEXT
```

- Colour: `var(--accent)`
- Font size: `0.75em–0.8em`
- Letter spacing: `2px`
- Border: `border-bottom: 1px solid var(--muted)`
- Padding below: `3–4px`

Example:
```html
<div class="panel-header">◈ MY PANEL</div>
```

### Borders

- Panel separators: `1px solid var(--border)` (prominent)
- Internal section dividers: `1px solid var(--muted)` (subtle)
- Never use `box-shadow` — use borders only.

---

## Component Patterns

### Console row

The bottom row of every app is the command console:

```html
<div id="console-row">
  <span id="console-prompt">APPNAME&gt;</span>
  <input type="text" id="console-input" autocomplete="off" spellcheck="false">
  <span id="console-status">READY</span>
</div>
```

- Background: `var(--muted)`
- Status area: right-aligned, `var(--dim)`, at least 120px wide
- Input: transparent background, `var(--fg)` text, `var(--accent)` caret

### Overlay (popup/modal)

Use for help text, edit forms, and list displays. One shared overlay element per app:

```html
<div id="help-overlay" style="display:none; position:fixed; inset:0;
  background:rgba(0,0,0,0.7); z-index:150; align-items:center; justify-content:center;">
  <div style="background:var(--bg); border:1px solid var(--border);
    padding:16px 20px; min-width:640px; max-width:min(90vw,960px);
    font-family:var(--font); color:var(--fg);">
    <div id="help-title" style="color:var(--accent); letter-spacing:2px; ..."></div>
    <div id="help-body" style="white-space:pre; line-height:1.8;"></div>
    <div style="color:var(--dim); font-size:0.82em;">
      <span id="help-close" style="cursor:pointer;">[ESC] CLOSE</span>
    </div>
  </div>
</div>
```

Close triggers: `[ESC]` key, click on backdrop, click on close span.

### Tooltip

A single `#tooltip` element positioned absolutely via `mousemove`. Never use native `title` attributes — the browser-imposed delay breaks the terminal feel.

```html
<div id="tooltip" style="position:fixed; display:none; ..."></div>
```

Wire via a shared `addTooltip(el, item)` function that handles `mousemove` and `mouseleave`.

### Boot / Q&A sequence

Full-screen overlay for guided multi-step input. Log lines use typed classes:

| Class | Use |
|-------|-----|
| `sys` | System messages, dim colour |
| `ask` | Questions, accent colour, bold |
| `ans` | User answers echoed back |
| `info` | Confirmations, success colour |
| `warn` | Warnings, warn colour |
| `sep` | Visual separators (`───`) |

---

## Terminal Interaction Conventions

### Command syntax

```
/command [required-arg] [optional-arg]
```

- All commands start with `/`
- Sub-commands use a second word: `/backlog list`, `/backlog export`
- Flags use `+` prefix: `+u` (urgent), `+i` (important), `/dim` (dimension)
- Unknown commands show: `Unknown command: /foo. Type /help`

### Status messages

Use the status bar (bottom-right of console row) for all feedback. Messages auto-revert to session state after 3 seconds:

```javascript
function statusMsg(msg) {
  document.getElementById('console-status').textContent = msg;
  setTimeout(updateStatus, 3000);
}
```

Never use `alert()`, `confirm()`, or `prompt()` — use styled overlays.

### `/help` command

Every app must implement `/help` that opens the styled overlay listing all commands. Format:

```
/command      description of what it does
/command arg  description with argument
```

---

## Building a New App in This Ecosystem

Checklist for starting a new focus-terminal ecosystem app:

- [ ] Copy the HTML shell (splash, `#app` grid, console row, boot overlay, `#tooltip`, `#help-overlay`)
- [ ] Import the same Google Fonts (`VT323`, `Fira Code`, `Source Code Pro`)
- [ ] Copy the full `:root` CSS variable block including `--cat-1..10`
- [ ] Copy all `[data-theme="X"]` blocks — do not modify the palette
- [ ] Use `STORAGE_KEY = 'your_app_name_db'` to avoid localStorage collisions
- [ ] Implement `loadDB()` / `saveDB()` with migration guards (`db.newField = db.newField || default`)
- [ ] Implement `handleConsoleCmd()` with `/help`, `/theme`, and app-specific commands
- [ ] Use `statusMsg()` for all user feedback — never native dialogs
- [ ] Wire `addTooltip(el, item)` for hover details — never `title` attributes
- [ ] Panel headers: `◈ LABEL` pattern with `border-bottom: 1px solid var(--muted)`
- [ ] All font sizes in `em`, all layout dimensions in `vh`/`vw` or `fr`
```

### Step 2: Commit
```bash
cd D:/code/ai-utils/focus-terminal
git add docs/ui-guidelines.md
git commit -m "docs: add UI guidelines for focus-terminal ecosystem"
```

---

## Final Verification Checklist

- [ ] Balance grid squares are `■` chars, same visual size as score-line `■`
- [ ] Hovering a square shows instant custom tooltip with item details (no browser delay)
- [ ] NIM-WEEK legend has no border box
- [ ] `/help` and `/backlog list` overlays are wider (640px min)
- [ ] `/theme` alone applies a random different theme
- [ ] `/theme dos` still works directly
- [ ] `/backlog add some text` adds item with `done: false`
- [ ] `/backlog done 1` toggles done, `/backlog list` shows `[x]`
- [ ] `/backlog export` uses `- [x]` / `- [ ]`
- [ ] Browser DevTools: `--cat-1` through `--cat-10` visible on `:root`
- [ ] Switching themes changes `--cat-N` values
- [ ] `docs/ui-guidelines.md` exists and renders cleanly
