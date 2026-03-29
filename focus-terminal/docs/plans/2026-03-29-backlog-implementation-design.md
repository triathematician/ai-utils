# Focus Terminal — Backlog Implementation Design
**Date:** 2026-03-29

## Scope

Implement all 9 open backlog items plus one bugfix in `focus-terminal.html`. All changes are self-contained to the single HTML file. No new dependencies or infrastructure required.

---

## Changes

### 1. Font size +30%
Change `--font-size: 15px` → `20px` in `:root`. All `em`-based sizes scale automatically.

### 2. Center ONE THING / FOCUS section
Add centering to the top-row. The ONE THING text and focus items should be horizontally and/or vertically centered within `#top-row`.

### 3. Eisenhower matrix category labels
In `renderMatrix()`, append the item's `dim` label (e.g., `[PHY]`) after item text. Show `[—]` if unset. Use the short label from DIMS.

### 4. `/help` styled popup
Replace `alert()` in `showHelp()` with a styled in-app overlay. Reuse the existing `#popup-overlay` / `#popup-box` pattern. Add a `#help-overlay` element with the same visual language (border, font, accent color headings). Triggered by `/help`, dismissed by ESC or clicking outside.

### 5. Dimension options shown during Q&A score phase
When `advanceBoot()` renders a score question (`phase === 'scores'`), print a reference line listing all 9 dimensions with their short keys. Example: `PHY MNT IDN REL VOC FIN GRW PLY PCE`.

### 6. North star question variants
Replace the hardcoded "What 10% move..." prompt with a random pick from 9 approved variants using `Math.floor(Math.random() * NORTH_STAR_QUESTIONS.length)`. Pick once per goal during boot.

**Approved variants:**
1. "What 10% move serves this goal today?"
2. "What's the smallest action today that builds toward this?"
3. "If you could only do one thing for this goal today, what would it be?"
4. "What would future-you wish you had done today on this?"
5. "What resistance are you avoiding on this — and can you touch it today?"
6. "What does 1% better look like for this goal today?"
7. "What's the most honest next step on this?"
8. "If this goal were already achieved, what did today look like?"
9. "What would make today count toward this?"

### 7. Balance grid score-line visualization
Replace the current `dim-score` number with a 5-character scale showing score position, followed by `|`, followed by the item squares. Format: `--■--|` where `■` is at position `score` (1–5), and `-` fills the rest. Score 0 or unset shows `--?--|`.

Color the scale character using dimension-appropriate or score-based color (use `--fg` for the marker, `--dim` for dashes).

### 8. Balance grid square tooltips
Each `sq` span gets a `title` attribute set to the item's text. Since items are already associated with their squares during `addSq()`, pass item text at construction time.

Refactor `addSq()` to accept an optional array of item texts and set `title` on each span.

### 9. Balance grid label tooltip (full category name)
The existing `lbl.title = dim.full` uses native browser tooltip. Replace with the app's custom `#tooltip` element for visual consistency. Add a `mousemove`/`mouseleave` listener on `lbl` that shows `dim.full` in the custom tooltip.

### 10. `/backlog` command
Add `backlog: []` to `db` initial state (and load from localStorage as existing). Each entry: `{ id, text, createdAt }`.

Commands:
- `/backlog [text]` — append item to `db.backlog`, save, show status message
- `/backlog export` — download `focus-backlog-YYYY-MM-DD.txt` with one item per line, prefixed `- [ ]`
- `/backlog list` — show all items in the styled help overlay (or status bar for short lists)

Update `/help` popup to include backlog commands.

### 11. Bugfix — NI toggle repaint
After toggling `niVisible` in the click handler, call `renderMatrix()` to force a DOM reflow. This ensures the quadrant grid recalculates layout immediately when the NI panel is shown or hidden.

---

## Data Model Addition

```js
db = {
  northStarGoals: [],
  today: null,
  history: [],
  theme: 'legacy',
  backlog: []          // NEW
}
```

No migration needed — `loadDB()` will leave `backlog` as `undefined` on old saves; callers use `db.backlog = db.backlog || []` guard.

---

## Constraints
- Single HTML file, no build step
- All state in localStorage under key `focus_terminal_db`
- Visual style must match existing theme system (CSS variables)
- No new external dependencies
