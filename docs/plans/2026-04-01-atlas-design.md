# ATLAS — Travel Tracker Design

**Date:** 2026-04-01
**Status:** Approved

---

## Overview

ATLAS is a local-first, single-file travel tracker for logging visits to US states, national parks/sites, and countries. It features an infographic-style D3 map, sortable/filterable tables, year-by-year stats, and a detail drawer with drag-and-drop photo support.

No build step, no accounts, no servers. All data lives in `localStorage`.

---

## Visual Style

Travel journal aesthetic: cream/off-white background, serif headings (Playfair Display from Google Fonts), D3 map in warm ink-on-paper tones. Unvisited places in parchment/light grey; visited places in a rich terracotta or forest green accent. Photo placeholders styled like polaroids. Minimal chrome to maximize map space.

---

## File Structure

```
apps/atlas/
  atlas.html       ← single-file app
  states.json      ← pre-loaded list of 51 states (incl. DC)
  parks.json       ← pre-loaded list of official NPS units
```

### states.json shape
```json
[{ "id": "VA", "name": "Virginia", "abbrev": "VA", "capital": "Richmond", "region": "South" }]
```

### parks.json shape
```json
[{ "id": "acad", "name": "Acadia National Park", "type": "National Park", "state": "ME", "lat": 44.35, "lng": -68.21, "established": "1919", "description": "..." }]
```

---

## Data Model

### localStorage keys

**`atlas_places`** — user-added custom places only (pre-loaded places never stored):
```json
[{
  "id": "uuid",
  "name": "Machu Picchu",
  "type": "country | custom",
  "lat": -13.16,
  "lng": -72.54,
  "notes": ""
}]
```

**`atlas_visits`** — all visit records across all place types:
```json
[{
  "id": "uuid",
  "placeId": "VA | acad | uuid",
  "date": "2023-07-04",
  "estimated": false,
  "tags": ["family-trip", "sarah"],
  "notes": "Hiked Cadillac Mountain at sunrise."
}]
```

**`atlas_photos`** — keyed by placeId, stores base64 data URL:
```json
{ "acad": "data:image/jpeg;base64,..." }
```

Places from JSON files are merged at runtime with visit data — updating the JSON never corrupts stored visits.

Tags are free-form strings derived from visits with no separate registry. Autocomplete is built from all previously used tags.

---

## Tab Layout

### Map
- Full-width D3 US map
- Toggle buttons (top-right): `States` / `Parks` / `Both`
- States: choropleth fill — visited vs unvisited
- Parks: dot layer — dots colored by NPS type, shown when Parks or Both toggled
- Filter bar above map: filter visible places by tag
- Clicking a state or park dot opens the detail drawer

### States
- Table columns: abbrev, name, region, first visited, visit count, tags
- Sortable columns; filter by tag, region, visited/unvisited
- Click row opens detail drawer

### Parks
- Table columns: name, NPS type, state, established, first visited, visit count, tags
- Filterable by NPS type, state, tag, visited/unvisited
- User-added custom sites appear with a "custom" badge
- `+ Add Place` button in tab header

### Countries
- Simple sortable table: name, first visited, visit count, tags
- No map
- `+ Add Place` button in tab header

### Stats
- Bar chart: visits per year, stacked/grouped by place type (state / park / country / custom)
- Completion counters with thin progress bars: `23 / 51 states` · `14 / 420 parks`

---

## Detail Drawer

Slides in from the right (~380px). Rest of page dims slightly.

**Content:**
- Place name (serif heading), subtitle (type / state / established date)
- Key facts from JSON (state capital, NPS type + established year, etc.)
- Favorite photo — drag-and-drop target; stored as base64 in `atlas_photos`. Warn user if image exceeds 500KB.
- Visit history list — each entry: date, tags as pill badges, notes, estimated flag
- `+ Add Visit` button at top of visit history

**Unvisited state:** shows key facts with an inviting "Plan a visit?" prompt instead of visit history.

---

## Add Visit Form

Inline in the detail drawer (not a modal):

| Field | Required | Notes |
|-------|----------|-------|
| Date | Yes | Defaults to today |
| Estimated | No | Checkbox flag on the date |
| Tags | Yes (≥1) | Free-form, autocomplete from prior tags |
| Notes | No | Single textarea |

---

## Add Custom Place Form

Triggered by `+ Add Place` in Parks or Countries tab:

| Field | Required | Notes |
|-------|----------|-------|
| Name | Yes | |
| Type | Yes | `country` or `custom` |
| Lat / Lng | No | Enables map pin if provided |
| Notes | No | |

---

## Technical Notes

- **D3.js** (CDN) for US map rendering using TopoJSON
- **TopoJSON** (CDN) for US states and county boundaries
- Park lat/lng coordinates in `parks.json` enable dot placement directly
- **Chart.js** or D3 for Stats tab bar chart
- All fonts from Google Fonts CDN (Playfair Display for headings, Inter or similar for body)
- No other dependencies
