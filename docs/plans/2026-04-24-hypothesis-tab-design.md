# Hypothesis Tab — Design Doc
_portfolio-desk · 2026-04-24_

## Overview

Add a HYPOTHESIS tab to portfolio-desk for backtesting configurable buy/sell strategies against 50 years of S&P 500 monthly data. Up to three strategies can be compared simultaneously on a shared growth chart with a full stats grid below.

## Data Layer

- `const SP500_MONTHLY` — ~600 objects `{ date: 'YYYY-MM', close: number }`, Jan 1975 – Dec 2024
- Source: Robert Shiller public dataset (monthly close prices)
- Bundled inline as a JS constant (~25KB); no network dependency, fits local-first philosophy
- Simulation engine runs synchronously in JS at render time (600 months × 3 strategies is trivial)
- Each strategy simulation returns `{ date, value, invested }[]` timeseries + stats object
- Strategy configs persisted to `localStorage`

## Layout — Option 3: Strategy Cards + Chart + Stats

```
[ Strategy 1 card ] [ Strategy 2 card ] [ Strategy 3 card ]
[                   Full-width SVG chart                   ]
[                   Stats grid (3 columns)                  ]
```

## Strategy Cards

Each card has:
- **Name** — editable text (defaults: "Strategy 1", "Strategy 2", "Strategy 3")
- **Color** — fixed: cyan / amber / green (matching app palette)
- **Enabled toggle** — grayed out + excluded from chart/stats when off
- **Starting capital** — dollar input, default $0
- **Monthly contribution** — dollar input, default $500
- **Start year** — dropdown 1975–2024, default 1975
- **Rule type** — dropdown:
  - **DCA** — buy every month at close, no extra params
  - **Buy the Dip** — params: drawdown threshold % (e.g. 15%) + extra multiplier (e.g. 2×)
  - **Moving Average** — param: SMA window in months (e.g. 12); invest when price > SMA, accumulate cash when below, deploy when price crosses back above

## Chart

- Full-width SVG line chart, consistent with existing deep dive chart style
- **X-axis:** years, major gridlines every 5 years, minor every 1
- **Y-axis:** portfolio value; **log/linear toggle** button (log default for 50-year view)
- Three lines in strategy colors; only enabled strategies rendered
- **Hover tooltip:** vertical crosshair, shows each strategy's value + total invested at that month
- **Recession bands:** subtle gray shading for 1980, 1981–82, 1990–91, 2001, 2008–09, 2020

## Stats Grid

One column per enabled strategy, one row per metric:

| Metric | Description |
|---|---|
| Final Value | Dollar amount at simulation end |
| Total Invested | Sum of all contributions + starting capital |
| Total Return % | (Final − Invested) / Invested |
| CAGR | Annualized return over full period |
| Max Drawdown | Largest peak-to-trough drop in portfolio value |
| Best Year | Highest calendar-year return |
| Worst Year | Lowest calendar-year return |
| Sharpe Ratio | Monthly excess returns / std dev × √12, 0% risk-free rate |
| Time in Market | % of months capital was deployed (meaningful for MA strategy) |

- Values colored green/red where directional
- Strategy name + color dot in column headers
