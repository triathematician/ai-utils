# Atlas Split-Tab Maps Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a left-side mini-map panel to the States, Parks, and Countries tabs showing a US map (States/Parks) or world map (Countries) alongside the existing table.

**Architecture:** Wrap each tab's existing content in a `.tab-table-pane` flex child, add a sibling `.tab-map-pane` before it, and lazy-init a D3 SVG map into each pane on first tab visit. States/Parks reuse the already-loaded `topoData` (US TopoJSON). Countries fetches world-atlas separately. Re-color on each tab visit to reflect current visit state.

**Tech Stack:** D3 v7, TopoJSON client v3, world-atlas@2 (CDN JSON fetch), vanilla JS/CSS, single HTML file `apps/atlas/atlas.html`

---

### Task 1: Add CSS for the split layout

**Files:**
- Modify: `apps/atlas/atlas.html` — `<style>` block, after `.stat-progress-fill` rule

Add these rules inside the existing `<style>` block:

```css
/* Split-tab layout */
.split-tab { flex-direction: row !important; }
.tab-map-pane {
  width: 38%; flex-shrink: 0; overflow: hidden;
  border-right: 1px solid var(--border);
  background: var(--parchment);
}
.tab-map-pane svg { width: 100%; height: 100%; display: block; }
.tab-table-pane { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
@media (max-width: 700px) { .tab-map-pane { display: none; } }
.world-country-path { fill: var(--unvisited); stroke: #fff; stroke-width: 0.5px; cursor: pointer; transition: fill 0.2s; }
.world-country-path:hover { fill: var(--border); }
.world-country-path.visited { fill: var(--terracotta); }
```

**Verify:** No visual change yet — no HTML updated.

---

### Task 2: Restructure HTML — States tab

**Files:**
- Modify: `apps/atlas/atlas.html` — `#tab-states` panel

Current structure:
```html
<div id="tab-states" class="tab-panel">
  <div class="table-toolbar">...</div>
  <div class="table-wrap">...</div>
</div>
```

New structure:
```html
<div id="tab-states" class="tab-panel split-tab">
  <div id="states-map-pane" class="tab-map-pane"></div>
  <div class="tab-table-pane">
    <div class="table-toolbar">...</div>
    <div class="table-wrap">...</div>
  </div>
</div>
```

**Verify:** States tab now shows blank left pane + table on right. Table should still work.

---

### Task 3: Restructure HTML — Parks tab

**Files:**
- Modify: `apps/atlas/atlas.html` — `#tab-parks` panel

Wrap the parks toolbar, add-form div, and table-wrap in `.tab-table-pane`. Add `split-tab` and `#parks-map-pane`:

```html
<div id="tab-parks" class="tab-panel split-tab">
  <div id="parks-map-pane" class="tab-map-pane"></div>
  <div class="tab-table-pane">
    <!-- existing: .table-toolbar, #add-park-form, .table-wrap -->
  </div>
</div>
```

**Verify:** Parks tab shows blank left pane + table on right.

---

### Task 4: Restructure HTML — Countries tab

**Files:**
- Modify: `apps/atlas/atlas.html` — `#tab-countries` panel

```html
<div id="tab-countries" class="tab-panel split-tab">
  <div id="countries-map-pane" class="tab-map-pane"></div>
  <div class="tab-table-pane">
    <!-- existing: .table-toolbar, #add-country-form, .table-wrap -->
  </div>
</div>
```

**Verify:** Countries tab shows blank left pane + table on right.

---

### Task 5: Implement States tab map (lazy-init)

**Files:**
- Modify: `apps/atlas/atlas.html` — JS section, after the `// ── States Tab` block

Add these functions. They depend on `topoData` (already loaded before any tab is clicked) and `FIPS_TO_ABBREV`:

```js
// ── States Tab Map ────────────────────────────────────────────────────
let statesTabMapInited = false;

function initStatesTabMap() {
  const pane = document.getElementById('states-map-pane');
  if (!statesTabMapInited && topoData) {
    const { width, height } = pane.getBoundingClientRect();
    if (!width || !height) return;
    const states = topojson.feature(topoData, topoData.objects.states);
    const projection = d3.geoAlbersUsa().fitSize([width, height], states);
    const path = d3.geoPath().projection(projection);
    const svg = d3.select(pane).append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#e8e0d0');
    svg.append('g')
      .selectAll('path')
      .data(states.features)
      .join('path')
        .attr('class', 'state-path')
        .attr('d', path)
        .on('click', (event, d) => {
          const fips = String(d.id).padStart(2, '0');
          const abbrev = FIPS_TO_ABBREV[fips];
          if (abbrev) openDrawer(abbrev, 'state');
        });
    statesTabMapInited = true;
  }
  colorStatesTabMap();
}

function colorStatesTabMap() {
  const visitedIds = new Set(getVisits().map(v => v.placeId));
  d3.select('#states-map-pane').selectAll('.state-path').each(function(d) {
    const fips = String(d.id).padStart(2, '0');
    const abbrev = FIPS_TO_ABBREV[fips];
    d3.select(this).classed('visited', !!(abbrev && visitedIds.has(abbrev)));
  });
}
```

Then update the states tab click listener:
```js
// Replace:
document.querySelector('[data-tab="states"]').addEventListener('click', renderStatesTable);
// With:
document.querySelector('[data-tab="states"]').addEventListener('click', () => {
  renderStatesTable();
  initStatesTabMap();
});
```

**Verify:** Open States tab → US map on left, states colored by visits.

---

### Task 6: Implement Parks tab map (lazy-init)

**Files:**
- Modify: `apps/atlas/atlas.html` — JS section, after `// ── Parks Tab` block

```js
// ── Parks Tab Map ─────────────────────────────────────────────────────
let parksTabMapInited = false;

function initParksTabMap() {
  const pane = document.getElementById('parks-map-pane');
  if (!parksTabMapInited && topoData) {
    const { width, height } = pane.getBoundingClientRect();
    if (!width || !height) return;
    const states = topojson.feature(topoData, topoData.objects.states);
    const projection = d3.geoAlbersUsa().fitSize([width, height], states);
    const path = d3.geoPath().projection(projection);
    const svg = d3.select(pane).append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#e8e0d0');
    svg.append('g')
      .selectAll('path')
      .data(states.features)
      .join('path')
        .attr('class', 'state-path')
        .attr('d', path);

    // Park dots
    const visitedIds = new Set(getVisits().map(v => v.placeId));
    const projected = [...parksData, ...getCustomPlaces().filter(p => p.type !== 'country')]
      .filter(p => p.lat && p.lng)
      .map(p => ({ ...p, _proj: projection([p.lng, p.lat]) }));

    svg.append('g').attr('id', 'parks-tab-dots')
      .selectAll('circle')
      .data(projected)
      .join('circle')
        .attr('class', 'park-dot')
        .attr('data-npstype', d => d.type)
        .attr('r', 3)
        .attr('cx', d => d._proj ? d._proj[0] : -999)
        .attr('cy', d => d._proj ? d._proj[1] : -999)
        .classed('visited', d => visitedIds.has(d.id))
        .style('display', d => d._proj ? null : 'none')
        .on('click', (event, d) => openDrawer(d.id, 'park'));

    parksTabMapInited = true;
  }
  colorParksTabMap();
}

function colorParksTabMap() {
  const visitedIds = new Set(getVisits().map(v => v.placeId));
  d3.select('#parks-map-pane').selectAll('.park-dot')
    .classed('visited', d => visitedIds.has(d.id));
  d3.select('#parks-map-pane').selectAll('.state-path').each(function(d) {
    const fips = String(d.id).padStart(2, '0');
    const abbrev = FIPS_TO_ABBREV[fips];
    d3.select(this).classed('visited', !!(abbrev && visitedIds.has(abbrev)));
  });
}
```

Update the parks tab click listener:
```js
// Replace:
document.querySelector('[data-tab="parks"]').addEventListener('click', () => {
  populateParksFilters();
  renderParksTable();
});
// With:
document.querySelector('[data-tab="parks"]').addEventListener('click', () => {
  populateParksFilters();
  renderParksTable();
  initParksTabMap();
});
```

**Verify:** Parks tab shows US map with colored dots on left, table on right.

---

### Task 7: Add COUNTRY_ISO lookup table

**Files:**
- Modify: `apps/atlas/atlas.html` — JS section, near the top of `<script>` (after `const STORAGE = ...`)

This maps ISO 3166-1 numeric codes (as strings) to English country names. Add it as a `const`:

```js
const COUNTRY_ISO = {
  "004":"Afghanistan","008":"Albania","012":"Algeria","024":"Angola","032":"Argentina",
  "036":"Australia","040":"Austria","050":"Bangladesh","056":"Belgium","064":"Bhutan",
  "068":"Bolivia","070":"Bosnia and Herzegovina","072":"Botswana","076":"Brazil",
  "100":"Bulgaria","104":"Myanmar","116":"Cambodia","120":"Cameroon","124":"Canada",
  "144":"Sri Lanka","152":"Chile","156":"China","170":"Colombia","188":"Costa Rica",
  "191":"Croatia","192":"Cuba","196":"Cyprus","203":"Czech Republic","208":"Denmark",
  "214":"Dominican Republic","218":"Ecuador","818":"Egypt","222":"El Salvador",
  "231":"Ethiopia","246":"Finland","250":"France","266":"Gabon","276":"Germany",
  "288":"Ghana","300":"Greece","320":"Guatemala","332":"Haiti","340":"Honduras",
  "348":"Hungary","356":"India","360":"Indonesia","364":"Iran","368":"Iraq",
  "372":"Ireland","376":"Israel","380":"Italy","388":"Jamaica","392":"Japan",
  "400":"Jordan","398":"Kazakhstan","404":"Kenya","408":"North Korea","410":"South Korea",
  "414":"Kuwait","418":"Laos","422":"Lebanon","430":"Liberia","434":"Libya",
  "450":"Madagascar","454":"Malawi","458":"Malaysia","484":"Mexico","496":"Mongolia",
  "504":"Morocco","508":"Mozambique","516":"Namibia","524":"Nepal","528":"Netherlands",
  "554":"New Zealand","558":"Nicaragua","566":"Nigeria","578":"Norway","512":"Oman",
  "586":"Pakistan","591":"Panama","604":"Peru","608":"Philippines","616":"Poland",
  "620":"Portugal","634":"Qatar","642":"Romania","643":"Russia","646":"Rwanda",
  "682":"Saudi Arabia","686":"Senegal","694":"Sierra Leone","703":"Slovakia",
  "705":"Slovenia","706":"Somalia","710":"South Africa","728":"South Sudan",
  "724":"Spain","729":"Sudan","752":"Sweden","756":"Switzerland","760":"Syria",
  "158":"Taiwan","834":"Tanzania","764":"Thailand","780":"Trinidad and Tobago",
  "788":"Tunisia","792":"Turkey","800":"Uganda","804":"Ukraine",
  "784":"United Arab Emirates","826":"United Kingdom","840":"United States",
  "858":"Uruguay","860":"Uzbekistan","862":"Venezuela","704":"Vietnam",
  "887":"Yemen","894":"Zambia","716":"Zimbabwe"
};
```

**Verify:** `COUNTRY_ISO["840"]` returns `"United States"` in the browser console.

---

### Task 8: Implement Countries tab map (lazy-init, world map)

**Files:**
- Modify: `apps/atlas/atlas.html` — JS section, after `// ── Countries Tab` block

```js
// ── Countries Tab Map ─────────────────────────────────────────────────
const WORLD_ATLAS = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
let worldTopoData = null;
let countriesTabMapInited = false;

async function initCountriesTabMap() {
  if (!worldTopoData) worldTopoData = await d3.json(WORLD_ATLAS);
  const pane = document.getElementById('countries-map-pane');
  if (!countriesTabMapInited) {
    const { width, height } = pane.getBoundingClientRect();
    if (!width || !height) return;
    const countries = topojson.feature(worldTopoData, worldTopoData.objects.countries);
    const projection = d3.geoNaturalEarth1().fitSize([width, height], countries);
    const path = d3.geoPath().projection(projection);
    const svg = d3.select(pane).append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#e8e0d0');
    svg.append('g')
      .selectAll('path')
      .data(countries.features)
      .join('path')
        .attr('class', 'world-country-path')
        .attr('d', path)
        .on('click', (event, d) => {
          const isoName = COUNTRY_ISO[String(d.id)];
          if (!isoName) return;
          const match = getCustomPlaces().find(p =>
            p.type === 'country' &&
            p.name.toLowerCase() === isoName.toLowerCase()
          );
          if (match) openDrawer(match.id, 'country');
        });
    countriesTabMapInited = true;
  }
  colorCountriesTabMap();
}

function colorCountriesTabMap() {
  const visitedIds = new Set(getVisits().map(v => v.placeId));
  // Build set of ISO codes for visited + added countries by name match
  const countryPlaces = getCustomPlaces().filter(p => p.type === 'country');
  const addedNames = new Set(countryPlaces.map(p => p.name.toLowerCase()));
  const visitedNames = new Set(
    countryPlaces.filter(p => visitedIds.has(p.id)).map(p => p.name.toLowerCase())
  );
  const isoAdded = new Set();
  const isoVisited = new Set();
  Object.entries(COUNTRY_ISO).forEach(([code, name]) => {
    if (addedNames.has(name.toLowerCase())) isoAdded.add(code);
    if (visitedNames.has(name.toLowerCase())) isoVisited.add(code);
  });
  d3.select('#countries-map-pane').selectAll('.world-country-path')
    .classed('visited', d => isoVisited.has(String(d.id)))
    .style('fill', d => {
      const code = String(d.id);
      if (isoVisited.has(code)) return null; // let .visited class handle it
      if (isoAdded.has(code)) return 'var(--forest)';
      return null;
    });
}
```

Update the countries tab click listener:
```js
// Replace:
document.querySelector('[data-tab="countries"]').addEventListener('click', renderCountriesTable);
// With:
document.querySelector('[data-tab="countries"]').addEventListener('click', () => {
  renderCountriesTable();
  initCountriesTabMap();
});
```

**Verify:** Countries tab shows world map on left. Added countries appear in forest green, visited ones in terracotta.

---

### Task 9: Re-color tab maps after visit save/delete

**Files:**
- Modify: `apps/atlas/atlas.html` — visit save handler (around line 588) and `deleteCustomPlace` function

After saving a visit, call re-color functions if the relevant tab maps have been initialized:

In the visit form submit handler (after `saveVisits(visits)`):
```js
if (statesTabMapInited) colorStatesTabMap();
if (parksTabMapInited) colorParksTabMap();
if (countriesTabMapInited) colorCountriesTabMap();
```

In the `deleteVisit` button handler inside `renderVisitsList` (after `saveVisits(all)`):
```js
if (statesTabMapInited) colorStatesTabMap();
if (parksTabMapInited) colorParksTabMap();
if (countriesTabMapInited) colorCountriesTabMap();
```

**Verify:** Add/delete a visit, switch to States tab → map reflects updated state immediately.

---

### Task 10: Final check — resize handling

**Files:**
- Modify: `apps/atlas/atlas.html` — `window.addEventListener('resize', ...)` near bottom

The existing resize handler only re-renders the main map. Tab maps use `viewBox` with `preserveAspectRatio` so they scale automatically via CSS — no extra resize handling needed.

**Verify:** Resize window → all three tab maps scale gracefully.

---

### Commit

```bash
git add apps/atlas/atlas.html docs/plans/2026-04-01-atlas-split-tab-maps.md
git commit -m "feat(atlas): split-tab layout with mini-maps for States, Parks, Countries tabs"
```
