# Atlas — UI Guidelines

Guidelines for the **Atlas** app (`apps/atlas/atlas.html`). Atlas is a local-first, single-file travel-tracking app: log visits to US states, national parks, and countries; browse them on interactive maps; view stats. No build step — D3, TopoJSON, and Chart.js loaded via CDN.

---

## Philosophy

- **Map-first.** The visual map is the hero element on every data page; tables and statistics are secondary.
- **Warm, cartographic aesthetic.** Parchment/cream backgrounds, terracotta accent, serif headings — the app should feel like a traveller's journal, not a data grid.
- **Local-first, no server.** All state in `localStorage` (`atlas_visits`, `atlas_places`, `atlas_photos`). Works fully offline.
- **Single HTML file.** CDN-only dependencies, no build step.
- **Show on demand.** Add/edit forms are hidden until explicitly requested. The default view is always data, never a blank form.

---

## Tech Stack

| Dependency | Source |
|---|---|
| D3 v7 | `https://cdn.jsdelivr.net/npm/d3@7` |
| TopoJSON client | `https://cdn.jsdelivr.net/npm/topojson-client@3` |
| Chart.js v4 | `https://cdn.jsdelivr.net/npm/chart.js@4` |
| Playfair Display | Google Fonts (weights 400, 600, 700) |
| Inter | Google Fonts (weights 400, 500, 600) |

All app logic lives in a single `<script>` block. No React, no Babel, no Tailwind — vanilla JS with D3.

---

## Color System

| Role | Variable / Value |
|---|---|
| Page / canvas background | `--cream: #f5f0e8` |
| Panel / toolbar background | `--parchment: #e8e0d0` |
| Drawer / card background | `--drawer-bg: #faf6ef` |
| Primary text | `--ink: #2c2416` |
| Secondary / muted text | `--ink-light: #6b5c42` |
| Unvisited fill | `--unvisited: #d4c9b5` |
| Border | `--border: #c4b89a` |
| Visited / primary accent | `--terracotta: #c4622d` |
| Secondary accent (nature) | `--forest: #3d6b47` |

Park-type dot colors are fixed semantic values: forest green for National Parks, amber for Monuments, teal for Recreation Areas, etc. Do not reassign these without updating the legend.

---

## Typography

- **Headings / labels:** Playfair Display (`--font-serif`). Used for app name, drawer headers, section titles, table column headers.
- **Body / UI text:** Inter (`--font-sans`). Used for toolbar controls, table cells, tags, form labels.
- **App name in top bar:** Playfair Display, ~22 px, `letter-spacing: 3px`, uppercase.

---

## Chrome Layout

```
┌──────────────────────────────────────────────────────────┐
│  #top-bar: ATLAS branding  +  tab navigation             │  ← always visible, dark ink background
├──────────────────────────────────────────────────────────┤
│  #filter-bar: unified full-width filter / view controls  │  ← always visible, parchment background
├──────────────────────────────────────────────────────────┤
│                                                          │
│  #content: active tab panel (see page types below)       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Top bar (`#top-bar`)

Dark ink background (`--ink`), full width, never scrolls.

- Left: App name `ATLAS` in Playfair Display + terracotta underline on active tab.
- Right of name: `<nav id="tabs">` with one `<button class="tab">` per page.
- Active tab: `color: var(--cream); border-bottom: 2px solid var(--terracotta)`.

### Unified filter bar

Full-width strip directly below `#top-bar`, parchment background, `border-bottom: 1px solid var(--border)`. Always visible.

- On the **Map tab**: layer toggles (States / Parks checkboxes) + tag-filter text input.
- On **States / Parks / Countries tabs**: visited filter dropdown + any type/region dropdowns for that dataset + a text search input. The map mini-view and the table both respond to the same filter bar values.
- On the **Stats tab**: optional year-range picker (future).
- Controls are `<select>` / `<input>` using `padding: 5–6px 8–10px; border: 1px solid var(--border); border-radius: 4px; background: var(--cream); font-family: var(--font-sans); font-size: 12–13px`.

---

## Page Types

### 1 — Visual Focus (Map tab)

Used when the primary experience is the interactive map itself.

```
┌──────────────────────────────────────────────────────────┐
│  top-bar + filter-bar                                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Full-viewport interactive map (D3 SVG, stretch-to-fit)  │
│                                                          │
│  Legend overlay (bottom-left, semi-transparent card)     │
└──────────────────────────────────────────────────────────┘
│  Detail drawer slides in from the right on click         │
```

Rules:
- Map fills `flex: 1` of the remaining viewport — no hard-coded pixel heights.
- Detail on click: opens `#detail-drawer` (right-side overlay, 380 px wide).
- The drawer is the **only** detail view — no inline info panels on this tab.
- Legend is an absolutely-positioned overlay inside `#map-container`, never in the chrome.

### 2 — Split Master/Detail (States, Parks, Countries tabs)

Used when the page has both a map overview and a browsable/searchable table.

```
┌──────────────────────────────────────────────────────────┐
│  top-bar + filter-bar (unified, drives both panes)       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Map pane — ~60% of remaining height, full width         │
│  (interactive mini-map, responds to filter-bar)          │
│                                                          │
├────────────────────────── ↕ drag ────────────────────────┤
│                                                          │
│  Table pane — ~40% of remaining height, full width       │
│  (sortable, scrollable, responds to filter-bar)          │
│                                                          │
└──────────────────────────────────────────────────────────┘
│  Detail sidebar slides in from the right on click        │
│  (same #detail-drawer used across all tabs)              │
```

Rules:
- **Top/bottom split, not left/right.** Map is always the top pane, full width. Table is always the bottom pane, full width.
- The split ratio starts at 60/40 (map/table). A drag handle between the two panes allows the user to resize.
- **Unified filter bar drives both panes.** Selecting "Visited only" hides unvisited rows in the table *and* dims unvisited items on the map.
- **Detail sidebar** (`#detail-drawer`) is the primary detail view. Clicking a map item or a table row opens the drawer; there is no separate inline info panel.
- **Add/edit forms** appear only on demand: clicking "+ Add Place" or an edit button opens the relevant form (inline below the table header row, or inside the drawer). Forms default to hidden.
- The `+ Add Place` button lives in the filter bar (right side), not inside the table toolbar.
- Table has `overflow-y: auto` and a visible scrollbar track (`scrollbar-width: thin`).
- At `max-width: 700px` (mobile), the map pane collapses and only the table is shown.

### 3 — Data Overview (Stats tab)

Used for aggregate charts and summary cards.

```
┌──────────────────────────────────────────────────────────┐
│  top-bar + filter-bar (optional controls)                │
├──────────────────────────────────────────────────────────┤
│  Stat cards row (States / National Parks / Parks / Cnt.) │
├──────────────────────────────────────────────────────────┤
│  Stacked bar chart: visits per year                      │
└──────────────────────────────────────────────────────────┘
```

Rules:
- Scrollable with `overflow-y: auto`.
- Stat cards use `.stat-card` style: serif number in terracotta, progress bar.
- Chart renders into `<canvas>` managed by Chart.js; destroy and recreate on re-render.

---

## Component Patterns

### Detail Drawer (`#detail-drawer`)

Right-side sliding panel, fixed position, 380 px wide, full height. Opened by clicking any map element or table row.

- Header: place name (Playfair Display, 20 px) + subtitle (type, state, established date).
- Photo zone: drag-and-drop or click-to-upload, dashed border, max 500 KB (localStorage constraint).
- Facts strip: key/value pairs (first visit, total visits, capital/region, description excerpt).
- Visits section: chronological list of visits with date, tags, notes; "+ Add Visit" button shows inline form on click.
- Add Visit form is **hidden by default**; appears on click, dismisses on Cancel or successful save.
- Close button: `✕` top-right; overlay click also closes.
- Overlay (`#drawer-overlay`): semi-transparent `rgba(44,36,22,0.3)`, closes drawer on click.

### Tables

- `border-collapse: collapse`, `font-size: 13px`, `font-family: var(--font-sans)`.
- Sticky `<thead>` on `top: 0`; parchment background; Playfair Display column headers; sort indicator `↑`/`↓`.
- Row hover: `background: var(--parchment)`.
- Visited indicator: small terracotta dot (`8px` circle) inline before the name.
- Tag pills: `background: var(--parchment); border: 1px solid var(--border); border-radius: 12px; padding: 2px 8px; font-size: 11px`.
- Delete buttons on custom entries only: ghost style, terracotta on hover, `opacity: 0.4` default.

### Forms (Add / Edit)

- Inline, below the table header row (or inside the drawer for visit forms).
- Parchment background, `border-radius: 6px`, `padding: 14px`.
- Inputs: `padding: 6px 8px; border: 1px solid var(--border); border-radius: 4px; background: var(--cream); font-family: var(--font-sans); font-size: 13px`.
- Submit: terracotta filled button. Cancel: ghost border button.
- Required fields marked with a terracotta `*`.
- Tag chip input: inline chips with `×` remove button; dropdown suggestions from existing tags.
- Default hidden (`class="hidden"` / `display: none`); revealed only on explicit user action.

### Map Legend

- Absolutely positioned inside `#map-container`, `bottom: 12px; left: 12px`.
- Semi-transparent card: `background: rgba(250,246,239,0.93); border: 1px solid var(--border); border-radius: 6px`.
- Sections: States (visited/unvisited swatches) + Park types (colored dots with labels).
- Visible only on the Visual Focus map tab; hidden on split-view mini-maps.

---

## Data & State Management

- Storage keys: `atlas_visits`, `atlas_places`, `atlas_photos`.
- Visits: `{ id, placeId, date, estimated, tags[], notes }`.
- Custom places: `{ id, name, type, lat?, lng?, notes }`. `type: 'country'` distinguishes countries from custom park entries.
- Photos: `{ [placeId]: dataUrl }` — base64 in localStorage. Warn at >500 KB.
- IDs: `Date.now().toString(36) + Math.random().toString(36).slice(2)`.
- All HTML output uses `escapeHtml()` before insertion to prevent XSS.

---

## Todo: Bring `atlas.html` into Alignment

The following changes are needed to bring the current implementation in line with these guidelines.

### Layout & Structure

- [ ] **Extract unified filter bar.** Move all filter controls (layer toggles, tag filter, visited/type/region dropdowns, text search) out of the map pane and table toolbar into a single `#filter-bar` strip sitting directly below `#top-bar`. The filter bar should span the full width and be visible at all times on the active tab.
- [ ] **Rotate split-tab layout from left/right to top/bottom.** Currently the States, Parks, and Countries tabs use a 40%-left-map / 60%-right-table side-by-side layout. Change these to a stacked layout: map pane on top (~60% of remaining height, full width), table pane on bottom (~40%, full width). Update `.split-tab`, `.tab-left-col`, `.tab-map-pane`, `.tab-table-pane`, and related CSS.
- [ ] **Add drag handle between map and table panes.** Insert a `<div class="pane-drag-handle">` between the two panes with `cursor: ns-resize`. Wire `mousedown`/`mousemove`/`mouseup` to resize the map pane height.
- [ ] **Remove inline info panels.** Delete the `.tab-info-panel` / `#states-info-panel` / `#parks-info-panel` / `#countries-info-panel` elements and their CSS. The `#detail-drawer` replaces them as the sole detail view.
- [ ] **Update click handlers on split tabs.** Clicking a map item or table row on States/Parks/Countries tabs should call `openDrawer()` directly (not `selectPlace()` → `renderInfoPanel()`). Remove or repurpose `selectPlace()` and `renderInfoPanel()`.

### Filter Bar

- [ ] **States tab filter bar:** move the region and visited `<select>` elements plus the name/tag text search into `#filter-bar` when the States tab is active (or render a tab-specific filter bar section below `#top-bar`).
- [ ] **Parks tab filter bar:** move type, state, and visited `<select>` elements plus the name/tag/state text search into the filter bar. Move the "+ Add Place" button to the right end of the filter bar.
- [ ] **Countries tab filter bar:** move the visited `<select>` plus the text search into the filter bar. Move "+ Add Country" to the right end.
- [ ] **Map tab filter bar:** keep layer toggles (States / Parks) and the tag-filter input in the filter bar. Remove `#map-toolbar` from inside the tab panel.

### Detail Drawer

- [ ] **Open drawer directly from split-tab map clicks and table row clicks.** Currently split-tab interactions open the info panel instead of the drawer.
- [ ] **Consolidate info panel data into the drawer.** Any quick-facts shown in the info panel (name, subtitle, first visit, total visits, description excerpt) should already appear in `renderDrawerFacts()` — verify completeness and remove the info panel.

### Forms

- [ ] **Move "Add Place" and "Add Country" forms into the drawer (or keep inline below filter bar).** Evaluate whether showing forms inline below the table header or as a drawer panel provides a cleaner UX. Either way, forms must be hidden by default and only appear on explicit user action.
- [ ] **Remove `alert()` calls.** Replace the `alert('Please add at least one tag.')` in visit-form submit and the photo-size alert with inline validation messages or a non-blocking toast element.

### Mobile / Responsive

- [ ] **Update mobile breakpoint for top/bottom layout.** Currently `@media (max-width: 700px) { .tab-left-col { display: none; } }` hides the left column. For the new top/bottom layout, collapse the map pane to 0 height (or a small fixed height) on narrow screens instead.

### Minor / Polish

- [ ] **Thin scrollbar on table pane.** Add `scrollbar-width: thin; scrollbar-color: var(--border) transparent` to `.table-wrap` for a cleaner look.
- [ ] **Suppress legend on split-tab mini-maps.** The `renderMapLegend()` call should only run for the main Map tab, not for mini-maps in States/Parks/Countries tabs.
- [ ] **Re-evaluate Stats tab filter bar.** Currently no filter controls exist on Stats. Consider adding a year-range or category toggle in the unified filter bar when this tab is active.
