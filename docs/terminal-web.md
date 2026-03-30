# Terminal Web — UI Guidelines

Guidelines for building **terminal-web** apps in this repo. Terminal-web is a design category: monospace, dark-first, local-first, single-file apps with a command-line interaction model. See `docs/terminal-web-template.html` for the copy-me starting point.

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
| `notebook` | Off-white paper background, blue ruled lines, red margin accent |

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
    <div id="help-title" style="color:var(--accent); letter-spacing:2px;"></div>
    <div id="help-body" style="white-space:pre; line-height:1.8;"></div>
    <div style="color:var(--dim); font-size:0.82em;">
      <span id="help-close" style="cursor:pointer;">[ESC] CLOSE</span>
    </div>
  </div>
</div>
```

Close triggers: `[ESC]` key, click on backdrop, click on close span.

### Tooltip

A single `#tooltip` element positioned via `mousemove`. Never use native `title` attributes — the browser-imposed delay breaks the terminal feel.

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

## Standard Commands

All terminal-web apps share a common set of built-in commands. Implement these as-is — do not change their UX behaviour:

### `/theme [name]`

Switch the colour theme. If `name` is omitted, a random theme that is not the current one is applied.

```
/theme          → picks a random non-current theme
/theme solar    → applies solar directly
```

Saves the chosen theme to `db.theme` via `saveDB()`. Recognised names: `legacy solar monk space synth dos notebook`.

### `/backlog` — persistent item list

A cross-session backlog backed by `db.backlog` (array of `{id, text, done, createdAt}`) and `db.backlogArchive` (array of `{date, items[]}`). Add migration guards in `loadDB()`:

```javascript
db.backlog        = db.backlog        || [];
db.backlogArchive = db.backlogArchive || [];
```

| Sub-command | Action |
|---|---|
| `/backlog <text>` | Add an item |
| `/backlog list` | Open overlay with clickable checkboxes |
| `/backlog done <n>` | Toggle item #n done/open |
| `/backlog delete <n>` | Remove item #n |
| `/backlog archive` | Batch-move all done items to archive |
| `/backlog archive list` | Show archived batches in overlay |
| `/backlog export` | Download backlog as `.txt` |

The list popup reuses the app's shared `#help-overlay` element. Clicking a checkbox bracket toggles `done` and re-renders the list in place.

---

## Building a New App in This Ecosystem

Checklist for starting a new terminal-web category app:

- [ ] Copy the HTML shell (splash, `#app` grid, console row, boot overlay, `#tooltip`, `#help-overlay`)
- [ ] Import the same Google Fonts (`VT323`, `Fira Code`, `Source Code Pro`)
- [ ] Copy the full `:root` CSS variable block including `--cat-1..10`
- [ ] Copy all `[data-theme="X"]` blocks — do not modify the palette
- [ ] Use `STORAGE_KEY = 'your_app_name_db'` to avoid localStorage collisions
- [ ] Implement `loadDB()` / `saveDB()` with migration guards (`db.newField = db.newField || default`)
- [ ] Implement `handleConsoleCmd()` with `/help`, `/theme`, `/backlog`, and app-specific commands
- [ ] Use `statusMsg()` for all user feedback — never native dialogs
- [ ] Wire `addTooltip(el, item)` for hover details — never `title` attributes
- [ ] Panel headers: `◈ LABEL` pattern with `border-bottom: 1px solid var(--muted)`
- [ ] All font sizes in `em`, all layout dimensions in `vh`/`vw` or `fr`
- [ ] Initialise `db.backlog = db.backlog || []` and `db.backlogArchive = db.backlogArchive || []` in `loadDB()` migration guards
