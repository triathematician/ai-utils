# life-line: dates, locations, relationship-fill — design

## Goals

1. Allow birth/death dates to be year-only.
2. Track birth/death location as first-order objects (own collection, like people/relationships/events), not just free text.
3. Stop asking for gender when adding a relative via a gendered keyword (father/mother/brother/sister/son/daughter/husband/wife); infer gender from the keyword instead.
4. Add a `/rel fill` command that walks the focus person's family unit for plausible-but-missing relationships and asks Y/N to add each.

## 1. Year-only dates

`normalizeDate` currently requires `YYYY-MM-DD`. Extend it to also accept a bare 4-digit `YYYY`, returning it unchanged if valid (reasonable year range). All downstream code that already treats dates as opaque strings (sorting via `localeCompare`, GEDCOM `gedDate`, display via `formatLife`) works unchanged since `"1990"` sorts and truncates consistently against `"1990-01-01"`. `ageLabel` needs adjustment to compute from `YYYY` by treating it as Jan 1 of that year. Wizard hints and `/set`/`/person` usage text updated to mention year-only is allowed.

## 2. Locations as first-order objects

New `db.locations` array: `{ id, name, notes, createdAt }`, following the same `sanitizeX`/`nextId('L', ...)` pattern as people/relationships/events.

`sanitizePerson` gains `birthLocationId` / `deathLocationId` (default `''`).

Commands:
- `/location add Name | notes`
- `/location update location | field | value` (name, notes)
- `/location remove location`
- `/location list [query]`
- `/set birthplace <name>` / `/set deathplace <name>` on focus person — resolves an existing location by exact name match (case-insensitive) or creates a new one, then sets the corresponding id.

Rendering: focus card shows birthplace/deathplace next to the date line when set. People directory secondary line includes location names when present. GEDCOM export emits `2 PLAC <name>` nested under `1 BIRT` / `1 DEAT`.

`cmdPersonRemove` does not cascade-delete locations (locations can be shared/reused); orphaned locations are left in place, consistent with how the app doesn't prune unused branches either.

## 3. Skip gender prompt on relationship-linked add

`WIZARD_STEPS` becomes conditional: when `wizard.relKeyword` is one of the gendered keywords, the GENDER step is omitted from the walked steps and `wizard.data.gender` is pre-set by inference:
- father, son, brother, husband → `male`
- mother, daughter, sister, wife → `female`
- parent, guardian, child, sibling, spouse, partner → left unset (ambiguous keyword, still skip asking — user can `/set gender` later if desired)

Plain `/add Name` (no relKeyword) keeps the existing 6-step flow including GENDER.

## 4. `/rel fill` — relationship suggestion walkthrough

New console-driven wizard (reuses the existing single-question-at-a-time console pattern, not the person-add wizard) that, for the current focus person, computes a candidate list from these rules and asks Y/N for each in turn:

1. **Parent's spouse → missing other parent.** If focus has exactly one linked parent and that parent has a spouse not already linked as focus's parent, suggest linking the spouse as parent.
2. **Parent's other children → siblings.** For each linked parent, find their other children not already connected to focus via a parent-relationship or explicit sibling record; suggest linking as siblings.
3. **Spouse's children → step-children.** For each linked spouse, find their children not already linked to focus as children; suggest linking focus as parent.
4. **Sibling's parents → focus's parents.** For each explicit sibling relationship, find the sibling's parents not already linked to focus; suggest linking them as focus's parents.

Candidates are deduplicated (a pair should only be suggested once even if reachable via multiple rules) and skip anyone already directly related to focus in any way. Each accept immediately writes the relationship and re-renders; each decline or accept advances to the next candidate. If there are zero candidates, show a status message and exit immediately. At the end, show a summary count ("Added N of M suggestions.").

Console prompt during the walkthrough shows the candidate description (e.g. `ADD John Smith AS FATHER? (y/n)`); `Esc` cancels the remainder of the walkthrough.

## Out of scope

- No UI for browsing/searching locations beyond `/location list`.
- No de-duplication/merge tooling for locations with similar names.
- `/rel fill` does not attempt in-law or step-relationships beyond the four rules above (e.g. no aunt/uncle/cousin inference).
