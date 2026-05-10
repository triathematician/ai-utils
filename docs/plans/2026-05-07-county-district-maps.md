# County & District Map Tabs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the vote-analysis app to cover 2000–2024, and add two new national choropleth map tabs — COUNTY and DISTRICT — showing presidential results at finer granularity.

**Architecture:** All tabs share the same WINNER/MARGIN/SWING header toggle. Each new map tab uses the same D3 AlbersUSA projection pattern as the existing MAP tab (init once, re-render on year/mode change). County boundaries come from the `us-atlas` CDN (already used). District boundaries are stored as three local TopoJSON files (one per census apportionment cycle). The shared `#map-tooltip` is moved out of `#tab-map` to the body so all map tabs can use it.

**Tech Stack:** Vanilla JS, D3 v7, TopoJSON client, Chart.js v4, Python 3 (data prep), mapshaper (boundary file generation).

---

## Task 1: Extend elections.json and states.json to 2000

**Files:**
- Modify: `data-apps/vote-analysis/elections.json`
- Modify: `data-apps/vote-analysis/states.json`
- Modify: `data-apps/vote-analysis/index.html` (getEV + logo subtitle)

**Step 1: Prepend 2000 and 2004 to elections.json**

Replace the entire file content with:

```json
[
  { "year": 2000, "d_candidate": "Gore",   "r_candidate": "Bush",   "d_pv": 48.4, "r_pv": 47.9 },
  { "year": 2004, "d_candidate": "Kerry",  "r_candidate": "Bush",   "d_pv": 48.3, "r_pv": 50.7 },
  { "year": 2008, "d_candidate": "Obama",  "r_candidate": "McCain", "d_pv": 52.9, "r_pv": 45.7 },
  { "year": 2012, "d_candidate": "Obama",  "r_candidate": "Romney", "d_pv": 51.1, "r_pv": 47.2 },
  { "year": 2016, "d_candidate": "Clinton","r_candidate": "Trump",  "d_pv": 48.2, "r_pv": 46.1 },
  { "year": 2020, "d_candidate": "Biden",  "r_candidate": "Trump",  "d_pv": 51.3, "r_pv": 46.8 },
  { "year": 2024, "d_candidate": "Harris", "r_candidate": "Trump",  "d_pv": 48.4, "r_pv": 49.9 }
]
```

Source verification: d_pv/r_pv are raw popular vote share (total votes cast basis) from FEC official results. 2000: Gore 48.4%/Bush 47.9% (Nader ~2.7% accounts for gap). 2004: Kerry 48.3%/Bush 50.7%.

**Step 2: Replace states.json with 4-element ev arrays**

The new ev array order is: `[1990census, 2000census, 2010census, 2020census]`.

The 1990 census apportionment was used for the 2000 election. The existing ev[0] was 2000 census — those values become ev[1]. Source: National Archives electoral college allocation pages.

Replace the entire file content with:

```json
[
  { "name": "Alabama",        "abbr": "AL", "fips": "01", "ev": [9,  9,  9,  9 ] },
  { "name": "Alaska",         "abbr": "AK", "fips": "02", "ev": [3,  3,  3,  3 ] },
  { "name": "Arizona",        "abbr": "AZ", "fips": "04", "ev": [8,  10, 11, 11] },
  { "name": "Arkansas",       "abbr": "AR", "fips": "05", "ev": [6,  6,  6,  6 ] },
  { "name": "California",     "abbr": "CA", "fips": "06", "ev": [54, 55, 55, 54] },
  { "name": "Colorado",       "abbr": "CO", "fips": "08", "ev": [8,  9,  9,  10] },
  { "name": "Connecticut",    "abbr": "CT", "fips": "09", "ev": [8,  7,  7,  7 ] },
  { "name": "Delaware",       "abbr": "DE", "fips": "10", "ev": [3,  3,  3,  3 ] },
  { "name": "D.C.",           "abbr": "DC", "fips": "11", "ev": [3,  3,  3,  3 ] },
  { "name": "Florida",        "abbr": "FL", "fips": "12", "ev": [25, 27, 29, 30] },
  { "name": "Georgia",        "abbr": "GA", "fips": "13", "ev": [13, 15, 16, 16] },
  { "name": "Hawaii",         "abbr": "HI", "fips": "15", "ev": [4,  4,  4,  4 ] },
  { "name": "Idaho",          "abbr": "ID", "fips": "16", "ev": [4,  4,  4,  4 ] },
  { "name": "Illinois",       "abbr": "IL", "fips": "17", "ev": [22, 21, 20, 19] },
  { "name": "Indiana",        "abbr": "IN", "fips": "18", "ev": [12, 11, 11, 11] },
  { "name": "Iowa",           "abbr": "IA", "fips": "19", "ev": [7,  7,  6,  6 ] },
  { "name": "Kansas",         "abbr": "KS", "fips": "20", "ev": [6,  6,  6,  6 ] },
  { "name": "Kentucky",       "abbr": "KY", "fips": "21", "ev": [8,  8,  8,  8 ] },
  { "name": "Louisiana",      "abbr": "LA", "fips": "22", "ev": [9,  9,  8,  8 ] },
  { "name": "Maine",          "abbr": "ME", "fips": "23", "ev": [4,  4,  4,  4 ] },
  { "name": "Maryland",       "abbr": "MD", "fips": "24", "ev": [10, 10, 10, 10] },
  { "name": "Massachusetts",  "abbr": "MA", "fips": "25", "ev": [12, 12, 11, 11] },
  { "name": "Michigan",       "abbr": "MI", "fips": "26", "ev": [18, 17, 16, 15] },
  { "name": "Minnesota",      "abbr": "MN", "fips": "27", "ev": [10, 10, 10, 10] },
  { "name": "Mississippi",    "abbr": "MS", "fips": "28", "ev": [7,  6,  6,  6 ] },
  { "name": "Missouri",       "abbr": "MO", "fips": "29", "ev": [11, 11, 10, 10] },
  { "name": "Montana",        "abbr": "MT", "fips": "30", "ev": [3,  3,  3,  4 ] },
  { "name": "Nebraska",       "abbr": "NE", "fips": "31", "ev": [5,  5,  5,  5 ] },
  { "name": "Nevada",         "abbr": "NV", "fips": "32", "ev": [4,  5,  6,  6 ] },
  { "name": "New Hampshire",  "abbr": "NH", "fips": "33", "ev": [4,  4,  4,  4 ] },
  { "name": "New Jersey",     "abbr": "NJ", "fips": "34", "ev": [15, 15, 14, 14] },
  { "name": "New Mexico",     "abbr": "NM", "fips": "35", "ev": [5,  5,  5,  5 ] },
  { "name": "New York",       "abbr": "NY", "fips": "36", "ev": [33, 31, 29, 28] },
  { "name": "North Carolina", "abbr": "NC", "fips": "37", "ev": [14, 15, 15, 16] },
  { "name": "North Dakota",   "abbr": "ND", "fips": "38", "ev": [3,  3,  3,  3 ] },
  { "name": "Ohio",           "abbr": "OH", "fips": "39", "ev": [21, 20, 18, 17] },
  { "name": "Oklahoma",       "abbr": "OK", "fips": "40", "ev": [8,  7,  7,  7 ] },
  { "name": "Oregon",         "abbr": "OR", "fips": "41", "ev": [7,  7,  7,  8 ] },
  { "name": "Pennsylvania",   "abbr": "PA", "fips": "42", "ev": [23, 21, 20, 19] },
  { "name": "Rhode Island",   "abbr": "RI", "fips": "44", "ev": [4,  4,  4,  4 ] },
  { "name": "South Carolina", "abbr": "SC", "fips": "45", "ev": [8,  8,  9,  9 ] },
  { "name": "South Dakota",   "abbr": "SD", "fips": "46", "ev": [3,  3,  3,  3 ] },
  { "name": "Tennessee",      "abbr": "TN", "fips": "47", "ev": [11, 11, 11, 11] },
  { "name": "Texas",          "abbr": "TX", "fips": "48", "ev": [32, 34, 38, 40] },
  { "name": "Utah",           "abbr": "UT", "fips": "49", "ev": [5,  5,  6,  6 ] },
  { "name": "Vermont",        "abbr": "VT", "fips": "50", "ev": [3,  3,  3,  3 ] },
  { "name": "Virginia",       "abbr": "VA", "fips": "51", "ev": [13, 13, 13, 13] },
  { "name": "Washington",     "abbr": "WA", "fips": "53", "ev": [11, 11, 12, 12] },
  { "name": "West Virginia",  "abbr": "WV", "fips": "54", "ev": [5,  5,  5,  4 ] },
  { "name": "Wisconsin",      "abbr": "WI", "fips": "55", "ev": [11, 10, 10, 10] },
  { "name": "Wyoming",        "abbr": "WY", "fips": "56", "ev": [3,  3,  3,  3 ] }
]
```

Verify the 1990 census total sums to 538:
```bash
node -e "const s=require('./data-apps/vote-analysis/states.json');console.log(s.reduce((t,x)=>t+x.ev[0],0))"
```
Expected: `538`

**Step 3: Update `getEV()` in index.html**

Find and replace:
```js
function getEV(abbr, year) {
  const s = STATE_META.find(m => m.abbr === abbr);
  if (!s) return 0;
  if (year <= 2008) return s.ev[0];
  if (year <= 2020) return s.ev[1];
  return s.ev[2];
}
```

Replace with:
```js
function getEV(abbr, year) {
  const s = STATE_META.find(m => m.abbr === abbr);
  if (!s) return 0;
  if (year <= 2000) return s.ev[0]; // 1990 census
  if (year <= 2008) return s.ev[1]; // 2000 census
  if (year <= 2020) return s.ev[2]; // 2010 census
  return s.ev[3]; // 2020 census
}
```

**Step 4: Update logo subtitle**

Find: `US PRESIDENTIAL ELECTIONS &middot; 2008–2024`
Replace: `US PRESIDENTIAL ELECTIONS &middot; 2000–2024`

**Step 5: Manual verification**

Open the app via local server (e.g. `python -m http.server 8000` from `data-apps/vote-analysis/`). Confirm:
- Year buttons 2000 and 2004 appear
- 2000 SWING button is disabled
- Score bar EV total for 2000 = 538 (Bush 271 + Gore 266 + 1 faithless = 538; Bush should show 271)
- Score bar EV total for 2004 = 538 (Bush 286 + Kerry 251 = 537... note: one faithless elector cast for John Edwards, so Kerry = 251, Bush = 286, Edwards = 1 — the app computes from results data, so this will be correct once results.json is populated in Task 2)

**Step 6: Commit**

```bash
git add data-apps/vote-analysis/elections.json data-apps/vote-analysis/states.json data-apps/vote-analysis/index.html
git commit -m "data: extend elections and states data to 2000, update getEV for 4 census cycles"
```

---

## Task 2: Extend results.json with 2000 and 2004 state results

**Files:**
- Modify: `data-apps/vote-analysis/results.json`

**Step 1: Download the MIT EDSL state-level dataset**

Download from Harvard Dataverse:
- URL: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/42MVDX
- File: `1976-2020-president.csv` (or the latest version of this dataset)
- Save to a working directory (not the repo)

**Step 2: Run Python transform script**

Save as `transform_state.py` and run from the directory containing the CSV:

```python
import csv, json
from collections import defaultdict

# {year: {state_po: {'DEMOCRAT': votes, 'REPUBLICAN': votes, 'total': votes}}}
results = defaultdict(lambda: defaultdict(lambda: {'DEMOCRAT': 0, 'REPUBLICAN': 0, 'total': 0}))

with open('1976-2020-president.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        year = int(row['year'])
        if year < 2000 or year > 2020:
            continue
        abbr = row['state_po']
        party = row.get('party_simplified', row.get('party_detailed', ''))
        votes = int(row['candidatevotes'] or 0)
        total = int(row['totalvotes'] or 0)
        if party == 'DEMOCRAT':
            results[year][abbr]['DEMOCRAT'] += votes
        elif party == 'REPUBLICAN':
            results[year][abbr]['REPUBLICAN'] += votes
        results[year][abbr]['total'] = max(results[year][abbr]['total'], total)

output = []
for year in sorted(results):
    for abbr in sorted(results[year]):
        row = results[year][abbr]
        d_v = row['DEMOCRAT']
        r_v = row['REPUBLICAN']
        total = row['total']
        if total == 0:
            continue
        output.append({
            'year': year,
            'abbr': abbr,
            'd': round(d_v / total * 100, 1),
            'r': round(r_v / total * 100, 1)
        })

print(json.dumps(output, indent=2))
```

Run: `python transform_state.py > state_2000_2020.json`

**Step 3: Prepend the new rows to results.json**

Load the existing `results.json` and the new `state_2000_2020.json`, filter new rows to years 2000 and 2004 only, then prepend them.

```python
import json

with open('state_2000_2020.json') as f:
    new_rows = [r for r in json.load(f) if r['year'] in (2000, 2004)]

with open('data-apps/vote-analysis/results.json') as f:
    existing = json.load(f)

combined = new_rows + existing

with open('data-apps/vote-analysis/results.json', 'w') as f:
    json.dump(combined, f, separators=(',', ':'))
    f.write('\n')
```

**Step 4: Verify row count**

```bash
node -e "const d=require('./data-apps/vote-analysis/results.json');console.log(d.length)"
```
Expected: `357` (51 states × 7 years)

**Step 5: Verify 2000 key results**

Open the app via local server, select 2000:
- Florida: Bush wins (narrow R margin)
- California: Gore wins (large D margin ~22pts)
- Electoral College: Bush 271, Gore 267 (note: the app computes from results data; one DC elector cast a blank ballot, so app may show Gore 266 depending on whether DC data is included)

**Step 6: Commit**

```bash
git add data-apps/vote-analysis/results.json
git commit -m "data: add 2000 and 2004 state-level presidential results"
```

---

## Task 3: Create results-county.json

**Files:**
- Create: `data-apps/vote-analysis/results-county.json`

**Step 1: Download the MIT EDSL county-level dataset**

- URL: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VOQCHQ
- File: `countypres_2000-2020.csv` (download the latest version)
- Save to a working directory (not the repo)

For 2024 county data: As of 2026 this dataset may have been updated to include 2024. Check the Dataverse page for updates. If 2024 is not yet available, the county tab will show no data for 2024 (districts will show dim fill) — this is acceptable; the app gracefully returns `[0,0]` for missing FIPS.

**Step 2: Run Python transform script**

```python
import csv, json
from collections import defaultdict

# {year: {fips: {'D': votes, 'R': votes, 'total': votes}}}
results = defaultdict(lambda: defaultdict(lambda: {'D': 0, 'R': 0, 'total': 0}))

with open('countypres_2000-2020.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row.get('office', '') != 'US PRESIDENT':
            continue
        year = int(row['year'])
        fips = row['county_fips'].strip().zfill(5)
        party = row.get('party_simplified', '')
        votes = int(row['candidatevotes'] or 0)
        total = int(row['totalvotes'] or 0)
        if not fips or fips == '00000':
            continue
        if party == 'DEMOCRAT':
            results[year][fips]['D'] += votes
        elif party == 'REPUBLICAN':
            results[year][fips]['R'] += votes
        results[year][fips]['total'] = max(results[year][fips]['total'], total)

output = []
for year in sorted(results):
    for fips in sorted(results[year]):
        row = results[year][fips]
        d_v, r_v, total = row['D'], row['R'], row['total']
        if total == 0:
            continue
        output.append({
            'year': year,
            'fips': fips,
            'd': round(d_v / total * 100, 1),
            'r': round(r_v / total * 100, 1)
        })

print(json.dumps(output, separators=(',', ':')))
```

Run: `python transform_county.py > data-apps/vote-analysis/results-county.json`

**Step 3: Verify row count**

```bash
node -e "const d=require('./data-apps/vote-analysis/results-county.json');console.log(d.length,'rows,',new Set(d.map(r=>r.year)).size,'years')"
```
Expected: approximately `21,000–22,000` rows, `5–6` years (2000–2020, possibly 2024).

**Step 4: Commit**

```bash
git add data-apps/vote-analysis/results-county.json
git commit -m "data: add county-level presidential results 2000-2020"
```

---

## Task 4: Add COUNTY map tab to index.html

**Files:**
- Modify: `data-apps/vote-analysis/index.html`

This task: HTML structure, CSS, shared color helpers refactored, county data variables, county helpers, county map init/render, boot wiring, selectTab/selectYear dispatch. Does NOT add the district tab.

**Step 1: Move `#map-tooltip` outside the tab panels**

Find inside `#tab-map`:
```html
    <div id="map-tooltip"></div>
  </div>
```

Remove that `<div id="map-tooltip"></div>` line from inside `#tab-map`. Then find the line just before `</body>` (which is `</script>`) and add the tooltip after `</script>`:

```html
</script>
<div id="map-tooltip"></div>
</body>
```

The tooltip uses `position:fixed` so its DOM location doesn't affect rendering. Moving it outside the tab panels makes it accessible from all three map tabs.

**Step 2: Add COUNTY and DISTRICT tab buttons**

Find the `<nav id="tabs">` block:
```html
<nav id="tabs">
  <button class="tab active" data-tab="map">MAP</button>
  <button class="tab" data-tab="states">BY STATE</button>
```

Replace with:
```html
<nav id="tabs">
  <button class="tab active" data-tab="map">MAP</button>
  <button class="tab" data-tab="county">COUNTY</button>
  <button class="tab" data-tab="district">DISTRICT</button>
  <button class="tab" data-tab="states">BY STATE</button>
```

**Step 3: Add COUNTY tab panel HTML**

After the closing `</div>` of `<!-- MAP TAB -->`, add:

```html
  <!-- COUNTY MAP TAB -->
  <div id="tab-county" class="tab-panel">
    <div id="county-map-container">
      <svg id="county-map-svg"></svg>
      <div id="county-legend">
        <h4 id="county-legend-title">MARGIN SCALE</h4>
        <div id="county-legend-items"></div>
      </div>
    </div>
  </div>

  <!-- DISTRICT MAP TAB -->
  <div id="tab-district" class="tab-panel">
    <div id="district-map-container">
      <svg id="district-map-svg"></svg>
      <div id="district-legend">
        <h4 id="district-legend-title">MARGIN SCALE</h4>
        <div id="district-legend-items"></div>
      </div>
      <div id="district-loading" style="display:none">
        <span>Loading district boundaries…</span>
      </div>
    </div>
  </div>
```

**Step 4: Add CSS for county and district map tabs**

In the `<style>` block, after the `/* ── MAP TAB ── */` section, add:

```css
/* ── COUNTY & DISTRICT MAP TABS ── */
#county-map-container, #district-map-container {
  flex: 1; position: relative; overflow: hidden;
}
#county-map-svg, #district-map-svg { width: 100%; height: 100%; display: block; }
.county-path {
  stroke: #050810; stroke-width: 0.15px; cursor: pointer; transition: opacity 0.12s;
}
.county-path:hover { opacity: 0.8; stroke: rgba(255,255,255,0.45); stroke-width: 0.5px; }
.district-path {
  stroke: #050810; stroke-width: 0.4px; cursor: pointer; transition: opacity 0.12s;
}
.district-path:hover { opacity: 0.8; stroke: rgba(255,255,255,0.6); stroke-width: 1px; }
#county-legend, #district-legend {
  position: absolute; bottom: 14px; left: 14px;
  background: rgba(7,11,19,0.92); border: 1px solid var(--border);
  border-radius: 3px; padding: 10px 12px; font-size: 10px; min-width: 145px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}
#county-legend h4, #district-legend h4 {
  font-size: 9px; letter-spacing: 0.12em; color: var(--muted); margin-bottom: 8px; text-transform: uppercase;
}
#district-loading {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  color: var(--muted); font-size: 11px;
}
```

**Step 5: Refactor shared color helpers**

In the `// HELPERS` section of the script, find `function stateColor` and add these two new functions immediately **before** it:

```js
function marginColor(margin, mode) {
  if (mode === 'winner') {
    if (margin > 15)  return '#0e3b9e';
    if (margin > 5)   return '#1e58cc';
    if (margin > 0)   return '#5a8de8';
    if (margin > -5)  return '#e07080';
    if (margin > -15) return '#c03040';
    return '#8e0f1a';
  }
  const MARGIN_CLAMP = 40;
  const t = Math.max(0, Math.min(1, (-margin + MARGIN_CLAMP) / (MARGIN_CLAMP * 2)));
  const rC = Math.round(14  + t * (160 - 14));
  const gC = Math.round(62  - t * 52);
  const bC = Math.round(200 - t * 172);
  return `rgb(${rC},${gC},${bC})`;
}

function swingColor(swing) {
  if (swing === null) return 'var(--dim)';
  if (swing >  15) return '#0e3b9e';
  if (swing >   5) return '#1e58cc';
  if (swing >   0) return '#5a8de8';
  if (swing >  -5) return '#e07080';
  if (swing > -15) return '#c03040';
  return '#8e0f1a';
}
```

Then update `stateColor` and `stateSwingColor` to delegate:
```js
function stateColor(abbr, year, mode) {
  const [d, r] = getResult(abbr, year);
  return marginColor(d - r, mode);
}

function stateSwingColor(abbr, year) {
  return swingColor(getSwing(abbr, year));
}
```

**Step 6: Add county data variables and helpers**

In the `// DATA` section at the top of the script (where `let STATE_META, ELECTIONS, ...` is declared), add to the same `let` declaration:

Change:
```js
let STATE_META, ELECTIONS, CANDIDATES, NATIONAL_PV, RESULTS, DEMOGRAPHICS;
```
To:
```js
let STATE_META, ELECTIONS, CANDIDATES, NATIONAL_PV, RESULTS, DEMOGRAPHICS,
    RESULTS_COUNTY, RESULTS_DISTRICT;
```

Also add to APP STATE section:
```js
let countyTopoData = null;
let countyMapSvgG  = null;
const COUNTY_INFO  = {}; // {fips: {name, stateAbbr}}
```

In the `// HELPERS` section, after `getSwing`, add:
```js
function getCountyResult(fips, year) {
  return (RESULTS_COUNTY?.[year]?.[fips]) ?? [0, 0];
}
function getCountyMargin(fips, year) {
  const [d, r] = getCountyResult(fips, year);
  return +(d - r).toFixed(1);
}
function getCountySwing(fips, year) {
  const prevYear = ELECTIONS[ELECTIONS.indexOf(year) - 1];
  if (!prevYear) return null;
  return +(getCountyMargin(fips, year) - getCountyMargin(fips, prevYear)).toFixed(1);
}
```

**Step 7: Add county legend update function**

In the `// D3 CHOROPLETH MAP` section, after `updateLegend()`, add a county legend updater that reuses the same legend HTML patterns:

```js
function updateCountyLegend() {
  const titles = { winner: 'MARGIN SCALE', margin: 'MARGIN GRADIENT', swing: 'SWING SCALE' };
  document.getElementById('county-legend-title').textContent = titles[mapMode] || 'SCALE';
  const items = document.getElementById('county-legend-items');
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

**Step 8: Add county map init/render functions**

After `updateCountyLegend()`, add:

```js
function initOrRenderCountyMap() {
  if (!countyTopoData) return;
  if (!countyMapSvgG) { initCountyMap(); return; }
  renderCountyMap();
}

function initCountyMap() {
  const container = document.getElementById('county-map-container');
  const W = container.clientWidth  || 800;
  const H = container.clientHeight || 500;
  const svg = d3.select('#county-map-svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');
  svg.append('rect').attr('width', W).attr('height', H).attr('fill', 'var(--bg)');
  const counties   = topojson.feature(countyTopoData, countyTopoData.objects.counties);
  const projection = d3.geoAlbersUsa().fitSize([W, H - 16], counties);
  const path       = d3.geoPath().projection(projection);

  // Build county info lookup
  counties.features.forEach(f => {
    const fips = String(f.id).padStart(5, '0');
    COUNTY_INFO[fips] = {
      name: f.properties.name,
      stateAbbr: FIPS_TO_ABBR[fips.substring(0, 2)] || ''
    };
  });

  countyMapSvgG = svg.append('g');
  countyMapSvgG.selectAll('path')
    .data(counties.features)
    .join('path')
      .attr('class', 'county-path')
      .attr('d', path)
      .on('mousemove', (event, d) => {
        const fips = String(d.id).padStart(5, '0');
        const info = COUNTY_INFO[fips];
        if (!info) return;
        const [dp, rp] = getCountyResult(fips, currentYear);
        const margin   = dp - rp;
        const winner   = dp > rp ? 'D' : 'R';
        const cands    = CANDIDATES[currentYear];
        const wCol     = winner === 'D' ? 'var(--d-text)' : 'var(--r-text)';
        const wName    = winner === 'D' ? cands.d : cands.r;
        const mSign    = margin >= 0 ? '+' : '';
        const swing    = getCountySwing(fips, currentYear);
        const swingStr = swing === null ? '—'
          : (swing >= 0 ? `D +${swing}` : `R +${Math.abs(swing)}`) + ' vs ' + ELECTIONS[ELECTIONS.indexOf(currentYear) - 1];
        const swingCol = swing === null ? 'var(--muted)' : swing >= 0 ? 'var(--d-text)' : 'var(--r-text)';
        const tip = document.getElementById('map-tooltip');
        tip.innerHTML = `
          <div class="tt-title">${info.name}</div>
          <div class="tt-row"><span>State</span><span>${info.stateAbbr}</span></div>
          <div class="tt-row"><span>${cands.d}</span><span class="pct-d">${dp.toFixed(1)}%</span></div>
          <div class="tt-row"><span>${cands.r}</span><span class="pct-r">${rp.toFixed(1)}%</span></div>
          <div class="tt-divider"></div>
          <div class="tt-row"><span>Margin</span><span style="color:${wCol}">${mSign}${margin.toFixed(1)}%</span></div>
          <div class="tt-row"><span>Swing</span><span style="color:${swingCol}">${swingStr}</span></div>`;
        tip.style.display = 'block';
        tip.style.left    = (event.pageX + 14) + 'px';
        tip.style.top     = (event.pageY - 10) + 'px';
      })
      .on('mouseleave', () => { document.getElementById('map-tooltip').style.display = 'none'; });
  updateCountyLegend();
  renderCountyMap();
}

function renderCountyMap() {
  if (!countyMapSvgG) return;
  countyMapSvgG.selectAll('.county-path').attr('fill', d => {
    const fips = String(d.id).padStart(5, '0');
    const [dp, rp] = getCountyResult(fips, currentYear);
    if (dp === 0 && rp === 0) return 'var(--dim)';
    return mapMode === 'swing'
      ? swingColor(getCountySwing(fips, currentYear))
      : marginColor(dp - rp, mapMode);
  });
}
```

**Step 9: Wire county map into boot, selectTab, selectYear**

In the boot `Promise.all`, add `results-county.json` and `counties-10m.json` from CDN:

```js
Promise.all([
  fetch('states.json').then(r => r.json()),
  fetch('elections.json').then(r => r.json()),
  fetch('results.json').then(r => r.json()),
  fetch('demographics.json').then(r => r.json()),
  fetch('results-county.json').then(r => r.json()),
  fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r => r.json()).catch(() => null),
  fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json').then(r => r.json()).catch(() => null),
]).then(([statesData, electionsData, resultsData, demoData, countyData, topo, countyTopo]) => {
```

In the `.then()` callback, after building `DEMOGRAPHICS`, add:

```js
RESULTS_COUNTY = {};
countyData.forEach(row => {
  if (!RESULTS_COUNTY[row.year]) RESULTS_COUNTY[row.year] = {};
  RESULTS_COUNTY[row.year][row.fips] = [row.d, row.r];
});
if (countyTopo) countyTopoData = countyTopo;
```

In `selectTab()`, add:
```js
if (tab === 'county') initOrRenderCountyMap();
```

In `selectYear()`, add:
```js
if (currentTab === 'county')   renderCountyMap();
```

Also update the mode-btn click handler to also re-render the county map when active:

Find the existing mode button handler:
```js
document.querySelectorAll('.mode-btn').forEach(b => {
  b.addEventListener('click', () => {
    mapMode = b.dataset.mode;
    document.querySelectorAll('.mode-btn').forEach(x =>
      x.classList.toggle('active', x.dataset.mode === mapMode));
    updateLegend();
    if (mapSvgG) renderMap();
  });
});
```

Replace with:
```js
document.querySelectorAll('.mode-btn').forEach(b => {
  b.addEventListener('click', () => {
    mapMode = b.dataset.mode;
    document.querySelectorAll('.mode-btn').forEach(x =>
      x.classList.toggle('active', x.dataset.mode === mapMode));
    updateLegend();
    updateCountyLegend();
    if (mapSvgG) renderMap();
    if (countyMapSvgG) renderCountyMap();
  });
});
```

**Step 10: Manual verification**

Open app via local server. Click COUNTY tab:
- Full national county choropleth renders
- Hovering shows county name, state, D/R %, margin, swing
- Mode buttons (WINNER/MARGIN/SWING) update county map colors and legend
- SWING disabled for 2000
- Changing year updates the county map

**Step 11: Commit**

```bash
git add data-apps/vote-analysis/index.html
git commit -m "feat: add county map tab with full national choropleth"
```

---

## Task 5: Create congressional district boundary TopoJSON files

**Files:**
- Create: `data-apps/vote-analysis/districts-2000s.json` (2000 census, used for 2000–2008 elections)
- Create: `data-apps/vote-analysis/districts-2010s.json` (2010 census, used for 2012–2020 elections)
- Create: `data-apps/vote-analysis/districts-2020s.json` (2020 census, used for 2024 election)

**Step 1: Install mapshaper**

```bash
npm install -g mapshaper
```

**Step 2: Download Census Cartographic Boundary Files**

Download these three ZIP files from the Census Bureau:

```bash
# 2020 census (118th Congress, 2023+):
curl -o cb_2022_us_cd118_5m.zip "https://www2.census.gov/geo/tiger/GENZ2022/shp/cb_2022_us_cd118_5m.zip"

# 2010 census (116th Congress, a representative session from the 2010 cycle):
curl -o cb_2019_us_cd116_5m.zip "https://www2.census.gov/geo/tiger/GENZ2019/shp/cb_2019_us_cd116_5m.zip"

# 2000 census (113th Congress — earliest CB file available; used as proxy for 108th-110th):
curl -o cb_2013_us_cd113_5m.zip "https://www2.census.gov/geo/tiger/GENZ2013/cb_2013_us_cd113_5m.zip"
```

Note: The 2000-census-era boundary file uses the 113th Congress (2013) as a proxy. Actual 2000, 2004, 2008 elections used 106th–110th Congress boundaries. For a national choropleth the visual difference is small; document this limitation in data-notes.md.

**Step 3: Unzip each file**

```bash
unzip cb_2022_us_cd118_5m.zip -d cd118
unzip cb_2019_us_cd116_5m.zip -d cd116
unzip cb_2013_us_cd113_5m.zip -d cd113
```

**Step 4: Convert each to TopoJSON with mapshaper**

The goal is a TopoJSON where each district feature has `id` = `"ST-NN"` (state abbreviation + zero-padded 2-digit district number, e.g., `"TX-07"`, `"CA-13"`, `"WY-01"`). At-large districts (single CD states) get `"ST-01"`.

The Census shapefiles have a `STATEFP` (2-digit FIPS) and `CD118FP` / `CD116FP` / `CD113FP` field for the district number.

Use the following mapshaper commands. These use a JavaScript expression to build the `id` field from FIPS → abbreviation. The FIPS-to-abbreviation mapping is embedded inline.

```bash
# Build a JS snippet for the FIPS→abbr map (used in all three commands)
# This maps state FIPS to 2-letter abbreviations
FIPS_MAP='{"01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY"}'

# 2020 census (cd118)
mapshaper cd118/cb_2022_us_cd118_5m.shp \
  -filter 'STATEFP !== "72"' \
  -each "this.id = (function(m,s,d){var abbr=m[s];var dn=('0'+d).slice(-2);return abbr+'-'+dn;})(${FIPS_MAP}, STATEFP, CD118FP)" \
  -simplify 15% \
  -o format=topojson districts-2020s.json

# 2010 census (cd116)
mapshaper cd116/cb_2019_us_cd116_5m.shp \
  -filter 'STATEFP !== "72"' \
  -each "this.id = (function(m,s,d){var abbr=m[s];var dn=('0'+d).slice(-2);return abbr+'-'+dn;})(${FIPS_MAP}, STATEFP, CD116FP)" \
  -simplify 15% \
  -o format=topojson districts-2010s.json

# 2000 census proxy (cd113)
mapshaper cd113/cb_2013_us_cd113_5m.shp \
  -filter 'STATEFP !== "72"' \
  -each "this.id = (function(m,s,d){var abbr=m[s];var dn=('0'+d).slice(-2);return abbr+'-'+dn;})(${FIPS_MAP}, STATEFP, CD113FP)" \
  -simplify 15% \
  -o format=topojson districts-2000s.json
```

The `-filter 'STATEFP !== "72"'` removes Puerto Rico (which has no presidential vote).

**Step 5: Verify the output files**

```bash
node -e "
const d = require('./districts-2020s.json');
const features = d.objects[Object.keys(d.objects)[0]];
console.log('features:', features.geometries.length);
console.log('sample ids:', features.geometries.slice(0,3).map(g=>g.id));
"
```

Expected: ~435 features. Sample IDs like `["AL-01","AL-02","AL-03"]` or similar.

**Step 6: Move files to the app directory**

```bash
mv districts-2000s.json districts-2010s.json districts-2020s.json data-apps/vote-analysis/
```

**Step 7: Commit**

```bash
git add data-apps/vote-analysis/districts-2000s.json data-apps/vote-analysis/districts-2010s.json data-apps/vote-analysis/districts-2020s.json
git commit -m "data: add congressional district boundary TopoJSON for 3 census cycles"
```

---

## Task 6: Create results-district.json

**Files:**
- Create: `data-apps/vote-analysis/results-district.json`

**Step 1: Obtain the Daily Kos Elections presidential results by congressional district**

Primary source: Daily Kos Elections maintains a spreadsheet of presidential results by congressional district for all elections back to 2000.

- URL: https://www.dailykos.com/stories/2020/11/19/1163009/-Daily-Kos-Elections-presidential-results-by-congressional-district-for-2020-2016-and-2012
- For 2024: Check for the updated version of this dataset published post-certification
- The data is typically published as a Google Sheet; download as CSV

The CSV typically has columns: `District`, `Obama 08`, `Romney 12`, `Clinton 16`, `Trump 16`, `Biden 20`, `Trump 20`, etc. — one row per district.

Alternatively, the MIT EDSL also provides House election results by district (though this is House votes, not presidential votes — do not substitute).

**Step 2: Transform to results-district.json format**

The target format is a flat array:
```json
[
  { "year": 2000, "district": "AL-01", "d": 33.7, "r": 65.8 },
  ...
]
```

Where `d` and `r` are the D and R candidate's share of **total votes cast** (not two-party adjusted), matching the format used in `results.json`.

Write a transform script adapted to the exact column names in the downloaded CSV. A template:

```python
import csv, json

# Adjust column names to match what Daily Kos actually uses in the downloaded CSV
YEAR_COLS = {
    2000: ('Gore 00',  'Bush 00'),
    2004: ('Kerry 04', 'Bush 04'),
    2008: ('Obama 08', 'McCain 08'),
    2012: ('Obama 12', 'Romney 12'),
    2016: ('Clinton 16','Trump 16'),
    2020: ('Biden 20',  'Trump 20'),
    2024: ('Harris 24', 'Trump 24'),
}

output = []
with open('dailykos_presidential_cd.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        district = row['District'].strip()  # e.g. "AL-01"
        if not district or '-' not in district:
            continue
        for year, (d_col, r_col) in YEAR_COLS.items():
            if d_col not in row or r_col not in row:
                continue
            try:
                d_pct = float(row[d_col].replace('%','').strip())
                r_pct = float(row[r_col].replace('%','').strip())
            except (ValueError, AttributeError):
                continue
            output.append({
                'year': year,
                'district': district,
                'd': round(d_pct, 1),
                'r': round(r_pct, 1)
            })

output.sort(key=lambda x: (x['year'], x['district']))
print(json.dumps(output, separators=(',', ':')))
```

Adjust `YEAR_COLS` and `row['District']` to match the actual CSV column names.

Run: `python transform_district.py > data-apps/vote-analysis/results-district.json`

**Step 3: Verify row count and spot-check**

```bash
node -e "
const d = require('./data-apps/vote-analysis/results-district.json');
console.log(d.length, 'rows');
console.log(new Set(d.map(r=>r.year)).size, 'years');
// Check a known result: TX-07 in 2020 should be D-leaning (Biden flipped it)
const tx7 = d.find(r => r.district === 'TX-07' && r.year === 2020);
console.log('TX-07 2020:', tx7);
"
```

Expected: ~3,000 rows, 7 years. TX-07 2020 should show D > R (Biden won with ~53%).

**Step 4: Commit**

```bash
git add data-apps/vote-analysis/results-district.json
git commit -m "data: add presidential results by congressional district 2000-2024"
```

---

## Task 7: Add DISTRICT map tab to index.html

**Files:**
- Modify: `data-apps/vote-analysis/index.html`

The `tab-district` HTML and CSS are already added in Task 4. This task adds the JS.

**Step 1: Add district data variables and helpers**

In the APP STATE section, after the county variables, add:
```js
let districtTopoData  = {}; // {cycle: topo | null} lazy-loaded
let districtMapSvgG   = null;
let currentDistrictCycle = null;
```

In the `// HELPERS` section, after the county helpers, add:
```js
function getDistrictCycle(year) {
  if (year <= 2008) return '2000s';
  if (year <= 2020) return '2010s';
  return '2020s';
}
function getDistrictResult(district, year) {
  return (RESULTS_DISTRICT?.[year]?.[district]) ?? [0, 0];
}
function getDistrictMargin(district, year) {
  const [d, r] = getDistrictResult(district, year);
  return +(d - r).toFixed(1);
}
function getDistrictSwing(district, year) {
  const prevYear = ELECTIONS[ELECTIONS.indexOf(year) - 1];
  if (!prevYear) return null;
  return +(getDistrictMargin(district, year) - getDistrictMargin(district, prevYear)).toFixed(1);
}
```

**Step 2: Add district legend update function**

After `updateCountyLegend()`, add `updateDistrictLegend()` with identical legend HTML — just targeting `#district-legend-title` and `#district-legend-items`:

```js
function updateDistrictLegend() {
  const titles = { winner: 'MARGIN SCALE', margin: 'MARGIN GRADIENT', swing: 'SWING SCALE' };
  document.getElementById('district-legend-title').textContent = titles[mapMode] || 'SCALE';
  const items = document.getElementById('district-legend-items');
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

**Step 3: Add district map init/render functions**

After `updateDistrictLegend()`, add:

```js
function initOrRenderDistrictMap() {
  const cycle = getDistrictCycle(currentYear);
  const loading = document.getElementById('district-loading');

  if (districtTopoData[cycle]) {
    if (currentDistrictCycle !== cycle) {
      districtMapSvgG = null;
      document.getElementById('district-map-svg').innerHTML = '';
      currentDistrictCycle = cycle;
    }
    if (!districtMapSvgG) { initDistrictMap(districtTopoData[cycle]); return; }
    renderDistrictMap();
    return;
  }

  if (districtTopoData[cycle] === 'loading') return;
  districtTopoData[cycle] = 'loading';
  loading.style.display = 'block';

  fetch(`districts-${cycle}.json`)
    .then(r => r.json())
    .then(topo => {
      districtTopoData[cycle] = topo;
      loading.style.display = 'none';
      if (currentTab === 'district' && getDistrictCycle(currentYear) === cycle) {
        districtMapSvgG = null;
        document.getElementById('district-map-svg').innerHTML = '';
        currentDistrictCycle = cycle;
        initDistrictMap(topo);
      }
    })
    .catch(() => {
      districtTopoData[cycle] = null;
      loading.style.display = 'none';
      document.getElementById('district-map-container').innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:11px">District boundaries unavailable.</div>';
    });
}

function initDistrictMap(topo) {
  const container = document.getElementById('district-map-container');
  const W = container.clientWidth  || 800;
  const H = container.clientHeight || 500;
  const svg = d3.select('#district-map-svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');
  svg.append('rect').attr('width', W).attr('height', H).attr('fill', 'var(--bg)');

  const objKey = Object.keys(topo.objects)[0];
  const districts  = topojson.feature(topo, topo.objects[objKey]);
  const projection = d3.geoAlbersUsa().fitSize([W, H - 16], districts);
  const path       = d3.geoPath().projection(projection);

  districtMapSvgG = svg.append('g');
  districtMapSvgG.selectAll('path')
    .data(districts.features)
    .join('path')
      .attr('class', 'district-path')
      .attr('d', path)
      .on('mousemove', (event, d) => {
        const dist = d.id;
        if (!dist) return;
        const [dp, rp] = getDistrictResult(dist, currentYear);
        const margin   = dp - rp;
        const winner   = dp > rp ? 'D' : 'R';
        const cands    = CANDIDATES[currentYear];
        const wCol     = winner === 'D' ? 'var(--d-text)' : 'var(--r-text)';
        const wName    = winner === 'D' ? cands.d : cands.r;
        const mSign    = margin >= 0 ? '+' : '';
        const swing    = getDistrictSwing(dist, currentYear);
        const swingStr = swing === null ? '—'
          : (swing >= 0 ? `D +${swing}` : `R +${Math.abs(swing)}`) + ' vs ' + ELECTIONS[ELECTIONS.indexOf(currentYear) - 1];
        const swingCol = swing === null ? 'var(--muted)' : swing >= 0 ? 'var(--d-text)' : 'var(--r-text)';
        const tip = document.getElementById('map-tooltip');
        tip.innerHTML = `
          <div class="tt-title">${dist}</div>
          <div class="tt-row"><span>${cands.d}</span><span class="pct-d">${dp.toFixed(1)}%</span></div>
          <div class="tt-row"><span>${cands.r}</span><span class="pct-r">${rp.toFixed(1)}%</span></div>
          <div class="tt-divider"></div>
          <div class="tt-row"><span>Margin</span><span style="color:${wCol}">${mSign}${margin.toFixed(1)}%</span></div>
          <div class="tt-row"><span>Swing</span><span style="color:${swingCol}">${swingStr}</span></div>`;
        tip.style.display = 'block';
        tip.style.left    = (event.pageX + 14) + 'px';
        tip.style.top     = (event.pageY - 10) + 'px';
      })
      .on('mouseleave', () => { document.getElementById('map-tooltip').style.display = 'none'; });
  updateDistrictLegend();
  renderDistrictMap();
}

function renderDistrictMap() {
  if (!districtMapSvgG) return;
  districtMapSvgG.selectAll('.district-path').attr('fill', d => {
    const dist = d.id;
    const [dp, rp] = getDistrictResult(dist, currentYear);
    if (dp === 0 && rp === 0) return 'var(--dim)';
    return mapMode === 'swing'
      ? swingColor(getDistrictSwing(dist, currentYear))
      : marginColor(dp - rp, mapMode);
  });
}
```

**Step 4: Wire district map into boot, selectTab, selectYear, mode buttons**

In the boot `.then()` callback, after building `RESULTS_COUNTY`, add:

```js
RESULTS_DISTRICT = {};
districtData.forEach(row => {
  if (!RESULTS_DISTRICT[row.year]) RESULTS_DISTRICT[row.year] = {};
  RESULTS_DISTRICT[row.year][row.district] = [row.d, row.r];
});
```

Also add `results-district.json` to the `Promise.all` fetch array and destructure it:

```js
Promise.all([
  fetch('states.json').then(r => r.json()),
  fetch('elections.json').then(r => r.json()),
  fetch('results.json').then(r => r.json()),
  fetch('demographics.json').then(r => r.json()),
  fetch('results-county.json').then(r => r.json()),
  fetch('results-district.json').then(r => r.json()),
  fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r => r.json()).catch(() => null),
  fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json').then(r => r.json()).catch(() => null),
]).then(([statesData, electionsData, resultsData, demoData, countyData, districtData, topo, countyTopo]) => {
```

In `selectTab()`, add:
```js
if (tab === 'district') initOrRenderDistrictMap();
```

In `selectYear()`, add:
```js
if (currentTab === 'district') initOrRenderDistrictMap();
```

In the mode button click handler (updated in Task 4), also add:
```js
if (districtMapSvgG) renderDistrictMap();
updateDistrictLegend();
```

**Step 5: Manual verification**

Open app via local server. Click DISTRICT tab:
- First click triggers a fetch of the appropriate boundary file; "Loading district boundaries…" shows briefly
- Map renders ~435 colored district polygons
- Hovering shows district ID (e.g., "TX-07"), D%/R%, margin, swing
- Changing year changes the map; changing between 2008 and 2012 triggers a boundary file load (cycle switches from 2000s to 2010s)
- SWING disabled for 2000

**Step 6: Commit**

```bash
git add data-apps/vote-analysis/index.html
git commit -m "feat: add congressional district map tab with lazy-loaded cycle boundaries"
```

---

## Task 8: Update data-notes.md

**Files:**
- Modify: `data-apps/vote-analysis/data-notes.md`

**Step 1: Update the file**

Replace the full contents with the updated version documenting all files:

- In the `elections.json` section: update to note "2000–2024" and add 2000/2004 candidate names and national PV sources
- In the `results.json` section: update source to note it now covers 2000–2024
- In the `states.json` section: update the ev array mapping to document all four elements (1990, 2000, 2010, 2020 census)
- In the `getEV()` boundary conditions section: update to match new 4-cycle logic
- Add new `results-county.json` section: fields (`year`, `fips`, `d`, `r`), FIPS format (5-digit zero-padded), source (MIT EDSL county, Harvard Dataverse doi:10.7910/DVN/VOQCHQ), note about 2024 availability
- Add new `results-district.json` section: fields (`year`, `district`, `d`, `r`), district ID format (e.g. `"TX-07"`), source (Daily Kos Elections), years covered
- Add new `districts-*.json` section: documents the three boundary files, which census cycle each covers, which elections they apply to, the known approximation for 2000-era districts, source (Census Bureau Cartographic Boundary Files), mapshaper commands used to generate them

**Step 2: Commit**

```bash
git add data-apps/vote-analysis/data-notes.md
git commit -m "docs: update data-notes for 2000 extension and county/district data files"
```

---

## Final: verification pass

Open the app via `python -m http.server 8000` from `data-apps/vote-analysis/`. Check:

1. Year buttons: 2000, 2004, 2008, 2012, 2016, 2020, 2024 all present
2. MAP tab: state choropleth works for all years
3. COUNTY tab: county choropleth works, hover tooltip shows county + state
4. DISTRICT tab: renders on first click (loading indicator visible briefly), re-renders on year change, boundary swap (2008→2012) works
5. BY STATE tab: national summary row shows correct EV totals for 2000
6. DEMOGRAPHICS tab: still works, regression chart unaffected
7. SWING disabled only for 2000

```bash
git log --oneline -10
```

Should show all commits from this plan.
