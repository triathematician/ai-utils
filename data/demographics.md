# Demographics Data

Source files, schemas, and transform notes for all demographic data in this repo.

---

## Directory layout

```
data/
  raw/demographics/      ← gitignored large downloads; see raw/demographics/README.md
  derived/demographics/  ← committed processed files (listed below)
  scripts/demographics/  ← transform scripts (none yet — demographics.json hand-assembled)
```

---

## Derived files

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

---

## Update procedure

`demographics.json` is a hand-assembled static file. To update or extend it:
1. Download the relevant ACS tables from [data.census.gov](https://data.census.gov/).
2. Update the values in `derived/demographics/demographics.json` directly, or write a transform script and place it under `scripts/demographics/`.
3. If adding new fields, update the table above and the `DEMO_VARS` array in `apps-data/vote-analysis/index.html`.
