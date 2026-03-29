# ai-utils

A collection of bite-sized, single-file, local-first apps built via vibe coding. Apps are intentionally lightweight and flexible — many are one-offs. No build step, no accounts, no servers. Everything runs from the filesystem.

## Repo structure

```
ai-utils/
  index.html                    ← navigation launcher (open this to browse apps)
  CLAUDE.md                     ← this file
  docs/
    plans/                      ← design and implementation docs
    specs/                      ← app specs and reference docs
    terminal-web.md             ← terminal-web design category guidelines
    terminal-web-template.html  ← copy-me template for new terminal-web apps
    soft-utility.md             ← soft-utility design category (placeholder)
    signal-grid.md              ← signal-grid design category (placeholder)
    design-canvas.md            ← design-canvas design category guidelines
  apps/
    appt-tracker/                 ← LIFE TRACKER: appointments and life events
    chronos/                      ← CHRONOS: timeline and event tracking
    display-wall/                 ← DISPLAY WALL DESIGNER: video wall layout tool
    focus-terminal/               ← FOCUS TERMINAL: productivity + task management
    portfolio-manager/            ← PORTFOLIO SIGNAL DESK: portfolio monitoring
  common/                       ← shared assets (if any)
    yahoo-finance-proxy/          ← Java proxy service for Yahoo Finance data
```

## Design categories

### terminal-web

Monospace, dark-first, single-file apps with a command-line interaction model. Local state in `localStorage`. No dependencies beyond Google Fonts.

**Apps in this category:**
- `focus-terminal/focus-terminal.html` — FOCUS TERMINAL
- `chronos/chronos.html` — CHRONOS

**To start a new terminal-web app:** copy `docs/terminal-web-template.html` to a new subdirectory, rename the `STORAGE_KEY`, and build on top of the stubs.

**Guidelines:** `docs/terminal-web.md`

### soft-utility

Portable, lightweight utility apps with a clean and approachable UI. No style guidelines yet.

**Apps in this category:**
- `appt-tracker/appt-tracker.html` — LIFE TRACKER

**Guidelines:** `docs/soft-utility.md` _(placeholder)_

### signal-grid

Dashboard-style apps for monitoring, signals, and data grids. No style guidelines yet.

**Apps in this category:**
- `portfolio-manager/portfolio-manager.html` — PORTFOLIO SIGNAL DESK

**Guidelines:** `docs/signal-grid.md` _(placeholder)_

### design-canvas

Precise, single-file visual layout and design tools with direct canvas interaction. Minimal chrome to maximise design space; the canvas is the primary interface. No build step — CDN libs only when genuinely needed. No persistence required unless the app truly needs it. Start from `display-wall/display-wall.html` and cherry-pick what you need; all guidelines are inspiration, adapt freely.

**Apps in this category:**
- `display-wall/display-wall.html` — DISPLAY WALL DESIGNER

**To start a new design-canvas app:** copy `display-wall/display-wall.html`, strip to the skeleton (CSS vars, background texture, chrome), and build from there.

**Guidelines:** `docs/design-canvas.md`

## One-off apps

Not every app needs a category. If an app has a unique design feel, just build it as a self-contained file. No template required.

## Adding a new app

1. Build the app as a single HTML file in its own subdirectory
2. Add an entry to the `APPS` array in `index.html`
3. If it follows a design category, add it to the relevant section above
