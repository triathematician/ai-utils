# Data Notes — vote-analysis

## Files

### `elections.json`
One row per election year (2000–2024). Fields: `year`, `d_candidate`, `r_candidate`, `d_pv`, `r_pv`.

National popular vote percentages (`d_pv`, `r_pv`) are two-party-adjusted figures rounded to one decimal place.

**Source:** [Federal Election Commission — Federal Elections results](https://www.fec.gov/introduction-campaign-finance/election-results-and-voting-information/)

### `results.json`
One row per (year, state) for 2000–2024. Fields: `year`, `abbr`, `d`, `r`.

State-level Democratic and Republican vote share as a percentage of total votes cast, rounded to one decimal place. Third-party votes are excluded from these two columns (so `d + r` does not necessarily equal 100).

**Source:** [MIT Election Data + Science Lab — U.S. President 1976–2020](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/42MVDX) for 2000–2020; [Associated Press / official state canvasses](https://www.fec.gov/introduction-campaign-finance/election-results-and-voting-information/) for 2024.

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

### `results-county.json`
One row per (year, county) for 2000–2024. Fields: `year`, `fips` (5-digit zero-padded string), `d`, `r`.

Vote share columns follow the same two-column convention as `results.json`. Alaska is excluded because the MIT EDSL dataset reports Alaska results by state legislative district rather than borough. Shannon County, SD / Oglala Lakota County FIPS has been remapped from the old code 46113 to the current code 46102 across all years for consistency.

**Source:** [MIT Election Data + Science Lab — U.S. President Countylevel](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VOQCHQ)

### `results-district.json`
One row per (year, congressional district) for 2008–2024. Fields: `year`, `district` (e.g. `"TX-07"`), `d`, `r`.

At-large districts use the `XX-01` convention. No data exists for 2000 or 2004. The 2008–2020 rows reflect results mapped onto **116th Congress (2010-cycle)** district lines; the 2024 rows reflect **118th Congress (2020-cycle)** lines.

**Sources:** [Daily Kos Elections](https://www.dailykos.com/stories/2012/11/19/1163009/-Daily-Kos-Elections-presidential-results-by-congressional-district-for-the-2012-2008-elections) for 2008–2020; [The Downballot](https://www.dailykos.com/stories/2024/11/19/2290817/-The-Downballot-2024-presidential-results-by-congressional-district) for 2024.

### `districts-2000s.json`
Congressional district boundaries for visual display of older elections. TopoJSON; each feature has `id` set to the district string (e.g. `"TX-07"`).

Uses **113th Congress (2013)** boundaries as a visual approximation for the 2000-era election cycle. Note: the actual 2000, 2004, and 2008 elections were conducted on 106th–110th Congress lines. There is currently no matching `results-district.json` data for 2000 or 2004.

**Source:** Census Bureau Cartographic Boundary Files `cb_2013_us_cd113_5m`

### `districts-2010s.json`
Congressional district boundaries for the 2008–2020 results in `results-district.json`. TopoJSON; feature `id` = district string.

Uses **116th Congress (2019)** boundaries, matching the district lines on which the 2008–2020 data in `results-district.json` is reported.

**Source:** Census Bureau Cartographic Boundary Files `cb_2019_us_cd116_5m`

### `districts-2020s.json`
Congressional district boundaries for the 2024 results in `results-district.json`. TopoJSON; feature `id` = district string.

Uses **118th Congress (2022)** boundaries, matching the district lines on which the 2024 data in `results-district.json` is reported.

**Source:** Census Bureau Cartographic Boundary Files `cb_2022_us_cd118_5m`

## Verification

Cross-check state results against [Dave Leip's Atlas of U.S. Presidential Elections](https://uselectionatlas.org/) or the FEC official results pages. Cross-check county results against the MIT EDSL county dataset directly. The 2024 figures are provisional pending full certification in some states.

## Update procedure

To add a future election year with state-level data:
1. Add a row to `elections.json` with the year, candidates, and national popular vote.
2. Add 51 rows to `results.json` (one per state/DC) with certified state results.
3. If a new census has reallocated electoral votes, add a fifth element to each state's `ev` array in `states.json` and update the `getEV()` boundary conditions in `index.html`.

To add a future election year with county data:
1. Add rows to `results-county.json` using the MIT EDSL county dataset (doi:10.7910/DVN/VOQCHQ).
2. Exclude Alaska rows (reported by legislative district, not borough).

To add a future election year with district data:
1. Add rows to `results-district.json` with results on the applicable Congress's district lines.
2. If a new census cycle has been applied (new redistricting), add a new boundary TopoJSON file and update the `getDistrictCycle()` logic in `index.html` to point to it.
