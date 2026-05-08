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
**Output:** `data-apps/vote-analysis/results-county.json` — 20,854 rows, years 2000–2024

---
