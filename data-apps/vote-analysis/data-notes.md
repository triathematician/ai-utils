# Data Notes — vote-analysis

## Files

### `elections.json`
One row per election year. Fields: `year`, `d_candidate`, `r_candidate`, `d_pv`, `r_pv`.

National popular vote percentages (`d_pv`, `r_pv`) are two-party-adjusted figures rounded to one decimal place.

**Source:** [Federal Election Commission — Federal Elections results](https://www.fec.gov/introduction-campaign-finance/election-results-and-voting-information/)

### `results.json`
One row per (year, state). Fields: `year`, `abbr`, `d`, `r`.

State-level Democratic and Republican vote share as a percentage of total votes cast, rounded to one decimal place. Third-party votes are excluded from these two columns (so `d + r` does not necessarily equal 100).

**Source:** [MIT Election Data + Science Lab — U.S. President 1976–2020](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/42MVDX) for 2008–2020; [Associated Press / official state canvasses](https://www.fec.gov/introduction-campaign-finance/election-results-and-voting-information/) for 2024.

### `states.json`
One row per state/district. Fields: `name`, `abbr`, `fips`, `ev` (array of three electoral vote counts).

The `ev` array maps to census apportionment periods:
- `ev[0]` — 2000 census allocation, used for the **2008** election
- `ev[1]` — 2010 census allocation, used for **2012–2020**
- `ev[2]` — 2020 census allocation, used for **2024**

**Source:** [National Archives — U.S. Electoral College](https://www.archives.gov/electoral-college/allocation)

## Verification

Cross-check results against [Dave Leip's Atlas of U.S. Presidential Elections](https://uselectionatlas.org/) or the FEC official results pages. The 2024 figures are provisional pending full certification in some states.

## Update procedure

To add a future election year:
1. Add a row to `elections.json` with the year, candidates, and national popular vote.
2. Add 51 rows to `results.json` (one per state/DC) with certified state results.
3. If a new census has reallocated electoral votes, add a fourth element to each state's `ev` array in `states.json` and update the `getEV()` boundary conditions in `index.html`.

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
