# Data Apps — UI Guidelines

Guidelines for building **apps-data** in this repo. Data-apps is a design category: analytical, data-first, single-file dashboards built around fixed or embedded datasets. The focus is interactive exploration — charts, maps, sortable tables, sliders, and filters — rather than user-editable data. See `apps-data/vote-analysis/index.html` for the reference implementation.

---

## Philosophy

- **Data-first.** The dataset is fixed and ships with the app; there is no user-entered content to persist. The entire value is in how the data is presented and explored.
- **Single HTML file.** No build step. D3, Chart.js, and other heavy libs are loaded from CDN. The app runs directly from the filesystem.
- **Dark analytical aesthetic.** Deep navy background, muted grid lines, and high-contrast accent colours that reflect the data semantics (e.g. blue = Democrat, red = Republican, green = positive, red = negative).
- **Interaction is exploration.** Every control — year buttons, toggles, sort headers, state chips, sliders — filters or transforms the view. There are no save/delete operations.
- **Tabs over pages.** Organise multiple views (map, table, chart, summary) behind a tab bar instead of separate pages.

---

## Tech Stack

| Dependency | CDN |
|---|---|
| D3 v7 | `https://cdn.jsdelivr.net/npm/d3@7` |
| TopoJSON client | `https://cdn.jsdelivr.net/npm/topojson-client@3` |
| Chart.js v4 | `https://cdn.jsdelivr.net/npm/chart.js@4` |
| Google Fonts (IBM Plex Mono + Sans) | via `@import` in `<style>` |

Load only what you need. Skip TopoJSON if there is no map; skip Chart.js if all charts are hand-drawn SVG.

---

## Color System

Data-apps use a fixed dark palette. All colours are defined as CSS custom properties on `:root`.

### Base palette

| Variable | Value | Use |
|---|---|---|
| `--bg` | `#070b13` | Page background |
| `--bg1` | `#0b1020` | Header / tab bar surface |
| `--bg2` | `#0f1828` | Panel / card surface |
| `--bg3` | `#141e32` | Input / chip background |
| `--border` | `#1e2d42` | Primary border |
| `--border2` | `#243350` | Elevated border |
| `--text` | `#bccadf` | Primary text |
| `--muted` | `#485a72` | Secondary / label text |
| `--dim` | `#283858` | Disabled / placeholder |

### Semantic data colours

Define semantic pairs for each data dimension. Example for partisan data:

| Variable | Value | Meaning |
|---|---|---|
| `--d-strong` | `#0f3a9f` | Strong Democratic |
| `--d-mid` | `#1e58cc` | Democratic |
| `--d-lean` | `#5a8de8` | Lean Democratic |
| `--d-text` | `#78acf2` | Democratic text / accent |
| `--r-strong` | `#8f0f1a` | Strong Republican |
| `--r-mid` | `#c01e28` | Republican |
| `--r-lean` | `#e05060` | Lean Republican |
| `--r-text` | `#f07888` | Republican text / accent |

Other common semantic pairs: green/red for positive/negative financial data, amber for warnings, cyan for neutral highlights.

---

## Typography

Both IBM Plex Mono and IBM Plex Sans are loaded from Google Fonts.

- **IBM Plex Mono** (`--mono`) — default body font. Use for all data values, labels, and controls.
- **IBM Plex Sans** (`--sans`) — use sparingly for prose descriptions or tooltip narrative text.

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
```

### Type scale

| Use | Style |
|---|---|
| App logo | `13px, weight 600, letter-spacing 0.16em` |
| Tab label | `10px, weight 500, letter-spacing 0.12em, uppercase` |
| Section title | `9px, letter-spacing 0.12em, uppercase, color --muted` |
| Table header | `9px, letter-spacing 0.11em, uppercase, color --muted` |
| Body data | `11–12px` |
| Small label | `9px, letter-spacing 0.08–0.1em` |

---

## Layout Patterns

### Page structure

```
┌──────────────────────────────────────────┐
│  header: logo │ year/filter controls     │
├──────────────────────────────────────────┤
│  score / summary strip (optional)        │
├──────────────────────────────────────────┤
│  tab bar                                 │
├──────────────────────────────────────────┤
│                                          │
│  tab content (fills remaining height)   │
│                                          │
└──────────────────────────────────────────┘
```

- Use `display:flex; flex-direction:column; height:100vh` on `body` and `flex:1; overflow:hidden` on `#app-body` so the content area fills exactly the viewport.
- Tab panels use `display:none` / `display:flex; flex-direction:column` toggling with `height:100%` so each panel owns its own scrollable area.
- The header and score bar are `flex-shrink:0` — they never compress.

### Header

The header holds:
1. **Logo** — app name in all-caps mono, accented with a semantic color.
2. **Sub-label** — small muted subtitle (dataset description, year range).
3. **Primary controls** — year/period selector buttons, or a slider. Placed immediately after the logo.
4. **Secondary controls** — view toggles (e.g. Winner / Margin mode). Use `margin-left:auto` to push to the right edge.

### Score / summary strip

An optional thin bar below the header showing the top-level KPIs at a glance (e.g. Electoral College split). Use `height:32px`, two flanking stat panels, and a proportional fill bar in the middle.

### Tab bar

```css
.tab { font-family:var(--mono); font-size:10px; font-weight:500; letter-spacing:0.12em;
       text-transform:uppercase; padding:8px 15px; border-bottom:2px solid transparent; }
.tab.active { color:var(--d-text); border-bottom-color:var(--d-text); }
```

Active tab colour should match the primary semantic accent for that app.

---

## Component Patterns

### Year / period selector buttons

Group buttons for discrete time periods (e.g. election years). Apply `active` class to the selected button.

```css
.year-btn { font-family:var(--mono); font-size:10px; padding:3px 9px;
            background:var(--bg2); border:1px solid var(--border); color:var(--muted); }
.year-btn.active { color:var(--text); border-color:var(--d-text); background:rgba(30,88,204,0.13); }
```

### Choropleth map (D3)

- Fetch TopoJSON from CDN using `fetch()`; show an inline fallback message on error.
- Use `d3.geoAlbersUsa().fitSize([W, H], states)` for US state maps.
- Match features to data via FIPS codes; maintain a `FIPS_TO_ABBR` lookup.
- Apply colours via `.attr('fill', fn)` on re-render; never re-create the SVG on year change.
- Provide a **hover tooltip** positioned with `event.pageX / pageY` showing the key metrics.
- Provide a **legend** absolutely positioned within the map container.
- Support at minimum two color modes: a discrete **winner** scale (strong / solid / lean) and a **continuous gradient**.

### Data table

- Full-width, sticky `<thead>`.
- Click on any `<th>` to sort ascending/descending; show `↑`/`↓` suffix on the active sort column.
- Row hover: `background:var(--bg2)`.
- Inline **margin bar** (a small two-sided bar showing directional magnitude) next to numeric margin values.
- **Winner badge** (small colored pill) showing the winning candidate name.

### Trend chart (Chart.js line)

- Line chart with one dataset per selected state/dimension.
- Y-axis shows the margin or delta; zero line is highlighted with higher opacity.
- Tooltip: monospace font, dark background matching app theme.
- Support **preset buttons** (e.g. Swing States, Rust Belt) to quickly load a curated state selection.
- Colour each line by the entity's current partisan/directional lean.

### Summary cards

Use a two-column CSS grid of cards (`background:var(--bg2); border:1px solid var(--border)`). Span the most important card full-width with `.wide { grid-column: 1 / -1 }`.

Each card has:
- A `9px uppercase letter-spaced` title in `--muted`.
- A thin `border-bottom` separator below the title.
- Content specific to the metric (bar chart, stat grid, ranked list, flip list).

### Stat box

```css
.stat-box { background:var(--bg3); border-radius:2px; padding:8px 10px; }
.stat-box-label { font-size:8px; letter-spacing:0.09em; text-transform:uppercase; color:var(--muted); }
.stat-box-val   { font-size:13px; font-weight:600; }
```

---

## Scanline overlay

Apply a subtle scanline texture to the body for visual texture:

```css
body::before {
  content: '';
  position: fixed; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px);
  pointer-events: none; z-index: 1000;
}
```

---

## Data conventions

- Keep data in **external JSON files** alongside `index.html`, not embedded in the script block. Each file is a flat array of objects — one logical "table" per file. Name files semantically after their content (`states.json`, `elections.json`, `results.json`), not generically (`data.json`).
- Fetch all data files on boot using `Promise.all`, alongside any CDN data (e.g. TopoJSON). Build in-memory lookup objects from the raw arrays after loading.
- Use lookup helpers (`getResult(abbr, year)`, `getEV(abbr, year)`) so rendering functions stay concise.
- Keep raw numbers as numbers (not strings); format only at render time with `.toFixed(1)`.
- Data files must be sourced from authoritative references (official government sources, academic datasets, etc.). Never invent or estimate figures.

### Raw data processing

The repo has a shared `data/` layer for all derived datasets. Raw downloads are never committed.

```
data/
  raw/{category}/      ← gitignored large downloads; *.md files committed (see README.md in each folder)
  derived/{category}/  ← committed processed JSON files; apps copy what they need into their own directory
  scripts/{category}/  ← committed transform scripts
  {category}.md        ← source citations, schemas, and update procedures for the category
```

**Conventions:**

- **Transform scripts** live in `data/scripts/{category}/` and are committed. Use `__dirname`-based paths so scripts run correctly regardless of working directory. Output goes to `data/derived/{category}/`; copy derived files into the app directory after running.
- **Intermediate files** (e.g. a full transform output where only a subset is used downstream) live in `data/raw/{category}/` and are gitignored.
- **`data/{category}.md`** is the authoritative doc for each data category. It covers:
  - Each derived file: fields, schema, and authoritative source URL
  - Each raw source file: download URL and the transform script / column mapping used
  - Update procedure for adding new data
- **`data/raw/{category}/README.md`** (committed) lists the raw files that must be downloaded locally and the commands to run the transforms.
- Keep one section per derived file, not per source. If multiple raw sources feed one derived file, list each source within that section.

---

## Building a New App in This Ecosystem

Checklist for starting a new data-app:

- [ ] Create a subdirectory under `apps-data/` (e.g. `apps-data/my-app/`)
- [ ] Start from `apps-data/vote-analysis/index.html` — copy the HTML skeleton (header, score bar, tabs, app-body, scanline)
- [ ] Copy the full `:root` CSS variable block; rename semantic vars to match your data domain
- [ ] Load only the CDN libs you need (D3 + TopoJSON for maps, Chart.js for charts)
- [ ] Create semantic JSON data files (one flat array per file); fetch them all in `Promise.all` on boot
- [ ] Add (or extend) `data/{category}.md` documenting each file's fields, source URL, and update procedure
- [ ] Add `data/raw/{category}/README.md` listing raw files to download and transform commands
- [ ] Implement lookup helpers so rendering functions are concise
- [ ] Year/period selector: build dynamically from the loaded periods array
- [ ] If including a map: fetch TopoJSON, handle errors gracefully, never re-initialise the SVG on data change
- [ ] If including a chart: initialise once, call `.data.datasets = …` + `.update()` on subsequent renders
- [ ] Summary tab: always include a full-width electoral/aggregate KPI card at the top
- [ ] Responsive: collapse the summary grid to single column below 600px
- [ ] Add entry to `index.html` APPS array with `category: 'apps-data'`
- [ ] Update `README.md` under the `apps-data` category section
