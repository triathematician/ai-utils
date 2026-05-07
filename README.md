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
    soft-utility.md             ← soft-utility design category guidelines
    soft-utility-template.html  ← copy-me template for new soft-utility apps
    signal-grid.md              ← signal-grid design category (placeholder)
    design-canvas.md            ← design-canvas design category guidelines
    data-apps.md                ← data-apps design category guidelines
  apps/
    life-tracker/                 ← LIFE TRACKER: appointments and life events
    chrono-zoom/                  ← CHRONO ZOOM: timeline and event tracking
    display-wall/                 ← DISPLAY WALL DESIGNER: video wall layout tool
    focus-terminal/               ← FOCUS TERMINAL: productivity + task management
    geo-firsts/                   ← GEO-FIRSTS: travel tracker — states, national parks, countries
    portfolio-desk/               ← PORTFOLIO DESK: portfolio monitoring
    real-estate/                  ← REAL ESTATE DESK: monthly financial simulation — housing, investing, buy/rent events on a timeline
    staff-terminal/               ← STAFF TERMINAL: staff development, LDP goals, notes
    strategy-atlas/               ← STRATEGY ATLAS: strategic planning, goal groups, OKRs, RAG pulse tracking
    skill-port/                   ← SKILL-PORT: blueprint rail map for skill and project pathways
    vault-terminal/               ← VAULT TERMINAL: monthly budget tracker — income, expenses, investments
    gear-terminal/                ← GEAR TERMINAL: gear tracker — bikes, cars, shoes, service dates, repairs
    ski-tracker/                  ← SKI TRACKER: ski trip tracker — dates, places, stats, and rollups
  common/                       ← shared assets (if any)
    yahoo-finance-proxy/          ← Java proxy service for Yahoo Finance data
  data-apps/
    vote-analysis/                ← VOTE ANALYSIS: US presidential election trends 2008–2024
```

Most of these apps can be run directly from the file system. Exceptions:
- `portfolio-desk` requires `yahoo-finance-proxy` to gather real-time data, recommended to run `yahoo-finance-proxy` with `./gradlew run` and then serve the app using `npx serve .`

## Design categories

### terminal-web

Monospace, dark-first, single-file apps with a command-line interaction model. Local state in `localStorage`. No dependencies beyond Google Fonts.

**Apps in this category:**
- `focus-terminal/focus-terminal.html` — FOCUS TERMINAL
- `chrono-zoom/index.html` — CHRONO ZOOM
- `staff-terminal/staff-terminal.html` — STAFF TERMINAL
- `strategy-atlas/index.html` — STRATEGY ATLAS
- `vault-terminal/index.html` — VAULT TERMINAL
- `gear-terminal/index.html` — GEAR TERMINAL
- `ski-tracker/index.html` — SKI TRACKER

**To start a new terminal-web app:** copy `docs/terminal-web-template.html` to a new subdirectory, rename the `STORAGE_KEY`, and build on top of the stubs.

**Guidelines:** `docs/terminal-web.md`

### soft-utility

Portable, lightweight utility apps with a clean and approachable UI. Built with React (CDN), Tailwind CSS, and Lucide Icons. Light-themed with Inter fonts.

**Apps in this category:**
- `life-tracker/index.html` — LIFE TRACKER

**To start a new soft-utility app:** copy `docs/soft-utility-template.html` to a new subdirectory, rename the `APP_NAME` constant, and build on top of the stubs.

**Guidelines:** `docs/soft-utility.md`

### signal-grid

Dashboard-style apps for monitoring, signals, and data grids. No style guidelines yet.

**Apps in this category:**
- `portfolio-desk/index.html` — PORTFOLIO DESK
- `real-estate/index.html` — REAL ESTATE DESK

**Guidelines:** `docs/signal-grid.md` _(placeholder)_

### design-canvas

Precise, single-file visual layout and design tools with direct canvas interaction. Minimal chrome to maximise design space; the canvas is the primary interface. No build step — CDN libs only when genuinely needed. No persistence required unless the app truly needs it. Start from `display-wall/display-wall.html` and cherry-pick what you need; all guidelines are inspiration, adapt freely.

**Apps in this category:**
- `display-wall/display-wall.html` — DISPLAY WALL DESIGNER
- `skill-port/index.html` — SKILL-PORT

**To start a new design-canvas app:** copy `display-wall/display-wall.html`, strip to the skeleton (CSS vars, background texture, chrome), and build from there.

**Guidelines:** `docs/design-canvas.md`

### data-apps

Analytical, data-first dashboards built around fixed or embedded datasets. Focus is on interactive exploration — choropleth maps, sortable tables, trend charts, sliders, and summary cards — rather than user-entered data. Dark analytical aesthetic with IBM Plex Mono/Sans and semantic accent colours. Apps live in their own subdirectories under `data-apps/` at the repo root.

**Apps in this category:**
- `data-apps/vote-analysis/index.html` — VOTE ANALYSIS

**To start a new data-app:** copy `data-apps/vote-analysis/index.html`, swap in your dataset and semantic colours, and adapt the tabs to your data shape.

**Guidelines:** `docs/data-apps.md`

## One-off apps

Not every app needs a category. If an app has a unique design feel, just build it as a self-contained file. No template required.

**Apps in this category:**
- `geo-firsts/index.html` — GEO-FIRSTS

## Adding a new app

1. Build the app as a single HTML file in its own subdirectory
2. Add an entry to the `APPS` array in `index.html`
3. If it follows a design category, add it to the relevant section above
