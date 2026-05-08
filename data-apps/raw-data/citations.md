# Raw Data Citations

Citations for source files in this folder. Each entry documents the download, the transform script used, and the output produced.

---

## `1976-2020-president.csv`

**Source:** MIT Election Data + Science Lab, "U.S. President 1976–2020"  
**URL:** https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/42MVDX  
**Downloaded:** 2026-05-08  
**Transform script:** `transform_state.js` — filters to 2000/2004, aggregates D/R votes by state, computes share of total votes cast  
**Output:** rows prepended to `data-apps/vote-analysis/results.json` (years 2000 and 2004 only; 2008–2020 rows from this file were not used as those years were already present)

---
