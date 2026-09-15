# Life Line: Year-Only Dates, Locations, Gender-Skip, Relationship-Fill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add year-only dates, first-order birth/death locations, gender-inference on relationship-linked adds, and a `/rel fill` relationship-suggestion walkthrough to `apps/life-line/index.html`.

**Architecture:** This is a single-file, no-build, no-test-framework vanilla-JS app (`apps/life-line/index.html`, localStorage-backed). There is no pytest/jest harness anywhere in this repo — verification is manual, done by opening the file in the Browser tool and driving the console command bar. Every task below therefore ends with a **Verify in browser** step instead of an automated test run. Keep changes additive and backward-compatible with existing saved `localStorage` data (old records without the new fields must still load via the existing `sanitizeX` defaulting pattern).

**Tech Stack:** Vanilla JS, HTML, CSS custom properties, localStorage. No dependencies.

**Design doc:** `docs/plans/2026-07-10-life-line-relationships-design.md`

---

## Before you start

Open the app once to see current behavior and get familiar with the console-driven UI:

```
mcp__Claude_Browser__preview_start { url: "file:///D:/code/ai-utils/apps/life-line/index.html" }
```

Add a couple of test people via the console (`/add Name`, wizard prompts) so you have data to exercise relationship commands against. All work happens in `apps/life-line/index.html` — there is only one file.

---

### Task 1: Year-only dates in `normalizeDate`

**Files:**
- Modify: `apps/life-line/index.html` (function `normalizeDate`, ~line 237)

**Step 1: Update `normalizeDate` to accept bare `YYYY`**

Current implementation only accepts `YYYY-MM-DD`. Replace it with:

```js
function normalizeDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const yearOnly = raw.match(/^(\d{4})$/);
  if (yearOnly) {
    const year = parseInt(yearOnly[1], 10);
    return year >= 1 && year <= 9999 ? yearOnly[1] : '';
  }
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const iso = new Date(raw + 'T00:00:00Z');
  return Number.isNaN(iso.getTime()) || iso.toISOString().slice(0, 10) !== raw ? '' : raw;
}
```

**Step 2: Verify in browser**

Reload the app. Run:
```
/set birth 1980
```
Expected status message: `... birth → 1980` (no error). Check the focus card shows `1980 → ...` in the life line. Then try an invalid year-only value:
```
/set birth abcd
```
Expected: `Date must be YYYY-MM-DD.`

**Step 3: Commit**

```bash
git add apps/life-line/index.html
git commit -m "Allow year-only birth/death dates in life-line"
```

---

### Task 2: Handle year-only dates in `ageLabel` and GEDCOM export

**Files:**
- Modify: `apps/life-line/index.html` (function `ageLabel`, ~line 627; function `gedDate` inside `exportGedcom`, ~line 1452)

**Step 1: Update `ageLabel` to cope with year-only birth/death**

`ageLabel` currently does `new Date(person.birthDate + 'T00:00:00Z')`, which fails to parse for a bare `"1980"` (becomes an invalid ISO string). Pad year-only dates to `-01-01` before parsing:

```js
function ageLabel(person) {
  if (!person.birthDate) return '';
  const pad = d => /^\d{4}$/.test(d) ? d + '-01-01' : d;
  const birth = new Date(pad(person.birthDate) + 'T00:00:00Z');
  const end = person.deathDate ? new Date(pad(person.deathDate) + 'T00:00:00Z') : new Date();
  let years = end.getUTCFullYear() - birth.getUTCFullYear();
  const dm = end.getUTCMonth() - birth.getUTCMonth();
  if (dm < 0 || (dm === 0 && end.getUTCDate() < birth.getUTCDate())) years--;
  if (years < 0) return '';
  return person.deathDate ? `${years}y` : `${years}y now`;
}
```

**Step 2: Verify `gedDate` already handles year-only (no change needed)**

Read `gedDate` in `exportGedcom` (~line 1452): it already branches on whether month/day exist (`const [y, m, d] = iso.split('-')`), so a bare `"1980"` naturally falls through to `return y;`. Confirm this by inspection — no code change required here, just note it in the commit message if you touch the file for other reasons.

**Step 3: Verify in browser**

With a person whose `birth = 1980` (no month/day) and no death date, check the focus card shows an age like `46y now` (relative to current year) rendered in success color. Then run `/export ged` and open the downloaded `.ged` file — confirm the `BIRT`/`DATE` line shows just `1980` with no `JAN`/day.

**Step 4: Commit**

```bash
git add apps/life-line/index.html
git commit -m "Compute age correctly for year-only birth/death dates"
```

---

### Task 3: Update hint text and usage strings for year-only dates

**Files:**
- Modify: `apps/life-line/index.html` (`WIZARD_STEPS` ~line 439; `wizardHandleInput` ~line 463; `showHelp` body ~line 951; any `statusMsg('Date must be YYYY-MM-DD.')` strings used for birth/death — NOT relationship `date`/`endDate`, which remain full-date-only per design)

**Step 1: Update wizard hints**

In `WIZARD_STEPS`, change the `birth`/`death` step hints from `'(YYYY-MM-DD or Enter to skip)'` to `'(YYYY or YYYY-MM-DD, or Enter to skip)'`.

**Step 2: Update wizard validation message**

In `wizardHandleInput`, the birth/death validation branch currently says `'Date must be YYYY-MM-DD. Try again:'`. Change to `'Date must be YYYY or YYYY-MM-DD. Try again:'`.

**Step 3: Update `/set` and `/person` error strings for birth/death only**

In `handleSetCommand`, the generic `if ((key === 'birthDate' || key === 'deathDate') && !normalizeDate(value)) return statusMsg('Date must be YYYY-MM-DD.');` becomes `'Date must be YYYY or YYYY-MM-DD.'`. Same for the equivalent check in `cmdPersonUpdate` and `cmdPersonAdd`. **Do not** change relationship (`/rel add`, `/rel update`) or event (`/event add`) date validation messages — those still require full `YYYY-MM-DD` (marriage/divorce/event dates are not in scope for year-only per the design doc).

**Step 4: Update `/help` text**

No functional change needed in `showHelp` unless you want to mention year-only support next to `/set name|birth|death|...`; optional, skip if it doesn't fit cleanly.

**Step 5: Verify in browser**

Trigger the add wizard (`/add`), tab through to BIRTH step, confirm hint text reads `(YYYY or YYYY-MM-DD, or Enter to skip)`. Enter an invalid value like `19x0` and confirm the retry message says `YYYY or YYYY-MM-DD`.

**Step 6: Commit**

```bash
git add apps/life-line/index.html
git commit -m "Update life-line hint/error text for year-only dates"
```

---

### Task 4: Add `locations` collection with sanitize/id plumbing

**Files:**
- Modify: `apps/life-line/index.html` (`db` initializer ~line 231; add `sanitizeLocation` near other `sanitizeX` functions ~line 291-336; `loadDB` ~line 338; `sanitizePerson` ~line 291; `importData` ~line 1436; `isValidImport` ~line 1428; `exportDataJson` ~line 1417)

**Step 1: Add `locations` to the in-memory `db` shape**

Change:
```js
let db = { people: [], relationships: [], events: [], backlog: [], backlogArchive: [], theme: 'legacy', focusPersonId: '' };
```
to:
```js
let db = { people: [], relationships: [], events: [], locations: [], backlog: [], backlogArchive: [], theme: 'legacy', focusPersonId: '' };
```

**Step 2: Add `sanitizeLocation`**

Add near the other sanitize functions (after `sanitizeEvent`):

```js
function sanitizeLocation(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    id: cleanText(source.id) || nextId('L', db.locations || []),
    name: cleanText(source.name) || 'UNNAMED LOCATION',
    notes: cleanText(source.notes),
    createdAt: cleanText(source.createdAt) || new Date().toISOString()
  };
}
```

**Step 3: Add `birthLocationId`/`deathLocationId` to `sanitizePerson`**

In the object returned by `sanitizePerson`, add two fields:
```js
    birthLocationId: cleanText(source.birthLocationId),
    deathLocationId: cleanText(source.deathLocationId),
```
Insert them right after `deathDate` and before `branch` for readability.

**Step 4: Load/persist `locations` in `loadDB`**

In `loadDB`, add `locations: Array.isArray(parsed.locations) ? parsed.locations : []` to the `base` object (alongside `backlog`/`backlogArchive`), then after the existing `base.events = ...` lines add:
```js
    base.locations = base.locations.map(sanitizeLocation);
    db.locations = base.locations;
```
Note `db = { people: [], relationships: [], events: [] };` reset line a few lines above also needs `locations: []` added so `nextId('L', db.locations)` doesn't throw while sanitizing during load — change it to `db = { people: [], relationships: [], events: [], locations: [] };`.

**Step 5: Update `isValidImport` and `importData`**

`isValidImport` should NOT require `locations` (so older exports without it still import) — leave it as-is, just tolerant.

In `importData`, add `locations: Array.isArray(obj.locations) ? obj.locations.map(sanitizeLocation) : []` to the `base` object.

**Step 6: Update `exportDataJson`**

Add `locations: db.locations` to the returned object.

**Step 7: Verify in browser**

Reload the app (this exercises `loadDB` with no `locations` key in existing `localStorage` — should not throw). Open devtools console (via `mcp__Claude_Browser__read_console_messages`) and confirm no errors. Run `/export json`, open the file, confirm it has an empty `"locations": []` array.

**Step 8: Commit**

```bash
git add apps/life-line/index.html
git commit -m "Add locations collection to life-line data model"
```

---

### Task 5: `/location` command (add/update/remove/list)

**Files:**
- Modify: `apps/life-line/index.html` (add `findLocation`, `cmdLocationAdd`, `cmdLocationUpdate`, `cmdLocationRemove`, `handleLocationCommand` near the `/person` command handlers ~line 1137-1217; wire into `handleConsoleCmd` ~line 1652)

**Step 1: Add a `findLocation` helper**

Mirror `findPerson` (~line 408):

```js
function findLocation(token) {
  const query = cleanText(token);
  if (!query) return { error: 'Location required.' };
  const byId = db.locations.find(loc => loc.id.toLowerCase() === query.toLowerCase());
  if (byId) return { location: byId };
  const exactName = db.locations.find(loc => loc.name.toLowerCase() === query.toLowerCase());
  if (exactName) return { location: exactName };
  const partial = db.locations.filter(loc => loc.name.toLowerCase().includes(query.toLowerCase()));
  if (partial.length === 1) return { location: partial[0] };
  if (partial.length > 1) return { error: 'Ambiguous location: ' + query };
  return { error: 'Location not found: ' + query };
}
```

**Step 2: Add `cmdLocationAdd`, `cmdLocationUpdate`, `cmdLocationRemove`, `handleLocationCommand`**

```js
function cmdLocationAdd(raw) {
  const [name, notes] = splitPipe(raw);
  if (!name) return statusMsg('Usage: /location add Name | notes');
  const location = sanitizeLocation({ id: nextId('L', db.locations), name, notes });
  db.locations.push(location);
  saveDB();
  render();
  statusMsg(`Added location ${location.name} (${location.id}).`);
}

function cmdLocationUpdate(raw) {
  const [token, fieldRaw, value] = splitPipe(raw);
  const match = findLocation(token);
  if (match.error) return statusMsg(match.error);
  const field = cleanText(fieldRaw).toLowerCase();
  const updates = { name: 'name', notes: 'notes' };
  const key = updates[field];
  if (!key) return statusMsg('Field must be name or notes.');
  match.location[key] = cleanText(value);
  saveDB();
  render();
  statusMsg(`Updated location ${match.location.name}: ${key}.`);
}

function cmdLocationRemove(raw) {
  const match = findLocation(raw);
  if (match.error) return statusMsg(match.error);
  const removedId = match.location.id;
  db.locations = db.locations.filter(loc => loc.id !== removedId);
  db.people.forEach(person => {
    if (person.birthLocationId === removedId) person.birthLocationId = '';
    if (person.deathLocationId === removedId) person.deathLocationId = '';
  });
  saveDB();
  render();
  statusMsg(`Removed location ${match.location.name}.`);
}

function locationListText(query) {
  const filtered = cleanText(query)
    ? db.locations.filter(loc => loc.name.toLowerCase().includes(query.toLowerCase()) || loc.id.toLowerCase() === query.toLowerCase())
    : db.locations.slice();
  if (!filtered.length) return 'No matching locations.';
  return filtered
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(loc => `${loc.id}  ${loc.name}${loc.notes ? '  — ' + loc.notes : ''}`)
    .join('\n');
}

function handleLocationCommand(arg) {
  const trimmed = cleanText(arg);
  if (!trimmed || trimmed === 'list') return openOverlay('LOCATIONS', locationListText(''), false);
  if (trimmed.startsWith('list ')) return openOverlay('LOCATIONS', locationListText(trimmed.slice(5)), false);
  if (trimmed.startsWith('add ')) return cmdLocationAdd(trimmed.slice(4));
  if (trimmed.startsWith('update ')) return cmdLocationUpdate(trimmed.slice(7));
  if (trimmed.startsWith('remove ')) return cmdLocationRemove(trimmed.slice(7));
  statusMsg('Usage: /location add|update|remove|list');
}
```

**Step 3: Wire into `handleConsoleCmd`**

Add `if (cmd === '/location') return handleLocationCommand(rest);` alongside the other command dispatches (~line 1665, near `/attr`/`/rel`).

**Step 4: Verify in browser**

Run:
```
/location add Springfield | hometown
/location list
```
Expected: overlay shows `L1  Springfield  — hometown`. Then:
```
/location update Springfield | notes | updated note
/location remove Springfield
/location list
```
Expected: final list shows "No matching locations."

**Step 5: Commit**

```bash
git add apps/life-line/index.html
git commit -m "Add /location command to life-line"
```

---

### Task 6: `/set birthplace|deathplace` — resolve-or-create on focus person

**Files:**
- Modify: `apps/life-line/index.html` (`handleSetCommand` ~line 517; `SET_FIELD_MAP` unaffected — handle as a special case like `marriage`/`divorce`)

**Step 1: Add a resolve-or-create helper**

```js
function resolveOrCreateLocation(name) {
  const clean = cleanText(name);
  if (!clean) return null;
  const existing = db.locations.find(loc => loc.name.toLowerCase() === clean.toLowerCase());
  if (existing) return existing;
  const created = sanitizeLocation({ id: nextId('L', db.locations), name: clean });
  db.locations.push(created);
  return created;
}
```

Place it right after `cmdLocationAdd` or near `findLocation`.

**Step 2: Add `birthplace`/`deathplace` handling in `handleSetCommand`**

Insert a new branch before the existing `marriage`/`divorce` branch (or after — order doesn't matter, just keep it a distinct `if`):

```js
  if (field === 'birthplace' || field === 'deathplace') {
    if (!value) return statusMsg('Usage: /set ' + field + ' <location name>');
    const location = resolveOrCreateLocation(value);
    focus[field === 'birthplace' ? 'birthLocationId' : 'deathLocationId'] = location.id;
    saveDB(); render();
    return statusMsg(focus.name + ': ' + field + ' → ' + location.name);
  }
```

**Step 3: Update the fallback usage message**

The final `statusMsg('Field must be: name, birth, death, branch, gender, notes, marriage, divorce.');` becomes `'Field must be: name, birth, death, branch, gender, notes, birthplace, deathplace, marriage, divorce.'`.

**Step 4: Verify in browser**

With a focus person set, run:
```
/set birthplace Springfield
```
Expected: `... birthplace → Springfield`. Run `/location list` — confirm only one `Springfield` entry exists (reused, not duplicated) if you also ran Task 5's manual test with the same name in a fresh reload. Then:
```
/set deathplace Chicago
```
Confirm a second location is created.

**Step 5: Commit**

```bash
git add apps/life-line/index.html
git commit -m "Add /set birthplace and deathplace to life-line"
```

---

### Task 7: Render locations in focus card, people directory, and GEDCOM export

**Files:**
- Modify: `apps/life-line/index.html` (`renderFocus` ~line 749; `renderPeople` ~line 810; `exportGedcom` ~line 1450-1560; `exportDataTxt` ~line 1401, optional)

**Step 1: Show birthplace/deathplace on the focus card**

In `renderFocus`, after computing `summary`, look up the two locations and append them to the meta line. Replace:
```js
    <div class="focus-meta">${escHtml(formatLife(focus))} · ${focusAgeHtml(focus)}</div>
```
with a version that appends location names when present:
```js
  const locMap = new Map(db.locations.map(loc => [loc.id, loc]));
  const birthLoc = locMap.get(focus.birthLocationId);
  const deathLoc = locMap.get(focus.deathLocationId);
  const placePart = [birthLoc && ('b. ' + birthLoc.name), deathLoc && ('d. ' + deathLoc.name)].filter(Boolean).join(' · ');
```
(add these two lines before the template literal, alongside the existing `relRows`/`chips` computation), then change the meta line to:
```js
    <div class="focus-meta">${escHtml(formatLife(focus))} · ${focusAgeHtml(focus)}${placePart ? ' · ' + escHtml(placePart) : ''}</div>
```

**Step 2: Show locations in the people directory secondary line**

In `renderPeople`, inside the `.map(person => ...)` block, add location names to the `secondary` array. You'll need a `locMap` computed once outside the `.map` (reuse `peopleMap()`-style pattern):
```js
  const locMap = new Map(db.locations.map(loc => [loc.id, loc]));
```
placed near the top of `renderPeople`, then inside the per-person `secondary` array add:
```js
      locMap.get(person.birthLocationId) && `born: ${escHtml(locMap.get(person.birthLocationId).name)}`,
      locMap.get(person.deathLocationId) && `died: ${escHtml(locMap.get(person.deathLocationId).name)}`,
```

**Step 3: Emit `PLAC` in GEDCOM export**

In `exportGedcom`, where `BIRT`/`DEAT` are written (~line 1518-1524):
```js
    const bd = gedDate(person.birthDate);
    if (bd) { lines.push('1 BIRT'); lines.push('2 DATE ' + bd); }
    if (person.deathDate) {
      lines.push('1 DEAT Y');
      const dd = gedDate(person.deathDate);
      if (dd) lines.push('2 DATE ' + dd);
    }
```
This needs restructuring slightly because `PLAC` must nest under `BIRT`/`DEAT` even if there's no date. Replace with:
```js
    const birthLoc = pmap === pmap ? db.locations.find(l => l.id === person.birthLocationId) : null;
    const deathLoc = db.locations.find(l => l.id === person.deathLocationId);
    if (bd || birthLoc) {
      lines.push('1 BIRT');
      if (bd) lines.push('2 DATE ' + bd);
      if (birthLoc) lines.push('2 PLAC ' + birthLoc.name);
    }
    if (person.deathDate || deathLoc) {
      lines.push('1 DEAT Y');
      const dd = gedDate(person.deathDate);
      if (dd) lines.push('2 DATE ' + dd);
      if (deathLoc) lines.push('2 PLAC ' + deathLoc.name);
    }
```
(Drop the stray `pmap === pmap` — that was a placeholder; just write `const birthLoc = db.locations.find(l => l.id === person.birthLocationId);`.) Note this changes the `if (bd)`/`if (person.deathDate)` guards to also fire when only a location is set with no date — that's intentional (you can record a birthplace without a birth date).

**Step 4: Verify in browser**

Set a focus person's `/set birthplace Springfield` and `/set deathplace Chicago`. Confirm the top-left focus card meta line shows `· b. Springfield · d. Chicago`. Confirm the people directory card for that person includes `born: Springfield` and `died: Chicago` in its secondary line. Run `/export ged`, open the file, confirm `2 PLAC Springfield` appears under that person's `1 BIRT` block.

**Step 5: Commit**

```bash
git add apps/life-line/index.html
git commit -m "Render birth/death locations in life-line UI and GEDCOM export"
```

---

### Task 8: Update `/help` text for locations

**Files:**
- Modify: `apps/life-line/index.html` (`showHelp` ~line 951-1008)

**Step 1: Add a LOCATIONS section**

After the `── ATTRIBUTES ──` block and before `── RELATIONSHIPS ──`, insert:
```
    '── LOCATIONS ──────────────────────────────────────────',
    '/location add Name | notes',
    '/location update location | field | value',
    '/location remove location',
    '/location list [query]',
    '/set birthplace|deathplace <name>   (creates location if new)',
    '',
```

**Step 2: Verify in browser**

Run `/help`, confirm the new section renders correctly in the overlay with no truncation.

**Step 3: Commit**

```bash
git add apps/life-line/index.html
git commit -m "Document /location commands in life-line help"
```

---

### Task 9: Skip gender step when adding via a gendered relationship keyword

**Files:**
- Modify: `apps/life-line/index.html` (`startWizard` ~line 448; `wizardPrompt` ~line 453; `wizardHandleInput` ~line 459; `wizardFinish` ~line 472; `WIZARD_STEPS` stays as the master list, unchanged)

**Step 1: Add a gender-inference table and compute active steps in `startWizard`**

```js
const REL_KEYWORD_GENDER = {
  father: 'male', son: 'male', brother: 'male', husband: 'male',
  mother: 'female', daughter: 'female', sister: 'female', wife: 'female'
};

function startWizard(relKeyword, relTargetId, prefillName) {
  const inferredGender = relKeyword ? REL_KEYWORD_GENDER[relKeyword.toLowerCase()] : undefined;
  const steps = relKeyword ? WIZARD_STEPS.filter(s => s.key !== 'gender') : WIZARD_STEPS;
  wizard = {
    step: prefillName ? 1 : 0,
    data: prefillName ? { name: prefillName } : {},
    relKeyword, relTargetId, steps,
    inferredGender
  };
  wizardPrompt();
}
```

**Step 2: Use `wizard.steps` instead of `WIZARD_STEPS` everywhere in the wizard flow**

In `wizardPrompt`:
```js
function wizardPrompt() {
  const step = wizard.steps[wizard.step];
  document.getElementById('console-prompt').textContent = step.label + '>';
  statusMsg(step.label + ' ' + step.hint);
}
```

In `wizardHandleInput`:
```js
function wizardHandleInput(value) {
  const step = wizard.steps[wizard.step];
  const trimmed = value.trim();
  if (step.key === 'name' && !trimmed) { statusMsg('Name is required. Enter a name:'); return; }
  if ((step.key === 'birth' || step.key === 'death') && trimmed && !normalizeDate(trimmed)) {
    statusMsg('Date must be YYYY or YYYY-MM-DD. Try again:'); return;
  }
  if (trimmed) wizard.data[step.key] = trimmed;
  wizard.step++;
  if (wizard.step >= wizard.steps.length) wizardFinish();
  else wizardPrompt();
}
```

**Step 3: Apply `inferredGender` in `wizardFinish`**

Change:
```js
  const { data, relKeyword, relTargetId } = wizard;
```
to:
```js
  const { data, relKeyword, relTargetId, inferredGender } = wizard;
```
and change the `sanitizePerson` call's `gender` field from `data.gender || ''` to `data.gender || inferredGender || ''`.

**Step 4: Verify in browser**

With a focus person set, run:
```
/add father Robert Smith
```
Confirm the wizard skips straight from DEATH to BRANCH (no GENDER prompt shown), completes, and that `/person list` (or the new person's directory card) shows `gender: male`. Then run:
```
/add sibling Pat Smith
```
Confirm gender is skipped and left blank (since `sibling` isn't in `REL_KEYWORD_GENDER`). Finally confirm plain `/add` (no keyword) still shows the GENDER step.

**Step 5: Commit**

```bash
git add apps/life-line/index.html
git commit -m "Infer gender and skip prompt when adding via gendered relationship keyword"
```

---

### Task 10: `/rel fill` — build candidate list (parent's-spouse and sibling's-parents rules)

**Files:**
- Modify: `apps/life-line/index.html` (add `buildRelFillCandidates` and helpers near `relationSummary` ~line 568-619; wire `/rel fill` subcommand into `handleRelationshipCommand` ~line 1280 and `handleConsoleCmd`)

This task builds the candidate-detection logic and a bare-bones command that just lists candidates (no interactive Y/N yet — that's Task 12). Splitting detection from the walkthrough UI keeps each task testable independently.

**Step 1: Add a "directly related" helper**

```js
function isDirectlyRelated(idA, idB) {
  if (idA === idB) return true;
  return db.relationships.some(r =>
    (r.fromId === idA && r.toId === idB) || (r.fromId === idB && r.toId === idA)
  );
}
```

**Step 2: Add `buildRelFillCandidates(focusId)` covering rules 1 and 4**

```js
function buildRelFillCandidates(focusId) {
  const map = peopleMap();
  const summary = relationSummary(focusId);
  const seen = new Set(); // dedupe by `otherId:relType`
  const candidates = []; // { otherId, relType, reason }

  function add(otherId, relType, reason) {
    if (otherId === focusId || isDirectlyRelated(focusId, otherId)) return;
    const key = otherId + ':' + relType;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ otherId, relType, reason });
  }

  // Rule 1: parent's spouse -> missing other parent (only when exactly one parent is linked)
  if (summary.parents.length === 1) {
    const parent = summary.parents[0];
    db.relationships.forEach(r => {
      if (r.type !== 'spouse') return;
      if (r.fromId !== parent.id && r.toId !== parent.id) return;
      const spouseId = r.fromId === parent.id ? r.toId : r.fromId;
      if (map.has(spouseId)) add(spouseId, 'parent-of-focus', "parent's spouse");
    });
  }

  // Rule 4: sibling's parents -> focus's parents (explicit sibling records only)
  db.relationships.forEach(r => {
    if (r.type !== 'sibling') return;
    if (r.fromId !== focusId && r.toId !== focusId) return;
    const sibId = r.fromId === focusId ? r.toId : r.fromId;
    db.relationships.forEach(pr => {
      if (pr.type !== 'parent' || pr.toId !== sibId) return;
      if (map.has(pr.fromId)) add(pr.fromId, 'parent-of-focus', "sibling's parent");
    });
  });

  return candidates;
}
```

**Step 3: Verify in browser (temporary console.log check)**

Since there's no interactive command yet, verify via devtools: build a small family (father with a spouse who isn't yet linked as mother), set focus to the child, then use `mcp__Claude_Browser__javascript_tool` to call `buildRelFillCandidates(getFocusPerson().id)` and confirm it returns the spouse as a `parent-of-focus` candidate. This is a scratch check, not part of the shipped UI — no code change needed for it.

**Step 4: Commit**

```bash
git add apps/life-line/index.html
git commit -m "Add rel-fill candidate detection for parent-spouse and sibling-parent rules"
```

---

### Task 11: `/rel fill` — extend candidate list (parent's-other-children and spouse's-children rules)

**Files:**
- Modify: `apps/life-line/index.html` (extend `buildRelFillCandidates` from Task 10)

**Step 1: Add rules 2 and 3 to `buildRelFillCandidates`**

Insert before the `return candidates;` line:

```js
  // Rule 2: parent's other children -> siblings of focus
  summary.parents.forEach(parent => {
    db.relationships.forEach(r => {
      if (r.type !== 'parent' || r.fromId !== parent.id || r.toId === focusId) return;
      if (map.has(r.toId)) add(r.toId, 'sibling-of-focus', "parent's other child");
    });
  });

  // Rule 3: spouse's children -> step-children of focus (focus becomes their parent)
  summary.spouses.forEach(spouse => {
    db.relationships.forEach(r => {
      if (r.type !== 'parent' || r.fromId !== spouse.id) return;
      if (map.has(r.toId)) add(r.toId, 'child-of-focus', "spouse's child");
    });
  });
```

**Step 2: Verify in browser**

Using the same scratch `javascript_tool` approach as Task 10, build a family where the focus person's father has another child not linked as a sibling — confirm it appears as a `sibling-of-focus` candidate. Then give the focus person a spouse who already has a child from a prior relationship — confirm it appears as a `child-of-focus` candidate.

**Step 3: Commit**

```bash
git add apps/life-line/index.html
git commit -m "Add rel-fill candidate detection for sibling and step-child rules"
```

---

### Task 12: `/rel fill` — interactive Y/N walkthrough

**Files:**
- Modify: `apps/life-line/index.html` (new `relFill` state + functions near the wizard section ~line 438-487; input handling in the `keydown` listener ~line 1625-1650; `handleRelationshipCommand` ~line 1280; `Escape` handling ~line 1673-1687)

**Step 1: Add rel-fill state and helper to describe a candidate**

Near the top with other module-level state (`let wizard = null;` ~line 232), add:
```js
let relFill = null; // { candidates: [...], index: 0, added: 0, focusId }
```

Add a label helper (place near `addRelForFocus`, ~line 490):
```js
const RELFILL_LABELS = {
  'parent-of-focus': 'PARENT',
  'sibling-of-focus': 'SIBLING',
  'child-of-focus': 'CHILD'
};

function relFillCurrentPrompt() {
  const map = peopleMap();
  const focus = map.get(relFill.focusId);
  const candidate = relFill.candidates[relFill.index];
  const other = map.get(candidate.otherId);
  document.getElementById('console-prompt').textContent = 'ADD?>';
  statusMsg(`Add ${other.name} as ${focus.name}'s ${RELFILL_LABELS[candidate.relType]}? (${candidate.reason}) y/n`);
}
```

**Step 2: Add start/advance/apply functions**

```js
function startRelFill() {
  const focus = getFocusPerson();
  if (!focus) return statusMsg('No focus person set.');
  const candidates = buildRelFillCandidates(focus.id);
  if (!candidates.length) return statusMsg('No plausible missing relationships found.');
  relFill = { candidates, index: 0, added: 0, focusId: focus.id };
  relFillCurrentPrompt();
}

function relFillApplyCurrent() {
  const candidate = relFill.candidates[relFill.index];
  let canonical;
  if (candidate.relType === 'parent-of-focus') canonical = canonicalizeRelationship(candidate.otherId, 'parent', relFill.focusId);
  if (candidate.relType === 'sibling-of-focus') canonical = canonicalizeRelationship(relFill.focusId, 'sibling', candidate.otherId);
  if (candidate.relType === 'child-of-focus') canonical = canonicalizeRelationship(relFill.focusId, 'parent', candidate.otherId);
  if (!canonical) return false;
  const dup = db.relationships.find(r => r.type === canonical.type && r.fromId === canonical.fromId && r.toId === canonical.toId);
  if (dup) return false;
  const rel = sanitizeRelationship({ id: nextId('R', db.relationships), ...canonical });
  db.relationships.push(rel);
  return true;
}

function relFillAdvance(accepted) {
  if (accepted && relFillApplyCurrent()) {
    relFill.added++;
    saveDB();
    render();
  }
  relFill.index++;
  if (relFill.index >= relFill.candidates.length) {
    const total = relFill.candidates.length;
    const added = relFill.added;
    document.getElementById('console-prompt').textContent = 'LIFELINE>';
    relFill = null;
    statusMsg(`Added ${added} of ${total} suggestion${total === 1 ? '' : 's'}.`);
    return;
  }
  relFillCurrentPrompt();
}
```

**Step 3: Wire `/rel fill` into `handleRelationshipCommand`**

Add near the top of `handleRelationshipCommand` (after the `trimmed` computation, before the `list` branch):
```js
  if (trimmed === 'fill') return startRelFill();
```

**Step 4: Handle y/n input while `relFill` is active**

In the `input.addEventListener('keydown', ...)` handler (~line 1625), the `Enter` branch currently checks `if (wizard) { wizardHandleInput(cmd); return; }`. Add a parallel check right after it:
```js
    if (relFill) {
      const answer = cmd.trim().toLowerCase();
      if (answer === 'y' || answer === 'yes') relFillAdvance(true);
      else if (answer === 'n' || answer === 'no' || answer === '') relFillAdvance(false);
      else statusMsg('Please answer y or n.');
      return;
    }
```

**Step 5: Handle `Escape` cancelling an active rel-fill walkthrough**

In the document-level `keydown` listener's `Escape` branch (~line 1676), add a check before the existing `wizard` check:
```js
    if (relFill) {
      const remaining = relFill.candidates.length - relFill.index;
      relFill = null;
      document.getElementById('console-prompt').textContent = 'LIFELINE>';
      statusMsg(`Cancelled (${remaining} suggestion${remaining === 1 ? '' : 's'} skipped).`);
      return;
    }
```

**Step 6: Document `/rel fill` in `/help`**

In `showHelp`, in the `── RELATIONSHIPS ──` block, add a line:
```
    '/rel fill               walk plausible missing relationships, y/n to add each',
```

**Step 7: Verify in browser**

Build a family: person A (focus) has father B, and B has spouse C (not linked to A). Run:
```
/rel fill
```
Expected prompt: `Add C's name as A's PARENT? (parent's spouse) y/n`. Type `y` and press Enter — confirm the relationship is added (check `/rel list` or the focus card shows two parents now) and a summary message appears (`Added 1 of 1 suggestion.`) if that was the only candidate. Re-run `/rel fill` — expected: `No plausible missing relationships found.` since the gap is now closed. Also test declining (`n`) leaves the relationship unadded, and test `Escape` mid-walkthrough cancels cleanly and restores the `LIFELINE>` prompt.

**Step 8: Commit**

```bash
git add apps/life-line/index.html
git commit -m "Add interactive /rel fill relationship-suggestion walkthrough"
```

---

### Task 13: Final full-flow manual regression pass

**Files:** none (verification only)

**Step 1: Walk the whole feature set end-to-end in browser**

1. `/add` a person with year-only birth (`1975`) and no death — confirm age shows `Ny now`.
2. `/set birthplace Boston` — confirm location created and shown on focus card.
3. `/add father Robert` — confirm no GENDER prompt, gender auto-set to male.
4. `/add mother Linda` — confirm no GENDER prompt, gender auto-set to female; but instead do this via `/rel fill` where possible: add Robert's spouse Linda directly via `/add spouse Linda` from Robert's focus, then switch focus back to the original person and run `/rel fill` to confirm it offers Linda as the missing parent.
5. Run `/export ged` and `/export json`; confirm both files open without errors and contain the new fields (`PLAC`, `locations`).
6. Reload the page fresh (simulating a returning user) and confirm all data persists correctly (locations, year-only dates, genders).

**Step 2: Fix any regressions found, committing each fix separately with a descriptive message.**

No commit for this task itself unless regressions are found and fixed.

---

## Notes for the executing agent

- There is no linter or test runner configured for this repo (`docs/apps-data.md` and `README.md` confirm the no-build-step philosophy) — do not add one.
- Keep every change inside `apps/life-line/index.html`; this is a deliberately single-file app.
- Preserve backward compatibility with existing `localStorage` saves — every new field must default sanely via the `sanitizeX` functions when absent from old data.
- Follow the existing code style: no semicolon-heavy defensive code beyond what's already there, `cleanText`/`escHtml` for all user-facing string handling, `statusMsg` for transient feedback, `render()` after any mutation that affects the UI.
