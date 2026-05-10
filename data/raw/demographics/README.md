# raw/demographics

This directory holds large source files downloaded from external sources. It is **gitignored** — files must be downloaded locally before running any transform scripts.

See `data/demographics.md` for full source URLs and field definitions.

## Files to download

| Filename | Source URL |
|---|---|
| ACS 5-year tables (S1501, S1901, S0101, P1, P2) | https://data.census.gov/ |

Note: `derived/demographics/demographics.json` is currently hand-assembled from the ACS tables above. No automated transform script exists yet.
