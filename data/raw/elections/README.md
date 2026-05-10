# raw/elections

This directory holds large source files downloaded from external sources. It is **gitignored** — files must be downloaded locally before running the transform scripts.

See `data/elections.md` for full source URLs, column layouts, and download instructions.

## Files to download

| Filename | Source URL |
|---|---|
| `1976-2020-president.csv` | https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/42MVDX |
| `countypres_2000-2024.csv` | https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VOQCHQ |
| `Daily Kos Elections 2008 presidential election results for congressional districts used in 2006, 2008 & 2010 elections - Results.csv` | https://www.dailykos.com/stories/2012/11/19/1163009/-Daily-Kos-Elections-presidential-results-by-congressional-district-for-the-2012-2008-elections |
| `Daily Kos Elections 2008 & 2012 presidential election results for congressional districts used in 2012 & 2014 elections - Results.csv` | https://www.dailykos.com/stories/2012/11/19/1163009/-Daily-Kos-Elections-presidential-results-by-congressional-district-for-the-2012-2008-elections |
| `Daily Kos Elections 2008, 2012, 2016 & 2020 presidential election results for congressional districts used in 2020 elections - Results.csv` | https://docs.google.com/spreadsheets/d/1XbUXnI9OyfAuhP5P3vWtMuGc5UJlrhXbzZo3AwMuHtk/edit |
| `The Downballot's 2020 & 2024 presidential election results for congressional districts used in the 2024 elections - Percentages.csv` | https://docs.google.com/spreadsheets/d/1ng1i_Dm_RMDnEvauH44pgE6JCUsapcuu8F2pCfeLWFo/edit |

## Running the transforms

From the repo root:

```bash
node data/scripts/elections/transform_county.js
node data/scripts/elections/transform_district.js
node data/scripts/elections/transform_state.js   # or: python data/scripts/elections/transform_state.py
node data/scripts/elections/merge_results.js
```

Outputs are written to `data/derived/elections/`. After running, copy updated files to the app:

```bash
cp data/derived/elections/results.json           data-apps/vote-analysis/
cp data/derived/elections/results-county.json    data-apps/vote-analysis/
cp data/derived/elections/results-district.json  data-apps/vote-analysis/
```
