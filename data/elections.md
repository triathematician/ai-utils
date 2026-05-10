# Elections Data

Source files, schemas, and transform notes for all election-related data in this repo.

---

## Directory layout

```
data/
  raw/elections/         ← gitignored large downloads; see raw/elections/README.md
  derived/elections/     ← committed processed files (listed below)
  scripts/elections/     ← transform scripts
```

---

## Derived files

### `elections.json`

One row per election year (2000–2024). Fields: `year`, `d_candidate`, `r_candidate`, `d_pv`, `r_pv`.

National popular vote percentages (`d_pv`, `r_pv`) are two-party-adjusted figures rounded to one decimal place.

**Source:** [Federal Election Commission — Federal Elections results](https://www.fec.gov/introduction-campaign-finance/election-results-and-voting-information/)

---

### `states.json`

One row per state/district. Fields: `name`, `abbr`, `fips`, `ev` (array of four electoral vote counts).

The `ev` array maps to census apportionment periods:
- `ev[0]` — 1990 census allocation, used for the **2000** election
- `ev[1]` — 2000 census allocation, used for **2004–2008**
- `ev[2]` — 2010 census allocation, used for **2012–2020**
- `ev[3]` — 2020 census allocation, used for **2024**

The `getEV()` helper selects the correct index based on year:
- `year <= 2000` → `ev[0]`
- `year <= 2008` → `ev[1]`
- `year <= 2020` → `ev[2]`
- else → `ev[3]`

**Source:** [National Archives — U.S. Electoral College](https://www.archives.gov/electoral-college/allocation)

---

### `results.json`

One row per (year, state) for 2000–2024. Fields: `year`, `abbr`, `d`, `r`.

State-level Democratic and Republican vote share as a percentage of total votes cast, rounded to one decimal place. Third-party votes are excluded (so `d + r` does not necessarily equal 100).

**Sources:**
- 2000–2020: [MIT Election Data + Science Lab — U.S. President 1976–2020](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/42MVDX) (`1976-2020-president.csv`)
- 2024: Associated Press / official state canvasses via [FEC](https://www.fec.gov/introduction-campaign-finance/election-results-and-voting-information/)

**Transform scripts:**
- `transform_state.js` / `transform_state.py` — filter to 2000/2004, aggregate D/R votes by state, compute share of total votes cast; produces `state_2000_2020.json` (intermediate, all years 2000–2020, 306 rows)
- `merge_results.js` — prepends 2000 and 2004 rows from `state_2000_2020.json` into `results.json` (2008–2024 rows were already present)

---

### `results-county.json`

One row per (year, county) for 2000–2024. Fields: `year`, `fips` (5-digit zero-padded string), `d`, `r`.

Vote share columns follow the same convention as `results.json`. Notes:
- Alaska excluded — MIT EDSL reports Alaska by state legislative district, not borough
- Shannon County SD (FIPS 46113) remapped to Oglala Lakota County (FIPS 46102) across all years

**Source:** [MIT Election Data + Science Lab — County Presidential Election Returns 2000-2024](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VOQCHQ) (`countypres_2000-2024.csv`)

**Transform script:** `transform_county.js` — filters to `US PRESIDENT` / `TOTAL` mode rows, aggregates D/R votes by FIPS, computes share of total votes cast

---

### `results-district.json`

One row per (year, congressional district) for 2000–2024. Fields: `year`, `district` (e.g. `"TX-07"`), `d`, `r`.

At-large districts use the `XX-01` convention. Coverage and provenance by year:

| Years | Source file | District lines | Boundary match |
|---|---|---|---|
| 2000, 2004, 2008 | Daily Kos "2008 results — districts used 2006–2010" | 2006–2010 (retroactively mapped for 2000/2004) | 113th Congress (approximate) |
| 2012 | Daily Kos "2008 & 2012 results — districts used 2012–2014" | 113th Congress | Exact |
| 2016, 2020 | Daily Kos "2008–2020 results — districts used in 2020" | 116th Congress | Exact for 2020; FL/NC/VA approximate for 2016 |
| 2024 | The Downballot | 118th Congress | Exact |

See `redistricting.json` for per-year boundary file assignments and imputation notes.

**Sources:**
- [Daily Kos Elections — presidential results by congressional district](https://www.dailykos.com/stories/2012/11/19/1163009/-Daily-Kos-Elections-presidential-results-by-congressional-district-for-the-2012-2008-elections)
- [The Downballot — 2024 presidential results by congressional district](https://www.dailykos.com/stories/2024/11/19/2290817/-The-Downballot-2024-presidential-results-by-congressional-district)

**Transform script:** `transform_district.js`

**Raw files used:**

| Raw filename | Download URL | Years extracted |
|---|---|---|
| `Daily Kos Elections 2008 presidential election results for congressional districts used in 2006, 2008 & 2010 elections - Results.csv` | https://www.dailykos.com/stories/2012/11/19/1163009/-Daily-Kos-Elections-presidential-results-by-congressional-district-for-the-2012-2008-elections | 2000, 2004, 2008 (cols 7-8, 5-6, 3-4) |
| `Daily Kos Elections 2008 & 2012 presidential election results for congressional districts used in 2012 & 2014 elections - Results.csv` | https://www.dailykos.com/stories/2012/11/19/1163009/-Daily-Kos-Elections-presidential-results-by-congressional-district-for-the-2012-2008-elections | 2012 (cols 3-4) |
| `Daily Kos Elections 2008, 2012, 2016 & 2020 presidential election results for congressional districts used in 2020 elections - Results.csv` | https://docs.google.com/spreadsheets/d/1XbUXnI9OyfAuhP5P3vWtMuGc5UJlrhXbzZo3AwMuHtk/edit | 2016, 2020 (cols 5-6, 3-4) |
| `The Downballot's 2020 & 2024 presidential election results for congressional districts used in the 2024 elections - Percentages.csv` | https://docs.google.com/spreadsheets/d/1ng1i_Dm_RMDnEvauH44pgE6JCUsapcuu8F2pCfeLWFo/edit | 2024 (cols 3-4) |

---

### `redistricting.json`

Maps each election year to the boundary file to use for district rendering. Used by `vote-analysis` to select the correct TopoJSON for each year's map.

---

### `districts-2000s.json`

Congressional district boundaries for 2000, 2004, 2008, and 2012. TopoJSON; each feature has `id` set to the district string (e.g. `"TX-07"`).

Uses **113th Congress (2013)** boundaries — exact match for 2012; close approximation for 2000–2008 (actual elections used 106th–111th Congress lines).

**Source:** Census Bureau Cartographic Boundary Files `cb_2013_us_cd113_5m`

---

### `districts-2010s.json`

Congressional district boundaries for 2016 and 2020. TopoJSON; feature `id` = district string.

Uses **116th Congress (2019)** boundaries, matching the district lines on which the 2016–2020 data is reported.

**Source:** Census Bureau Cartographic Boundary Files `cb_2019_us_cd116_5m`

---

### `districts-2020s.json`

Congressional district boundaries for 2024. TopoJSON; feature `id` = district string.

Uses **118th Congress (2022)** boundaries, matching the district lines on which the 2024 data is reported.

**Source:** Census Bureau Cartographic Boundary Files `cb_2022_us_cd118_5m`

---

## Verification

Cross-check state results against [Dave Leip's Atlas of U.S. Presidential Elections](https://uselectionatlas.org/) or the FEC official results pages. Cross-check county results against the MIT EDSL county dataset directly. The 2024 figures are provisional pending full certification in some states.

---

## Update procedure

**To add a future election year — state level:**
1. Add a row to `elections.json` with the year, candidates, and national popular vote.
2. Add 51 rows to `results.json` (one per state/DC) with certified state results.
3. If a new census has reallocated electoral votes, add a fifth element to each state's `ev` array in `states.json` and update the `getEV()` boundary conditions in `data-apps/vote-analysis/index.html`.

**To add a future election year — county level:**
1. Add rows to `results-county.json` using the MIT EDSL county dataset (doi:10.7910/DVN/VOQCHQ).
2. Exclude Alaska rows (reported by legislative district, not borough).

**To add a future election year — district level:**
1. Add rows to `results-district.json` with results on the applicable Congress's district lines.
2. If a new census cycle has been applied, add a new boundary TopoJSON file and update the `getDistrictCycle()` logic in `data-apps/vote-analysis/index.html` to point to it.
