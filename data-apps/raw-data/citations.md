# Raw Data Citations

Citations for source files in this folder. Each entry documents the download, the transform script used, and the output produced.

---

## `1976-2020-president.csv`

**Source:** MIT Election Data + Science Lab, "U.S. President 1976–2020"  
**URL:** https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/42MVDX  
**Downloaded:** 2026-05-08  
**Transform script:** `transform_state.js` — filters to 2000/2004, aggregates D/R votes by state, computes share of total votes cast  
**Intermediate:** `state_2000_2020.json` — full transform output (all years 2000–2020, 306 rows); only 2000 and 2004 rows were used downstream  
**Output:** rows prepended to `data-apps/vote-analysis/results.json` (years 2000 and 2004 only; 2008–2020 rows from this file were not used as those years were already present)

---

## `countypres_2000-2024.csv`

**Source:** MIT Election Data + Science Lab, "County Presidential Election Returns 2000-2024"  
**URL:** https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VOQCHQ  
**Downloaded:** 2026-05-08  
**Transform script:** `transform_county.js` — filters to `US PRESIDENT` / `TOTAL` mode rows, aggregates D/R votes by FIPS, computes share of total votes cast  
**Intermediate:** none (script writes output directly)  
**Output:** `data-apps/vote-analysis/results-county.json` — 21,796 rows, years 2000–2024 (Alaska excluded — EDSL reports by legislative district, not borough; Shannon/Oglala Lakota FIPS 46113 remapped to 46102)

---

## `Daily Kos Elections 2008, 2012, 2016 & 2020 presidential election results for congressional districts used in 2020 elections - Results.csv`

**Source:** Daily Kos Elections, "Presidential results by congressional district (2020 district lines)"  
**URL:** https://docs.google.com/spreadsheets/d/1XbUXnI9OyfAuhP5P3vWtMuGc5UJlrhXbzZo3AwMuHtk/edit  
**Downloaded:** 2026-05-08  
**Transform script:** `transform_district.js` — extracts D/R % for 2008/2012/2016/2020; normalizes at-large districts (AL → 01); zero-pads district numbers  
**Intermediate:** none  
**Output:** contributes 2008–2020 rows to `data-apps/vote-analysis/results-district.json`; results correspond to `districts-2010s.json` (116th Congress boundary file)

---

## `The Downballot's 2020 & 2024 presidential election results for congressional districts used in the 2024 elections - Percentages.csv`

**Source:** The Downballot, "2024 presidential results by congressional district (2024 district lines)"  
**URL:** https://docs.google.com/spreadsheets/d/1ng1i_Dm_RMDnEvauH44pgE6JCUsapcuu8F2pCfeLWFo/edit  
**Downloaded:** 2026-05-08  
**Transform script:** `transform_district.js` — extracts Harris/Trump % for 2024 only (2020 column from this file not used); normalizes district IDs  
**Intermediate:** none  
**Output:** contributes 2024 rows to `data-apps/vote-analysis/results-district.json`; results correspond to `districts-2020s.json` (118th Congress boundary file)

---
