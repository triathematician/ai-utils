# Data attribution

The MIT license in the repo root covers the code. Data bundled in this repo
comes from third parties and remains subject to their terms.

## Elections (`data/derived/elections/`, `apps-data/vote-analysis/`)

Derived from the following sources. Raw downloads are not committed; see
`data/raw/elections/README.md` for URLs.

- **MIT Election Data and Science Lab** — U.S. President 1976–2020 and county
  presidential returns 2000–2024, via Harvard Dataverse.
- **Daily Kos Elections** — presidential results by congressional district
  (2008, 2012, 2016, 2020 results on various district lines).
- **The Downballot** — 2020 and 2024 presidential results by congressional
  district for the 2024 districts.

## Demographics (`data/derived/demographics/`)

Hand-assembled from U.S. Census Bureau American Community Survey 5-year tables
(S1501, S1901, S0101, P1, P2) via data.census.gov. U.S. government data.

## Geography (`apps/geo-firsts/`)

State and country boundary TopoJSON files (`states-10m.json`,
`countries-110m.json`) are standard map boundary sets from the
[us-atlas](https://github.com/topojson/us-atlas) and
[world-atlas](https://github.com/topojson/world-atlas) projects.
Park descriptions in `parks.json` come from the National Park Service.

## Reuse

If you reuse the derived election data outside this repo, check the original
publishers' terms, particularly for the Daily Kos Elections and The Downballot
spreadsheets, which do not carry an explicit open license that we are aware of.
