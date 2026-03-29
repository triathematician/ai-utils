# Repo Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a navigation page, refine the terminal-web UI guidelines into a shareable category doc + template, and write a CLAUDE.md to orient LLMs to this repo.

**Architecture:** Four independent deliverables executed in order. No build step — all output is static HTML/MD files. No test framework; verification is opening files in a browser and visually confirming.

**Tech Stack:** Vanilla HTML/CSS/JS, Markdown, Git.

---

## Task 1: Refactor UI guidelines into `docs/terminal-web.md`

**Files:**
- Create: `docs/terminal-web.md` (content derived from `ui-guidelines.md`)
- Delete: `ui-guidelines.md` (root-level, tracked as `?? ui-guidelines.md` in git status)
- Note: `focus-terminal/docs/ui-guidelines.md` was already deleted (shows as `D` in git status) — no action needed there

**Step 1: Copy `ui-guidelines.md` to `docs/terminal-web.md` and open it for editing**

The file already exists at repo root as `ui-guidelines.md`. Copy it:

```bash
cp ui-guidelines.md docs/terminal-web.md
```

**Step 2: Make the following edits to `docs/terminal-web.md`**

Replace the first two lines:

Old:
```
# Focus Terminal — UI Guidelines

Guidelines for building apps in the focus-terminal ecosystem. These conventions define how lightweight, local-first, terminal-aesthetic apps in this collection should look, behave, and interoperate.
```

New:
```
# Terminal Web — UI Guidelines

Guidelines for building **terminal-web** apps in this repo. Terminal-web is a design category: monospace, dark-first, local-first, single-file apps with a command-line interaction model. See `docs/terminal-web-template.html` for the copy-me starting point.
```

**Step 3: Replace all instances of "focus-terminal ecosystem" with "terminal-web category"**

Search the file for any remaining references to "focus-terminal ecosystem" and replace with "terminal-web category".

**Step 4: Remove `ui-guidelines.md` from the repo root**

```bash
git rm ui-guidelines.md
```

**Step 5: Stage and commit**

```bash
git add docs/terminal-web.md
git commit -m "docs: rename ui-guidelines to terminal-web.md, reframe as design category"
```

---

## Task 2: Create `docs/terminal-web-template.html`

**Files:**
- Create: `docs/terminal-web-template.html`

This is a clean, well-commented HTML shell. When someone starts a new terminal-web app, they copy this file and build on top of it.

**Step 1: Create `docs/terminal-web-template.html` with the following content**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>APP NAME</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Source+Code+Pro:wght@300;400;600;700&family=VT323&display=swap" rel="stylesheet">
<style>
/* ═══════════════════════════════════════════════
   CSS VARIABLES — THEME SYSTEM
   Copy this block verbatim. Do not modify palette values.
   See docs/terminal-web.md for the full variable contract.
   ═══════════════════════════════════════════════ */
:root {
  --bg: #121212; --fg: #ffb000; --accent: #ff0000;
  --dim: #7a5500; --muted: #3a2800; --border: #ffb000;
  --success: #00ff41; --warn: #ff6600;
  --font: 'VT323', 'Courier New', monospace;
  --font-size: 20px; --line-h: 1.4;
  --cat-1:#ffb000; --cat-2:#ff4444; --cat-3:#ff8800; --cat-4:#00ff41;
  --cat-5:#00bbff; --cat-6:#aa44ff; --cat-7:#ff44aa; --cat-8:#ffff44;
  --cat-9:#00ffaa; --cat-10:#ffffff;
}
[data-theme="solar"] {
  --bg:#002b36; --fg:#839496; --accent:#b58900;
  --dim:#4a5456; --muted:#073642; --border:#839496;
  --success:#859900; --warn:#cb4b16;
  --font:'Fira Code',monospace;
  --cat-1:#b58900; --cat-2:#cb4b16; --cat-3:#dc322f; --cat-4:#d33682;
  --cat-5:#6c71c4; --cat-6:#268bd2; --cat-7:#2aa198; --cat-8:#859900;
  --cat-9:#657b83; --cat-10:#93a1a1;
}
[data-theme="monk"] {
  --bg:#f5f5f5; --fg:#2a2a2a; --accent:#000000;
  --dim:#888; --muted:#e0e0e0; --border:#2a2a2a;
  --success:#1a6600; --warn:#aa4400;
  --font:'Source Code Pro',monospace;
  --cat-1:#2a2a2a; --cat-2:#aa2200; --cat-3:#005588; --cat-4:#336600;
  --cat-5:#884400; --cat-6:#550055; --cat-7:#006666; --cat-8:#7a5000;
  --cat-9:#555500; --cat-10:#003344;
}
[data-theme="space"] {
  --bg:#0a0a1a; --fg:#a0c0ff; --accent:#00ffff;
  --dim:#304060; --muted:#0f0f2a; --border:#304080;
  --success:#00ffaa; --warn:#ff6060;
  --font:'Fira Code',monospace;
  --cat-1:#00ffff; --cat-2:#ff00aa; --cat-3:#00ff88; --cat-4:#ffff00;
  --cat-5:#ff6060; --cat-6:#7788ff; --cat-7:#aa66ff; --cat-8:#ffffff;
  --cat-9:#00ccff; --cat-10:#ff8800;
}
[data-theme="synth"] {
  --bg:#1a0033; --fg:#ff00ff; --accent:#00ffff;
  --dim:#660066; --muted:#2a0044; --border:#ff00ff;
  --success:#00ff88; --warn:#ffaa00;
  --font:'Fira Code',monospace;
  --cat-1:#ff00ff; --cat-2:#00ffff; --cat-3:#00ff88; --cat-4:#ffaa00;
  --cat-5:#ff0066; --cat-6:#6600ff; --cat-7:#ff6600; --cat-8:#00aaff;
  --cat-9:#ffff00; --cat-10:#ff44aa;
}
[data-theme="dos"] {
  --bg:#0000aa; --fg:#aaaaaa; --accent:#ffffff;
  --dim:#5555ff; --muted:#0000cc; --border:#aaaaaa;
  --success:#55ff55; --warn:#ffff55;
  --font:'VT323',monospace;
  --cat-1:#ffffff; --cat-2:#55ffff; --cat-3:#55ff55; --cat-4:#ff5555;
  --cat-5:#ffff55; --cat-6:#ff55ff; --cat-7:#5555ff; --cat-8:#aaaaaa;
  --cat-9:#ffaa55; --cat-10:#55aaaa;
}

/* ═══════════════════════════════════════════════
   RESET & BASE
   ═══════════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  height: 100%; background: var(--bg); color: var(--fg);
  font-family: var(--font); font-size: var(--font-size);
  line-height: var(--line-h); overflow: hidden;
  cursor: default; user-select: none;
}
::selection { background: var(--fg); color: var(--bg); }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--muted); }
::-webkit-scrollbar-thumb { background: var(--dim); }

/* ═══════════════════════════════════════════════
   LAYOUT — standard 30/60/10 grid
   Adjust grid-template-rows for your app's needs.
   ═══════════════════════════════════════════════ */
#app {
  display: grid;
  grid-template-rows: 30vh 60vh 10vh;
  height: 100vh; width: 100vw;
}
#top-row    { border-bottom: 1px solid var(--border); padding: 10px 12px; overflow: hidden; }
#main-row   { display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
#main-panel { border-right: 1px solid var(--border); padding: 10px 12px; overflow-y: auto; }
#side-panel { padding: 10px 12px; overflow-y: auto; }
#console-row {
  background: var(--muted); border-top: 1px solid var(--border);
  display: flex; align-items: center; padding: 0 12px; gap: 8px;
}

/* Panel headers: ◈ LABEL pattern */
.row-header {
  color: var(--accent); font-size: 0.8em; letter-spacing: 2px;
  margin-bottom: 4px; border-bottom: 1px solid var(--muted); padding-bottom: 4px;
}

/* Console row elements */
#console-prompt { color: var(--accent); white-space: nowrap; }
#console-input  {
  flex: 1; background: transparent; border: none; outline: none;
  color: var(--fg); font-family: var(--font); font-size: var(--font-size);
  caret-color: var(--accent);
}
#console-status {
  color: var(--dim); font-size: 0.8em; min-width: 120px;
  text-align: right; white-space: nowrap;
}

/* ═══════════════════════════════════════════════
   OVERLAY (help / edit forms)
   ═══════════════════════════════════════════════ */
#help-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,0.7); z-index: 150;
  align-items: center; justify-content: center;
}
#help-overlay.visible { display: flex; }
.overlay-box {
  background: var(--bg); border: 1px solid var(--border);
  padding: 16px 20px; min-width: 640px; max-width: min(90vw,960px);
  font-family: var(--font); color: var(--fg);
}
#help-title { color: var(--accent); letter-spacing: 2px; margin-bottom: 8px; }
#help-body  { white-space: pre; line-height: 1.8; }
#help-close { color: var(--dim); font-size: 0.82em; cursor: pointer; display: block; margin-top: 8px; }

/* ═══════════════════════════════════════════════
   TOOLTIP
   ═══════════════════════════════════════════════ */
#tooltip {
  position: fixed; display: none; background: var(--bg);
  border: 1px solid var(--border); color: var(--fg);
  padding: 4px 8px; font-size: 0.8em; pointer-events: none;
  z-index: 200; white-space: nowrap;
}
</style>
</head>
<body>

<!-- ═══ SPLASH (shown before boot, hidden after) ═══ -->
<div id="splash" style="position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:100;flex-direction:column;gap:8px;">
  <div style="color:var(--accent);font-size:2em;letter-spacing:4px;">APP NAME</div>
  <div style="color:var(--dim);font-size:0.8em;">LOADING...</div>
</div>

<!-- ═══ MAIN LAYOUT ═══ -->
<div id="app">
  <div id="top-row">
    <div class="row-header">◈ TOP PANEL</div>
    <!-- primary focus content -->
  </div>
  <div id="main-row">
    <div id="main-panel">
      <div class="row-header">◈ MAIN</div>
    </div>
    <div id="side-panel">
      <div class="row-header">◈ SIDE</div>
    </div>
  </div>
  <div id="console-row">
    <span id="console-prompt">APPNAME&gt;</span>
    <input type="text" id="console-input" autocomplete="off" spellcheck="false">
    <span id="console-status">READY</span>
  </div>
</div>

<!-- ═══ HELP OVERLAY ═══ -->
<div id="help-overlay">
  <div class="overlay-box">
    <div id="help-title"></div>
    <div id="help-body"></div>
    <span id="help-close">[ESC] CLOSE</span>
  </div>
</div>

<!-- ═══ TOOLTIP ═══ -->
<div id="tooltip"></div>

<script>
/* ─── STORAGE ─────────────────────────────────────────── */
const STORAGE_KEY = 'YOUR_APP_NAME_db';  // TODO: change this

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const db = raw ? JSON.parse(raw) : {};
    // Migration guards — add new fields with defaults:
    // db.myField = db.myField ?? defaultValue;
    return db;
  } catch { return {}; }
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/* ─── STATUS BAR ──────────────────────────────────────── */
function statusMsg(msg) {
  document.getElementById('console-status').textContent = msg;
  setTimeout(updateStatus, 3000);
}

function updateStatus() {
  document.getElementById('console-status').textContent = 'READY';
  // TODO: replace with app-specific status (e.g. item count)
}

/* ─── THEME ───────────────────────────────────────────── */
const THEMES = ['legacy','solar','monk','space','synth','dos'];
let db = loadDB();

function applyTheme(name) {
  if (!THEMES.includes(name)) return statusMsg('Unknown theme: ' + name);
  document.documentElement.dataset.theme = (name === 'legacy') ? '' : name;
  db.theme = name;
  saveDB(db);
  statusMsg('Theme: ' + name.toUpperCase());
}

/* ─── CONSOLE ─────────────────────────────────────────── */
const input = document.getElementById('console-input');

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const cmd = input.value.trim();
    input.value = '';
    if (cmd) handleConsoleCmd(cmd);
  }
});

function handleConsoleCmd(raw) {
  const parts = raw.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');

  if (cmd === '/help')   return showHelp();
  if (cmd === '/theme')  return applyTheme(arg);
  // TODO: add app-specific commands here

  statusMsg('Unknown command: ' + cmd);
}

/* ─── HELP OVERLAY ────────────────────────────────────── */
function showHelp() {
  document.getElementById('help-title').textContent = '◈ APPNAME — COMMANDS';
  document.getElementById('help-body').textContent = [
    '/help          show this help',
    '/theme <name>  switch theme (legacy|solar|monk|space|synth|dos)',
    // TODO: add your commands here
  ].join('\n');
  const overlay = document.getElementById('help-overlay');
  overlay.classList.add('visible');
  overlay.onclick = e => { if (e.target === overlay) overlay.classList.remove('visible'); };
}

document.getElementById('help-close').onclick = () =>
  document.getElementById('help-overlay').classList.remove('visible');

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.getElementById('help-overlay').classList.remove('visible');
  if (document.getElementById('help-overlay').classList.contains('visible')) return;
  if (document.activeElement !== input) input.focus();
});

/* ─── TOOLTIP ─────────────────────────────────────────── */
const tooltip = document.getElementById('tooltip');

function addTooltip(el, text) {
  el.addEventListener('mouseenter', () => { tooltip.textContent = text; tooltip.style.display = 'block'; });
  el.addEventListener('mousemove', e => { tooltip.style.left = (e.clientX + 14) + 'px'; tooltip.style.top = (e.clientY + 8) + 'px'; });
  el.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
}

/* ─── BOOT / INIT ─────────────────────────────────────── */
function init() {
  db = loadDB();
  applyTheme(db.theme || 'legacy');
  render();
  document.getElementById('splash').style.display = 'none';
  input.focus();
}

function render() {
  // TODO: implement render logic
}

window.addEventListener('DOMContentLoaded', init);
</script>
</body>
</html>
```

**Step 2: Verify the template opens correctly in a browser**

Open `docs/terminal-web-template.html` in a browser. You should see:
- A splash screen briefly, then the app layout
- Dark amber terminal aesthetic (legacy theme)
- A console row at the bottom with `APPNAME>` prompt
- No JS errors in the console

**Step 3: Commit**

```bash
git add docs/terminal-web-template.html
git commit -m "feat: add terminal-web HTML template"
```

---

## Task 3: Create `CLAUDE.md`

**Files:**
- Create: `CLAUDE.md` (repo root)

**Step 1: Create `CLAUDE.md` with the following content**

```markdown
# ai-utils

A collection of bite-sized, single-file, local-first apps built via vibe coding. Apps are intentionally lightweight and flexible — many are one-offs. No build step, no accounts, no servers. Everything runs from the filesystem.

## Repo structure

```
ai-utils/
  index.html                    ← navigation launcher (open this to browse apps)
  CLAUDE.md                     ← this file
  docs/
    terminal-web.md             ← terminal-web design category guidelines
    terminal-web-template.html  ← copy-me template for new terminal-web apps
    plans/                      ← design and implementation docs
  focus-terminal/               ← FOCUS TERMINAL: productivity + task management
  appt-tracker/                 ← LIFE TRACKER: appointments and life events
  portfolio-manager/            ← PORTFOLIO SIGNAL DESK: portfolio monitoring
  work/display-wall/            ← LIVELAB MEGAWALL: live display wall
  yahoo-finance-proxy/          ← Java proxy service for Yahoo Finance data
  common/                       ← shared assets (if any)
  specs/                        ← specs and reference docs
```

## Design categories

### terminal-web

Monospace, dark-first, single-file apps with a command-line interaction model. Local state in `localStorage`. No dependencies beyond Google Fonts.

**Apps in this category:**
- `focus-terminal/focus-terminal.html` — FOCUS TERMINAL
- `appt-tracker/appt-tracker.html` — LIFE TRACKER
- `portfolio-manager/portfolio-manager.html` — PORTFOLIO SIGNAL DESK
- `work/display-wall/display-wall.html` — LIVELAB MEGAWALL

**To start a new terminal-web app:** copy `docs/terminal-web-template.html` to a new subdirectory, rename the `STORAGE_KEY`, and build on top of the stubs.

**Guidelines:** `docs/terminal-web.md`

## One-off apps

Not every app needs a category. If an app has a unique design feel, just build it as a self-contained file. No template required.

## Adding a new app

1. Build the app as a single HTML file in its own subdirectory (or `work/` for work-related tools)
2. Add an entry to the `APPS` array in `index.html`
3. If it follows a design category, add it to the relevant section above
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with repo vision and design categories"
```

---

## Task 4: Create `index.html` (boot sequence launcher)

**Files:**
- Create: `index.html` (repo root)

This is the most complex task. The page boots with a typed animation, displays each app as a detected module, then drops into a live console prompt.

**Step 1: Check initiation dates for each app**

Run these commands to find the first commit date for each app file:

```bash
git log --oneline -- focus-terminal/focus-terminal.html | tail -1
git log --oneline -- appt-tracker/appt-tracker.html | tail -1
git log --oneline -- portfolio-manager/portfolio-manager.html | tail -1
git log --oneline -- work/display-wall/display-wall.html | tail -1
```

Note the dates — you'll use them in the APPS array in the next step.

**Step 2: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI-UTILS LAUNCHER</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Source+Code+Pro:wght@300;400;600;700&family=VT323&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #121212; --fg: #ffb000; --accent: #ff0000;
  --dim: #7a5500; --muted: #3a2800; --border: #ffb000;
  --success: #00ff41; --warn: #ff6600;
  --font: 'VT323', 'Courier New', monospace;
  --font-size: 20px; --line-h: 1.4;
}
[data-theme="solar"] {
  --bg:#002b36; --fg:#839496; --accent:#b58900;
  --dim:#4a5456; --muted:#073642; --border:#839496;
  --success:#859900; --warn:#cb4b16; --font:'Fira Code',monospace;
}
[data-theme="monk"] {
  --bg:#f5f5f5; --fg:#2a2a2a; --accent:#000000;
  --dim:#888; --muted:#e0e0e0; --border:#2a2a2a;
  --success:#1a6600; --warn:#aa4400; --font:'Source Code Pro',monospace;
}
[data-theme="space"] {
  --bg:#0a0a1a; --fg:#a0c0ff; --accent:#00ffff;
  --dim:#304060; --muted:#0f0f2a; --border:#304080;
  --success:#00ffaa; --warn:#ff6060; --font:'Fira Code',monospace;
}
[data-theme="synth"] {
  --bg:#1a0033; --fg:#ff00ff; --accent:#00ffff;
  --dim:#660066; --muted:#2a0044; --border:#ff00ff;
  --success:#00ff88; --warn:#ffaa00; --font:'Fira Code',monospace;
}
[data-theme="dos"] {
  --bg:#0000aa; --fg:#aaaaaa; --accent:#ffffff;
  --dim:#5555ff; --muted:#0000cc; --border:#aaaaaa;
  --success:#55ff55; --warn:#ffff55; --font:'VT323',monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  height: 100%; background: var(--bg); color: var(--fg);
  font-family: var(--font); font-size: var(--font-size);
  line-height: var(--line-h); overflow: hidden;
  cursor: default; user-select: none;
}
::selection { background: var(--fg); color: var(--bg); }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--muted); }
::-webkit-scrollbar-thumb { background: var(--dim); }

#app {
  display: grid;
  grid-template-rows: 1fr 50px;
  height: 100vh; width: 100vw;
}

/* Boot log area */
#boot-log {
  padding: 12px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.log-line { display: flex; align-items: baseline; gap: 0; }
.log-sys  { color: var(--dim); }
.log-ok   { color: var(--success); }
.log-warn { color: var(--warn); }
.log-ready { color: var(--accent); }

/* App entry lines */
.app-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.app-num    { color: var(--dim); min-width: 2ch; }
.app-name   { color: var(--accent); font-weight: bold; }
.app-desc   { color: var(--fg); flex: 1; }
.app-cat    { color: var(--dim); font-size: 0.82em; border: 1px solid var(--dim); padding: 0 4px; white-space: nowrap; }
.app-date   { color: var(--dim); font-size: 0.82em; white-space: nowrap; }
.app-launch {
  color: var(--success); border: 1px solid var(--success);
  padding: 0 6px; cursor: pointer; white-space: nowrap; font-size: 0.9em;
}
.app-launch:hover { background: var(--success); color: var(--bg); }

/* Console row */
#console-row {
  background: var(--muted); border-top: 1px solid var(--border);
  display: flex; align-items: center; padding: 0 12px; gap: 8px;
}
#console-prompt { color: var(--accent); white-space: nowrap; }
#console-input {
  flex: 1; background: transparent; border: none; outline: none;
  color: var(--fg); font-family: var(--font); font-size: var(--font-size);
  caret-color: var(--accent);
}
#console-input:disabled { opacity: 0.4; }
#console-status {
  color: var(--dim); font-size: 0.8em; min-width: 140px;
  text-align: right; white-space: nowrap;
}
</style>
</head>
<body>
<div id="app">
  <div id="boot-log"></div>
  <div id="console-row">
    <span id="console-prompt">AI-UTILS&gt;</span>
    <input type="text" id="console-input" autocomplete="off" spellcheck="false" disabled>
    <span id="console-status">BOOTING...</span>
  </div>
</div>

<script>
/* ─── APP REGISTRY ──────────────────────────────────────
   Update this array when adding new apps.
   path is relative to index.html location (repo root).
   ───────────────────────────────────────────────────── */
const APPS = [
  {
    name: 'FOCUS TERMINAL',
    desc: 'Personal productivity terminal — tasks, backlog, focus sessions',
    category: 'terminal-web',
    path: 'focus-terminal/focus-terminal.html',
    date: '2026-03-29'  // TODO: update from git log if different
  },
  {
    name: 'LIFE TRACKER',
    desc: 'Portable appointment and life event tracker',
    category: 'terminal-web',
    path: 'appt-tracker/appt-tracker.html',
    date: '2026-03-28'  // TODO: update from git log if different
  },
  {
    name: 'PORTFOLIO SIGNAL DESK',
    desc: 'Portfolio monitoring and signal dashboard',
    category: 'terminal-web',
    path: 'portfolio-manager/portfolio-manager.html',
    date: '2026-03-28'  // TODO: update from git log if different
  },
  {
    name: 'LIVELAB MEGAWALL',
    desc: 'Live display wall for metrics and data feeds',
    category: 'terminal-web',
    path: 'work/display-wall/display-wall.html',
    date: '2026-03-29'  // TODO: update from git log if different
  }
];

/* ─── THEME ─────────────────────────────────────────── */
const THEMES = ['legacy','solar','monk','space','synth','dos'];
const STORAGE_KEY = 'ai_utils_launcher';

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function savePrefs(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }

function applyTheme(name) {
  if (!THEMES.includes(name)) return statusMsg('Unknown theme: ' + name);
  document.documentElement.dataset.theme = (name === 'legacy') ? '' : name;
  const p = loadPrefs(); p.theme = name; savePrefs(p);
  statusMsg('Theme: ' + name.toUpperCase());
}

/* ─── STATUS ─────────────────────────────────────────── */
function statusMsg(msg) {
  document.getElementById('console-status').textContent = msg;
  setTimeout(() => document.getElementById('console-status').textContent = 'READY', 3000);
}

/* ─── LAUNCH ─────────────────────────────────────────── */
function launchApp(indexOrName) {
  let app;
  const n = parseInt(indexOrName);
  if (!isNaN(n) && n >= 1 && n <= APPS.length) {
    app = APPS[n - 1];
  } else {
    const q = String(indexOrName).toLowerCase();
    app = APPS.find(a => a.name.toLowerCase().includes(q));
  }
  if (!app) return statusMsg('App not found: ' + indexOrName);
  window.open(app.path, '_blank');
  statusMsg('Launching: ' + app.name);
}

/* ─── CONSOLE ────────────────────────────────────────── */
const input = document.getElementById('console-input');

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const cmd = input.value.trim();
    input.value = '';
    if (cmd) handleCmd(cmd);
  }
});

function handleCmd(raw) {
  const parts = raw.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');

  if (cmd === '/help')   return showHelp();
  if (cmd === '/list')   return printList();
  if (cmd === '/theme')  return applyTheme(arg);
  if (cmd === '/launch') return launchApp(arg);

  statusMsg('Unknown command: ' + cmd + '. Type /help');
}

function showHelp() {
  appendLine('/help           show this help', 'log-sys');
  appendLine('/list           reprint app list', 'log-sys');
  appendLine('/launch <n>     launch app by number or name (opens new window)', 'log-sys');
  appendLine('/theme <name>   switch theme: legacy | solar | monk | space | synth | dos', 'log-sys');
  scrollLog();
}

function printList() {
  APPS.forEach((app, i) => appendAppLine(app, i + 1));
  scrollLog();
}

/* ─── BOOT SEQUENCE ──────────────────────────────────── */
const log = document.getElementById('boot-log');

function appendLine(text, cls = '') {
  const div = document.createElement('div');
  div.className = 'log-line ' + cls;
  div.textContent = text;
  log.appendChild(div);
  return div;
}

function appendAppLine(app, num) {
  const div = document.createElement('div');
  div.className = 'app-line';
  div.innerHTML =
    `<span class="app-num">[${num}]</span>` +
    `<span class="app-name">${app.name}</span>` +
    `<span class="app-desc">${app.desc}</span>` +
    `<span class="app-cat">${app.category}</span>` +
    `<span class="app-date">${app.date}</span>` +
    `<span class="app-launch" onclick="launchApp(${num})">[ LAUNCH ]</span>`;
  log.appendChild(div);
  return div;
}

function scrollLog() {
  log.scrollTop = log.scrollHeight;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runBoot() {
  appendLine('AI-UTILS LAUNCHER v1.0', 'log-ready');
  await delay(120);
  appendLine('INITIALIZING...', 'log-sys');
  await delay(200);
  appendLine('SCANNING MODULES...', 'log-sys');
  await delay(300);
  appendLine('', '');

  for (let i = 0; i < APPS.length; i++) {
    await delay(180);
    appendLine('MODULE DETECTED:', 'log-ok');
    appendAppLine(APPS[i], i + 1);
    scrollLog();
  }

  await delay(300);
  appendLine('', '');
  appendLine('ALL MODULES ONLINE. Type /help for commands.', 'log-ready');
  scrollLog();

  // Activate console
  document.getElementById('console-status').textContent = 'READY';
  input.disabled = false;
  input.focus();
}

/* ─── INIT ───────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (input.disabled) return;
  if (document.activeElement !== input) input.focus();
});

window.addEventListener('DOMContentLoaded', () => {
  const prefs = loadPrefs();
  applyTheme(prefs.theme || 'legacy');
  runBoot();
});
</script>
</body>
</html>
```

**Step 3: Open `index.html` in a browser and verify**

Expected behavior:
- Boot sequence plays: header line, scan messages, then each app appears one by one with name, desc, category badge, date, `[LAUNCH]` button
- Console activates after boot completes, status shows `READY`
- `/help` prints command list in the log
- `/list` reprints app cards
- `/launch 1` opens Focus Terminal in a new tab
- `/theme solar` switches theme
- Clicking `[ LAUNCH ]` on any app opens it in a new tab
- No JS errors in browser console

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add boot sequence launcher nav page"
```

---

## Task 5: Cleanup

**Files:**
- The `ui-guidelines.md` at root should already be removed in Task 1 via `git rm`
- Verify git status is clean

**Step 1: Verify clean state**

```bash
git status
```

Expected: working tree clean, no untracked files.

If `ui-guidelines.md` still shows as untracked (wasn't caught in Task 1), remove it:

```bash
git rm ui-guidelines.md
git commit -m "chore: remove root-level ui-guidelines.md (moved to docs/terminal-web.md)"
```

**Step 2: Final smoke test**

Open `index.html` in a browser. Confirm all four `[ LAUNCH ]` buttons open the correct app in a new window. Confirm `/theme dos` and `/theme legacy` both work.

---

## Summary of files changed

| Action | File |
|--------|------|
| Create | `index.html` |
| Create | `CLAUDE.md` |
| Create | `docs/terminal-web.md` |
| Create | `docs/terminal-web-template.html` |
| Delete | `ui-guidelines.md` |
