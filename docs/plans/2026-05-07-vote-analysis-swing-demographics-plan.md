# Vote Analysis: Swing Overlay + Demographics Tab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a SWING map/table overlay showing per-state partisan shift vs the prior election, and a new DEMOGRAPHICS tab with a scatter plot correlating five 2020 ACS variables against the selected year's D−R margin.

**Architecture:** All changes are to `apps-data/vote-analysis/index.html` (HTML structure, CSS, and JS) plus two new/updated data files (`demographics.json`, `data-notes.md`). Boot fetches demographics.json alongside the existing three files. No new libraries needed — regression is computed inline (~10 lines).

**Tech Stack:** Vanilla JS, D3 v7 (map only), Chart.js v4, 2020 ACS 5-year Census data.

---

## Task 1: Create demographics.json

**Files:**
- Create: `apps-data/vote-analysis/demographics.json`

**Step 1: Create the file with 2020 ACS 5-year data**

Values sourced from: ACS Table S1501 (education), S1901 (income), P2 (urban), P1 (race), S0101 (age).

```json
[
  { "abbr": "AL", "pct_bachelors": 25.5, "median_hh_income": 52035, "pct_urban": 59.0, "pct_white_nh": 65.3, "median_age": 39.2 },
  { "abbr": "AK", "pct_bachelors": 29.7, "median_hh_income": 77790, "pct_urban": 66.0, "pct_white_nh": 60.0, "median_age": 34.6 },
  { "abbr": "AZ", "pct_bachelors": 30.8, "median_hh_income": 62055, "pct_urban": 89.8, "pct_white_nh": 54.1, "median_age": 37.9 },
  { "abbr": "AR", "pct_bachelors": 23.4, "median_hh_income": 49475, "pct_urban": 56.2, "pct_white_nh": 72.2, "median_age": 38.3 },
  { "abbr": "CA", "pct_bachelors": 34.9, "median_hh_income": 78672, "pct_urban": 95.0, "pct_white_nh": 36.4, "median_age": 37.0 },
  { "abbr": "CO", "pct_bachelors": 41.8, "median_hh_income": 77127, "pct_urban": 86.2, "pct_white_nh": 67.7, "median_age": 36.9 },
  { "abbr": "CT", "pct_bachelors": 40.3, "median_hh_income": 83771, "pct_urban": 88.0, "pct_white_nh": 67.6, "median_age": 41.0 },
  { "abbr": "DE", "pct_bachelors": 33.2, "median_hh_income": 70176, "pct_urban": 83.3, "pct_white_nh": 59.5, "median_age": 41.1 },
  { "abbr": "DC", "pct_bachelors": 60.1, "median_hh_income": 90842, "pct_urban": 100.0, "pct_white_nh": 37.5, "median_age": 34.0 },
  { "abbr": "FL", "pct_bachelors": 31.6, "median_hh_income": 59227, "pct_urban": 91.2, "pct_white_nh": 53.0, "median_age": 42.2 },
  { "abbr": "GA", "pct_bachelors": 32.7, "median_hh_income": 61224, "pct_urban": 75.1, "pct_white_nh": 52.1, "median_age": 37.0 },
  { "abbr": "HI", "pct_bachelors": 33.7, "median_hh_income": 87526, "pct_urban": 91.9, "pct_white_nh": 22.9, "median_age": 39.2 },
  { "abbr": "ID", "pct_bachelors": 27.7, "median_hh_income": 60999, "pct_urban": 70.6, "pct_white_nh": 82.6, "median_age": 36.6 },
  { "abbr": "IL", "pct_bachelors": 35.8, "median_hh_income": 68428, "pct_urban": 88.5, "pct_white_nh": 60.8, "median_age": 38.5 },
  { "abbr": "IN", "pct_bachelors": 27.1, "median_hh_income": 58235, "pct_urban": 72.4, "pct_white_nh": 76.5, "median_age": 37.9 },
  { "abbr": "IA", "pct_bachelors": 29.1, "median_hh_income": 61836, "pct_urban": 64.0, "pct_white_nh": 85.0, "median_age": 38.4 },
  { "abbr": "KS", "pct_bachelors": 33.7, "median_hh_income": 62087, "pct_urban": 74.2, "pct_white_nh": 76.3, "median_age": 37.2 },
  { "abbr": "KY", "pct_bachelors": 24.9, "median_hh_income": 54357, "pct_urban": 58.4, "pct_white_nh": 84.0, "median_age": 39.1 },
  { "abbr": "LA", "pct_bachelors": 24.6, "median_hh_income": 51073, "pct_urban": 73.2, "pct_white_nh": 57.5, "median_age": 37.7 },
  { "abbr": "ME", "pct_bachelors": 34.0, "median_hh_income": 63115, "pct_urban": 38.7, "pct_white_nh": 93.5, "median_age": 44.9 },
  { "abbr": "MD", "pct_bachelors": 41.5, "median_hh_income": 90203, "pct_urban": 87.2, "pct_white_nh": 51.1, "median_age": 38.8 },
  { "abbr": "MA", "pct_bachelors": 46.9, "median_hh_income": 84385, "pct_urban": 92.0, "pct_white_nh": 71.1, "median_age": 39.5 },
  { "abbr": "MI", "pct_bachelors": 30.7, "median_hh_income": 61295, "pct_urban": 74.6, "pct_white_nh": 74.0, "median_age": 39.8 },
  { "abbr": "MN", "pct_bachelors": 37.0, "median_hh_income": 77720, "pct_urban": 73.3, "pct_white_nh": 79.1, "median_age": 38.0 },
  { "abbr": "MS", "pct_bachelors": 22.3, "median_hh_income": 47074, "pct_urban": 50.0, "pct_white_nh": 56.6, "median_age": 37.7 },
  { "abbr": "MO", "pct_bachelors": 30.5, "median_hh_income": 57290, "pct_urban": 70.4, "pct_white_nh": 78.9, "median_age": 38.6 },
  { "abbr": "MT", "pct_bachelors": 32.5, "median_hh_income": 58328, "pct_urban": 55.9, "pct_white_nh": 86.4, "median_age": 39.9 },
  { "abbr": "NE", "pct_bachelors": 33.7, "median_hh_income": 63229, "pct_urban": 75.2, "pct_white_nh": 78.0, "median_age": 36.7 },
  { "abbr": "NV", "pct_bachelors": 25.7, "median_hh_income": 64340, "pct_urban": 94.2, "pct_white_nh": 47.5, "median_age": 38.2 },
  { "abbr": "NH", "pct_bachelors": 38.4, "median_hh_income": 88235, "pct_urban": 60.3, "pct_white_nh": 89.8, "median_age": 43.0 },
  { "abbr": "NJ", "pct_bachelors": 41.4, "median_hh_income": 89033, "pct_urban": 94.7, "pct_white_nh": 55.0, "median_age": 39.8 },
  { "abbr": "NM", "pct_bachelors": 28.1, "median_hh_income": 52032, "pct_urban": 77.4, "pct_white_nh": 36.5, "median_age": 38.1 },
  { "abbr": "NY", "pct_bachelors": 37.6, "median_hh_income": 72108, "pct_urban": 87.9, "pct_white_nh": 55.3, "median_age": 39.0 },
  { "abbr": "NC", "pct_bachelors": 31.9, "median_hh_income": 57341, "pct_urban": 66.1, "pct_white_nh": 62.6, "median_age": 38.9 },
  { "abbr": "ND", "pct_bachelors": 29.9, "median_hh_income": 64894, "pct_urban": 59.9, "pct_white_nh": 84.9, "median_age": 35.2 },
  { "abbr": "OH", "pct_bachelors": 29.6, "median_hh_income": 60338, "pct_urban": 77.9, "pct_white_nh": 79.0, "median_age": 39.3 },
  { "abbr": "OK", "pct_bachelors": 25.5, "median_hh_income": 54449, "pct_urban": 66.2, "pct_white_nh": 64.7, "median_age": 36.8 },
  { "abbr": "OR", "pct_bachelors": 35.2, "median_hh_income": 67058, "pct_urban": 81.0, "pct_white_nh": 75.6, "median_age": 39.7 },
  { "abbr": "PA", "pct_bachelors": 33.1, "median_hh_income": 63463, "pct_urban": 78.7, "pct_white_nh": 75.0, "median_age": 40.9 },
  { "abbr": "RI", "pct_bachelors": 36.2, "median_hh_income": 70305, "pct_urban": 90.7, "pct_white_nh": 71.5, "median_age": 40.2 },
  { "abbr": "SC", "pct_bachelors": 29.2, "median_hh_income": 56227, "pct_urban": 66.3, "pct_white_nh": 62.2, "median_age": 39.9 },
  { "abbr": "SD", "pct_bachelors": 29.4, "median_hh_income": 62873, "pct_urban": 56.7, "pct_white_nh": 82.0, "median_age": 37.1 },
  { "abbr": "TN", "pct_bachelors": 27.1, "median_hh_income": 54833, "pct_urban": 66.4, "pct_white_nh": 73.5, "median_age": 38.9 },
  { "abbr": "TX", "pct_bachelors": 31.9, "median_hh_income": 63826, "pct_urban": 84.7, "pct_white_nh": 41.2, "median_age": 35.5 },
  { "abbr": "UT", "pct_bachelors": 34.6, "median_hh_income": 74197, "pct_urban": 90.6, "pct_white_nh": 78.7, "median_age": 31.0 },
  { "abbr": "VT", "pct_bachelors": 41.5, "median_hh_income": 67001, "pct_urban": 38.9, "pct_white_nh": 93.8, "median_age": 43.0 },
  { "abbr": "VA", "pct_bachelors": 40.4, "median_hh_income": 80615, "pct_urban": 75.5, "pct_white_nh": 61.2, "median_age": 38.6 },
  { "abbr": "WA", "pct_bachelors": 37.8, "median_hh_income": 78687, "pct_urban": 84.8, "pct_white_nh": 66.2, "median_age": 37.8 },
  { "abbr": "WV", "pct_bachelors": 21.6, "median_hh_income": 51248, "pct_urban": 48.7, "pct_white_nh": 93.0, "median_age": 42.9 },
  { "abbr": "WI", "pct_bachelors": 31.3, "median_hh_income": 64168, "pct_urban": 70.2, "pct_white_nh": 82.0, "median_age": 39.5 },
  { "abbr": "WY", "pct_bachelors": 27.5, "median_hh_income": 65304, "pct_urban": 64.8, "pct_white_nh": 83.7, "median_age": 38.4 }
]
```

**Step 2: Verify 51 entries**

```bash
node -e "const d = require('./apps-data/vote-analysis/demographics.json'); console.log(d.length)"
```
Expected: `51`

**Step 3: Commit**

```bash
git add apps-data/vote-analysis/demographics.json
git commit -m "data: add 2020 ACS demographics data for vote-analysis"
```

---

## Task 2: Update data-notes.md

**Files:**
- Modify: `apps-data/vote-analysis/data-notes.md`

**Step 1: Add demographics.json section**

Append to the file after the existing `states.json` section:

```markdown
### `demographics.json`
One row per state/district. Fields: `abbr`, `pct_bachelors`, `median_hh_income`, `pct_urban`, `pct_white_nh`, `median_age`.

This is a static 2020 ACS 5-year snapshot — not updated per election year.

| Field | Description | ACS Table |
|---|---|---|
| `pct_bachelors` | % adults 25+ with bachelor's degree or higher | S1501 |
| `median_hh_income` | Median household income (USD) | S1901 |
| `pct_urban` | % population in urban areas | 2020 Census P2 |
| `pct_white_nh` | % white non-Hispanic | 2020 Census P1 |
| `median_age` | Median age | S0101 |

**Source:** [US Census Bureau — American Community Survey 2020 5-year estimates](https://data.census.gov/)
```

**Step 2: Commit**

```bash
git add apps-data/vote-analysis/data-notes.md
git commit -m "docs: document demographics.json sources in data-notes"
```

---

## Task 3: Swing map mode

**Files:**
- Modify: `apps-data/vote-analysis/index.html`

This task adds the SWING button to the header, the `stateSwingColor()` helper, the swing legend, and the swing row in the map tooltip.

**Step 1: Add SWING button to HTML**

Find the `#map-mode-toggle` div in the HTML (around line 327):

```html
<div id="map-mode-toggle">
  <button class="mode-btn active" data-mode="winner">WINNER</button>
  <button class="mode-btn" data-mode="margin">MARGIN</button>
</div>
```

Replace with:

```html
<div id="map-mode-toggle">
  <button class="mode-btn active" data-mode="winner">WINNER</button>
  <button class="mode-btn" data-mode="margin">MARGIN</button>
  <button class="mode-btn" data-mode="swing" id="btn-swing-mode">SWING</button>
</div>
```

**Step 2: Add CSS for disabled mode button**

In the `<style>` block, after the `.mode-btn.active` rule, add:

```css
.mode-btn:disabled { opacity: 0.35; cursor: not-allowed; }
```

**Step 3: Add `stateSwingColor()` helper in JS**

In the `// HELPERS` section of the script, after the `stateColor()` function, add:

```js
function stateSwingColor(abbr, year) {
  const prevYear = ELECTIONS[ELECTIONS.indexOf(year) - 1];
  if (!prevYear) return 'var(--dim)';
  const swing = getMargin(abbr, year) - getMargin(abbr, prevYear);
  if (swing >  15) return '#0e3b9e';
  if (swing >   5) return '#1e58cc';
  if (swing >   0) return '#5a8de8';
  if (swing >  -5) return '#e07080';
  if (swing > -15) return '#c03040';
  return '#8e0f1a';
}

function getSwing(abbr, year) {
  const prevYear = ELECTIONS[ELECTIONS.indexOf(year) - 1];
  if (!prevYear) return null;
  return +(getMargin(abbr, year) - getMargin(abbr, prevYear)).toFixed(1);
}
```

**Step 4: Update `renderMap()` to use swing color**

Find `renderMap()`:

```js
function renderMap() {
  if (!mapSvgG) return;
  mapSvgG.selectAll('.state-path').attr('fill', function(d) {
    const fips = String(d.id).padStart(2, '0');
    const abbr = FIPS_TO_ABBR[fips];
    return abbr ? stateColor(abbr, currentYear, mapMode) : 'var(--dim)';
  });
}
```

Replace with:

```js
function renderMap() {
  if (!mapSvgG) return;
  mapSvgG.selectAll('.state-path').attr('fill', function(d) {
    const fips = String(d.id).padStart(2, '0');
    const abbr = FIPS_TO_ABBR[fips];
    if (!abbr) return 'var(--dim)';
    return mapMode === 'swing' ? stateSwingColor(abbr, currentYear) : stateColor(abbr, currentYear, mapMode);
  });
}
```

**Step 5: Update `updateLegend()` for swing mode**

Find `updateLegend()` and add a swing branch. The function currently has an `if/else` for winner/margin. Restructure it:

```js
function updateLegend() {
  const titles = { winner: 'MARGIN SCALE', margin: 'MARGIN GRADIENT', swing: 'SWING SCALE' };
  document.getElementById('legend-title').textContent = titles[mapMode] || 'SCALE';
  const items = document.getElementById('legend-items');
  if (mapMode === 'winner') {
    items.innerHTML = `
      <div class="legend-item"><div class="legend-swatch" style="background:#0e3b9e"></div>Strong D (&gt;+15)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#1e58cc"></div>Solid D (+5 – +15)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#5a8de8"></div>Lean D (0 – +5)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#e07080"></div>Lean R (0 – +5)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#c03040"></div>Solid R (+5 – +15)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#8e0f1a"></div>Strong R (&gt;+15)</div>`;
  } else if (mapMode === 'margin') {
    items.innerHTML = `
      <div style="height:11px;border-radius:2px;background:linear-gradient(90deg,#0e3bbd,#8840b8,#b8101e);margin-bottom:5px"></div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--muted)">
        <span>D+40</span><span>Even</span><span>R+40</span>
      </div>`;
  } else {
    items.innerHTML = `
      <div class="legend-item"><div class="legend-swatch" style="background:#0e3b9e"></div>Strong D shift (&gt;+15)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#1e58cc"></div>Solid D shift (+5 – +15)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#5a8de8"></div>Lean D shift (0 – +5)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#e07080"></div>Lean R shift (0 – +5)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#c03040"></div>Solid R shift (+5 – +15)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#8e0f1a"></div>Strong R shift (&gt;+15)</div>`;
  }
}
```

**Step 6: Update map mode button click handler to disable SWING for 2008**

The existing mode button listener (in the `// MAP MODE` section) calls `updateLegend()` and `renderMap()`. After data loads, we also need to update the SWING button's disabled state whenever the year changes. 

Add a `updateSwingBtn()` helper and call it from `selectYear()` and after data boot:

```js
function updateSwingBtn() {
  const btn = document.getElementById('btn-swing-mode');
  btn.disabled = (currentYear === ELECTIONS[0]);
  if (btn.disabled && mapMode === 'swing') {
    mapMode = 'winner';
    document.querySelectorAll('.mode-btn').forEach(x =>
      x.classList.toggle('active', x.dataset.mode === 'winner'));
    updateLegend();
    if (mapSvgG) renderMap();
  }
}
```

In `selectYear()`, add a call to `updateSwingBtn()` at the end.

In the boot sequence (after `buildYearButtons()`), add a call to `updateSwingBtn()`.

**Step 7: Update map tooltip to show swing row**

In `initMap()`, find the tooltip innerHTML template. Add a swing row after the Margin row:

```js
const swing    = getSwing(abbr, currentYear);
const swingStr = swing === null ? '—'
  : (swing >= 0 ? `D +${swing}` : `R +${Math.abs(swing)}`) + ' vs ' + ELECTIONS[ELECTIONS.indexOf(currentYear) - 1];
const swingCol = swing === null ? 'var(--muted)' : swing >= 0 ? 'var(--d-text)' : 'var(--r-text)';
```

Then in the innerHTML:
```js
<div class="tt-row"><span>Swing</span><span style="color:${swingCol}">${swingStr}</span></div>
```
Add this after the existing Margin row.

**Step 8: Manual verification**

Open `apps-data/vote-analysis/index.html` via a local server. Verify:
- SWING button appears greyed out on 2008, clickable on other years
- Switching to SWING mode on 2024 shows blue/red shift colors
- Tooltip shows Swing row correctly
- Switching back to WINNER/MARGIN works

**Step 9: Commit**

```bash
git add apps-data/vote-analysis/index.html
git commit -m "feat: add swing map overlay mode to vote-analysis"
```

---

## Task 4: Swing column in By State table

**Files:**
- Modify: `apps-data/vote-analysis/index.html`

**Step 1: Add SWING column header**

Find the table header in HTML:
```html
<th data-col="margin">MARGIN</th>
<th data-col="winner">RESULT</th>
```

Replace with:
```html
<th data-col="margin">MARGIN</th>
<th data-col="swing">SWING</th>
<th data-col="winner">RESULT</th>
```

**Step 2: Add swing to row data in `renderStatesTable()`**

Find the map inside `renderStatesTable()`:
```js
return { name: m.name, abbr: m.abbr, ev: getEV(m.abbr, currentYear), d, r, margin, winner };
```

Replace with:
```js
const swing = getSwing(m.abbr, currentYear);
return { name: m.name, abbr: m.abbr, ev: getEV(m.abbr, currentYear), d, r, margin, swing, winner };
```

**Step 3: Add swing cell to row template**

In the `tbody.innerHTML` row template, find the margin cell and add the swing cell after it:

```js
<td>
  ${row.swing === null
    ? '<span style="color:var(--muted)">—</span>'
    : `<span style="color:${row.swing >= 0 ? 'var(--d-text)' : 'var(--r-text)'}">${row.swing >= 0 ? 'D +' : 'R +'}${Math.abs(row.swing).toFixed(1)}</span>`
  }
</td>
```

**Step 4: Manual verification**

- By State table shows SWING column
- 2008: all rows show `—`
- Other years: values show colored directional swing
- Clicking SWING column header sorts correctly

**Step 5: Commit**

```bash
git add apps-data/vote-analysis/index.html
git commit -m "feat: add swing column to by-state table"
```

---

## Task 5: Demographics tab

**Files:**
- Modify: `apps-data/vote-analysis/index.html`

**Step 1: Add DEMOGRAPHICS tab button in HTML**

Find the `<nav id="tabs">` block and add a fifth tab after SUMMARY:

```html
<button class="tab" data-tab="demo">DEMOGRAPHICS</button>
```

**Step 2: Add DEMOGRAPHICS tab panel HTML**

After the closing `</div>` of `tab-summary`, add:

```html
<!-- DEMOGRAPHICS TAB -->
<div id="tab-demo" class="tab-panel">
  <div id="demo-controls">
    <span class="trends-label">VARIABLE</span>
    <div id="demo-btn-row">
      <button class="demo-var-btn active" data-var="pct_bachelors">EDU</button>
      <button class="demo-var-btn" data-var="median_hh_income">INCOME</button>
      <button class="demo-var-btn" data-var="pct_urban">URBAN</button>
      <button class="demo-var-btn" data-var="pct_white_nh">RACE</button>
      <button class="demo-var-btn" data-var="median_age">AGE</button>
    </div>
    <span id="demo-var-label" style="margin-left:auto;font-size:9px;color:var(--muted);letter-spacing:0.08em"></span>
  </div>
  <div id="demo-chart-wrap">
    <canvas id="demo-chart"></canvas>
  </div>
</div>
```

**Step 3: Add CSS for demographics tab**

In the `<style>` block, add after the trends styles:

```css
/* ── DEMOGRAPHICS TAB ── */
#demo-controls {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  background: var(--bg2); border-bottom: 1px solid var(--border); flex-shrink: 0; flex-wrap: wrap;
}
#demo-btn-row { display: flex; gap: 4px; }
.demo-var-btn {
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.08em; padding: 3px 10px;
  background: var(--bg3); border: 1px solid var(--border); color: var(--muted); cursor: pointer;
  transition: all 0.1s; border-radius: 2px;
}
.demo-var-btn:hover { color: var(--text); border-color: var(--border2); }
.demo-var-btn.active { color: var(--d-text); border-color: var(--d-text); background: rgba(30,88,204,0.13); }
#demo-chart-wrap {
  flex: 1; padding: 20px 24px; overflow: hidden;
  display: flex; flex-direction: column; align-items: stretch;
}
```

**Step 4: Add DEMOGRAPHICS to `selectTab()` dispatch**

In `selectTab()`, add:
```js
if (tab === 'demo') renderDemographics();
```

**Step 5: Load demographics.json in boot**

In the `Promise.all` boot fetch, add `demographics.json`:

```js
Promise.all([
  fetch('states.json').then(r => r.json()),
  fetch('elections.json').then(r => r.json()),
  fetch('results.json').then(r => r.json()),
  fetch('demographics.json').then(r => r.json()),
  fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r => r.json()).catch(() => null),
]).then(([statesData, electionsData, resultsData, demoData, topo]) => {
```

Declare `DEMOGRAPHICS` at the top with the other data variables:
```js
let STATE_META, ELECTIONS, CANDIDATES, NATIONAL_PV, RESULTS, DEMOGRAPHICS;
```

After loading, build a lookup object:
```js
DEMOGRAPHICS = Object.fromEntries(demoData.map(d => [d.abbr, d]));
```

**Step 6: Add JS for demographics scatter**

Add the following to the script, in a new `// DEMOGRAPHICS` section before `// BOOT`:

```js
// ═══════════════════════════════════════════════════════════════════
//  DEMOGRAPHICS
// ═══════════════════════════════════════════════════════════════════
const DEMO_VARS = {
  pct_bachelors:    { label: '% Bachelor\'s Degree or Higher', fmt: v => v.toFixed(1) + '%' },
  median_hh_income: { label: 'Median Household Income',        fmt: v => '$' + v.toLocaleString() },
  pct_urban:        { label: '% Urban Population',             fmt: v => v.toFixed(1) + '%' },
  pct_white_nh:     { label: '% White Non-Hispanic',           fmt: v => v.toFixed(1) + '%' },
  median_age:       { label: 'Median Age',                     fmt: v => v.toFixed(1) },
};

let currentDemoVar = 'pct_bachelors';
let demoChart = null;

function linearRegression(points) {
  const n = points.length;
  const sumX  = points.reduce((s, p) => s + p.x, 0);
  const sumY  = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function buildDemoButtons() {
  document.querySelectorAll('.demo-var-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentDemoVar = btn.dataset.var;
      document.querySelectorAll('.demo-var-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.var === currentDemoVar));
      document.getElementById('demo-var-label').textContent =
        DEMO_VARS[currentDemoVar].label;
      renderDemographics();
    });
  });
  document.getElementById('demo-var-label').textContent =
    DEMO_VARS[currentDemoVar].label;
}

function renderDemographics() {
  if (!DEMOGRAPHICS) return;
  const varMeta = DEMO_VARS[currentDemoVar];
  const points  = STATE_META
    .filter(m => DEMOGRAPHICS[m.abbr])
    .map(m => ({
      abbr:    m.abbr,
      x:       DEMOGRAPHICS[m.abbr][currentDemoVar],
      y:       getMargin(m.abbr, currentYear),
      winner:  getWinner(m.abbr, currentYear),
    }));

  const { slope, intercept } = linearRegression(points);
  const xs   = points.map(p => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

  const scatterDataset = {
    type: 'scatter',
    label: 'States',
    data: points.map(p => ({ x: p.x, y: p.y, abbr: p.abbr, winner: p.winner })),
    backgroundColor: points.map(p => p.winner === 'D' ? 'rgba(120,172,242,0.85)' : 'rgba(240,120,136,0.85)'),
    pointRadius: 5,
    pointHoverRadius: 7,
  };

  const regressionDataset = {
    type: 'line',
    label: 'Trend',
    data: [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept },
    ],
    borderColor: 'rgba(255,255,255,0.22)',
    borderDash: [4, 4],
    borderWidth: 1.5,
    pointRadius: 0,
    fill: false,
  };

  const cfg = {
    type: 'scatter',
    data: { datasets: [scatterDataset, regressionDataset] },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 200 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0b1020',
          borderColor: '#1e2d42',
          borderWidth: 1,
          titleColor: '#bccadf',
          bodyColor: '#485a72',
          callbacks: {
            title: ctx => ctx[0]?.raw?.abbr ?? '',
            label: ctx => {
              if (!ctx.raw.abbr) return '';
              const margin = ctx.parsed.y;
              return [
                `  ${varMeta.label}: ${varMeta.fmt(ctx.parsed.x)}`,
                `  D−R Margin: ${margin >= 0 ? '+' : ''}${margin.toFixed(1)}%`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(30,45,66,0.6)' },
          ticks: {
            color: '#485a72',
            font: { family: "'IBM Plex Mono'", size: 10 },
            callback: v => varMeta.fmt(v),
          },
          title: {
            display: true,
            text: varMeta.label.toUpperCase(),
            color: '#485a72',
            font: { family: "'IBM Plex Mono'", size: 9 },
          },
        },
        y: {
          grid: {
            color: ctx => ctx.tick.value === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(30,45,66,0.6)',
            lineWidth: ctx => ctx.tick.value === 0 ? 2 : 1,
          },
          ticks: {
            color: '#485a72',
            font: { family: "'IBM Plex Mono'", size: 10 },
            callback: v => (v > 0 ? '+' : '') + v + '%',
          },
          title: {
            display: true,
            text: 'D − R MARGIN (%)',
            color: '#485a72',
            font: { family: "'IBM Plex Mono'", size: 9 },
          },
        },
      },
    },
  };

  if (demoChart) {
    demoChart.data.datasets = [scatterDataset, regressionDataset];
    demoChart.options.scales.x.title.text = varMeta.label.toUpperCase();
    demoChart.options.scales.x.ticks.callback = v => varMeta.fmt(v);
    demoChart.update();
  } else {
    demoChart = new Chart(document.getElementById('demo-chart'), cfg);
  }
}
```

**Step 7: Call `buildDemoButtons()` in boot**

In the boot sequence, alongside `buildYearButtons()` and `buildTrendsChips()`, add:
```js
buildDemoButtons();
```

Also, in `selectYear()`, if the demographics tab is active, re-render it:
```js
if (currentTab === 'demo') renderDemographics();
```

**Step 8: Manual verification**

- DEMOGRAPHICS tab appears and renders scatter on click
- Variable buttons switch X axis and update label
- Regression line visible as faint dashed line
- Tooltip shows state abbreviation, demographic value, and margin
- Changing year selector updates Y axis while keeping same variable
- Blue dots = D states, red dots = R states

**Step 9: Commit**

```bash
git add apps-data/vote-analysis/index.html
git commit -m "feat: add demographics scatter tab to vote-analysis"
```

---

## Final: verification pass

Open the app from a local server (required for fetch). Check all five tabs work, year selector updates demographics scatter, 2008 SWING button is disabled, all tooltips correct.

```bash
git log --oneline -5
```

Should show four new commits: data, docs, swing mode, swing column, demographics tab.
