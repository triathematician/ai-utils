# Design: Swing Overlay + Demographics Tab — vote-analysis

**Date:** 2026-05-07
**App:** `apps-data/vote-analysis/`

---

## Feature 1 — Swing Map Overlay + By-State Column

### Map mode

Add `SWING` as a third button in the header mode toggle alongside WINNER and MARGIN.

When year is 2008 (first in dataset), the SWING button is disabled (`disabled` attribute + dimmed style) and clicking it does nothing. For all other years, selecting SWING colors states by the change in D−R margin vs the prior election.

**Color scale** (6-tier discrete, matching the existing winner scale structure):

| Condition | Color | Label |
|---|---|---|
| D shift > +15 | `#0e3b9e` | Strong D shift |
| D shift +5 to +15 | `#1e58cc` | Solid D shift |
| D shift 0 to +5 | `#5a8de8` | Lean D shift |
| R shift 0 to −5 | `#e07080` | Lean R shift |
| R shift −5 to −15 | `#c03040` | Solid R shift |
| R shift < −15 | `#8e0f1a` | Strong R shift |

The legend updates to show "SWING SCALE" with these six entries when SWING mode is active.

The map tooltip gains a **Swing** row below the existing Margin row, showing e.g. `D +3.2` or `R +8.1` vs the prior election year.

### By State table

Add a **SWING** column (after MARGIN, before RESULT) showing the D−R margin delta with directional color (`--d-text` for D shift, `--r-text` for R shift). Column is sortable. When year is 2008, the column renders `—` for every row (no prior data).

---

## Feature 2 — Demographics Tab

### Tab

Fifth tab labeled `DEMOGRAPHICS`, inserted after SUMMARY.

### Layout

```
┌─────────────────────────────────────────────────────┐
│  variable buttons: EDU  INCOME  URBAN  RACE  AGE    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  scatter plot (Chart.js)                            │
│  X: demographic value   Y: D−R margin (% pts)       │
│  one dot per state, colored by winner               │
│  linear regression trend line                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- The global **year selector** drives the Y-axis values (D−R margin for the selected year)
- The demographic X-axis is a static 2020 ACS 5-year snapshot (demographics don't change per election year)
- Active variable button uses the same `.active` style as other controls

### Demographic variables

| Button | Field | Description | Source |
|---|---|---|---|
| EDU | `pct_bachelors` | % adults 25+ with bachelor's degree or higher | 2020 ACS 5-yr, Table S1501 |
| INCOME | `median_hh_income` | Median household income (USD) | 2020 ACS 5-yr, Table S1901 |
| URBAN | `pct_urban` | % population in urban areas | 2020 Census P2 |
| RACE | `pct_white_nh` | % white non-Hispanic | 2020 Census P1 |
| AGE | `median_age` | Median age | 2020 ACS 5-yr, Table S0101 |

### Scatter plot

- Chart.js scatter type
- One point per state; dot color: `--d-text` if D winner, `--r-text` if R winner for the selected year
- Point radius 5, hover radius 7
- Y-axis zero line highlighted (same treatment as trends chart)
- Linear regression line drawn as a Chart.js dataset with `type: 'line'`, `pointRadius: 0`, dashed (`borderDash: [4,4]`), color `rgba(255,255,255,0.25)`
- Tooltip (monospace, dark bg): state name, demographic value + label, D−R margin

### Data file

New file: `apps-data/vote-analysis/demographics.json`

Flat array, one object per state:

```json
{ "abbr": "CA", "pct_bachelors": 34.9, "median_hh_income": 78672, "pct_urban": 95.0, "pct_white_nh": 36.4, "median_age": 37.0 }
```

DC included. `data-notes.md` updated with source table citations for each field.

---

## Implementation notes

- `SWING` color logic is a new `stateSwingColor(abbr, year)` helper; swing value computed as `getMargin(abbr, year) - getMargin(abbr, prevYear)`
- Demographics data loaded alongside the existing three files in the `Promise.all` boot fetch
- Regression computed inline (simple least-squares, ~10 lines) — no additional library needed
- No changes to existing tabs or data files
