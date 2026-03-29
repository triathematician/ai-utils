# Focus Terminal Backlog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 9 backlog items and 1 bugfix in `focus-terminal/focus-terminal.html`.

**Architecture:** Single self-contained HTML file. All state is in `localStorage` under key `focus_terminal_db`. No build step, no test framework — verification is manual browser testing by opening the file directly. All CSS uses variables from `:root` and theme overrides via `[data-theme]` attributes.

**Tech Stack:** Vanilla HTML/CSS/JS, localStorage, no dependencies beyond Google Fonts.

---

## Reference: Key Locations in `focus-terminal.html`

- `:root` CSS vars: line ~13
- `#top-row` CSS: line ~163
- `#balance-panel` CSS: line ~291
- `.balance-row` CSS: line ~305
- `DIMS` constant: line ~668
- `db` state object: line ~694
- `loadDB()`: line ~704
- `advanceBoot()` — `focus_goals` phase: line ~855
- `advanceBoot()` — `scores` phase: line ~899
- `renderTopRow()`: line ~1087
- `renderMatrix()`: line ~1123
- `renderBalanceGrid()`: line ~1168
- NI toggle listener: line ~1152
- `handleConsoleCmd()`: line ~1404
- `showHelp()`: line ~1449
- `exportData()` / `downloadBlob()`: line ~1511

---

## Task 1: Bugfix — NI toggle doesn't re-hide quadrant

**File:** `focus-terminal/focus-terminal.html`

**The bug:** The `else` branch of the NI toggle listener never re-adds `ni-hidden` to `#q-ni`, so clicking to hide after showing does nothing visually.

**Step 1: Find the toggle listener (~line 1152)**

Locate this block:
```javascript
document.getElementById('ni-toggle').addEventListener('click', ()=>{
  niVisible = !niVisible;
  const ni = document.getElementById('q-ni');
  const toggle = document.getElementById('ni-toggle');
  if (niVisible) {
    ni.classList.remove('ni-hidden');
    toggle.textContent = '[-NI] hide not-important';
    toggle.style.color = 'var(--fg)';
  } else {
    toggle.textContent = '[+NI] show not-important';
    toggle.style.color = 'var(--dim)';
  }
});
```

**Step 2: Apply fix — add `classList.add` and `renderMatrix()` call**

Replace the entire listener with:
```javascript
document.getElementById('ni-toggle').addEventListener('click', ()=>{
  niVisible = !niVisible;
  const ni = document.getElementById('q-ni');
  const toggle = document.getElementById('ni-toggle');
  if (niVisible) {
    ni.classList.remove('ni-hidden');
    toggle.textContent = '[-NI] hide not-important';
    toggle.style.color = 'var(--fg)';
  } else {
    ni.classList.add('ni-hidden');
    toggle.textContent = '[+NI] show not-important';
    toggle.style.color = 'var(--dim)';
  }
  renderMatrix();
});
```

**Step 3: Verify**

Open `focus-terminal.html` in browser. Run `/boot`, add items. Click `[+NI]` — NI quadrant appears. Click `[-NI]` — it disappears. Toggle multiple times — always responds.

**Step 4: Commit**
```bash
git add focus-terminal/focus-terminal.html
git commit -m "fix: NI toggle re-hide bug and force matrix repaint"
```

---

## Task 2: CSS — Font size +30% and center ONE THING/FOCUS

**File:** `focus-terminal/focus-terminal.html`

**Step 1: Increase font size**

Find in `:root` (~line 24):
```css
  --font-size: 15px;
```
Replace with:
```css
  --font-size: 20px;
```

**Step 2: Center ONE THING display**

Find `#one-thing-display` CSS block (~line 177):
```css
#one-thing-display {
  color: var(--fg);
  font-size: 1.3em;
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```
Replace with:
```css
#one-thing-display {
  color: var(--fg);
  font-size: 1.3em;
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}
```

**Step 3: Center focus items**

Find `#focus-display` CSS block (~line 186):
```css
#focus-display {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  flex: 1;
}
```
Replace with:
```css
#focus-display {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  flex: 1;
  align-items: center;
}
```

**Step 4: Verify**

Open in browser. Font should feel noticeably larger across all panels. ONE THING text and focus items should be centered horizontally in the top section.

**Step 5: Commit**
```bash
git add focus-terminal/focus-terminal.html
git commit -m "style: increase font size 30% and center top-row content"
```

---

## Task 3: Eisenhower matrix — show category labels on items

**File:** `focus-terminal/focus-terminal.html`

**Step 1: Find renderMatrix item render (~line 1143)**

Locate:
```javascript
      div.innerHTML = `<span class="check">${item.done?'✓':src}</span><span class="item-text">${escHtml(item.text)}</span>`;
```

**Step 2: Replace with version that appends dim label**

```javascript
      const dimLabel = item.dim ? (DIMS.find(d=>d.key===item.dim)?.label || item.dim) : '—';
      div.innerHTML = `<span class="check">${item.done?'✓':src}</span><span class="item-text">${escHtml(item.text)}</span><span class="tag">[${dimLabel}]</span>`;
```

The `.tag` class already exists in CSS (color: var(--dim), font-size: 0.85em) — no new CSS needed.

**Step 3: Verify**

Boot sequence, add items with `/phy`, `/fin` etc. Matrix items should show `[PHY]`, `[FIN]` labels. Items with no dim show `[—]`.

**Step 4: Commit**
```bash
git add focus-terminal/focus-terminal.html
git commit -m "feat: show dimension label on each Eisenhower matrix item"
```

---

## Task 4: Balance grid improvements (score-line, square tooltips, label tooltip)

All three changes are in `renderBalanceGrid()` — do them together.

**File:** `focus-terminal/focus-terminal.html`

### 4a: Label tooltip using custom tooltip

**Step 1: Find the `lbl` span creation in `renderBalanceGrid()` (~line 1192)**

```javascript
    const lbl = document.createElement('span');
    lbl.className = 'dim-label';
    lbl.title = dim.full;
    lbl.textContent = dim.label;
```

**Step 2: Replace with version using custom tooltip**

```javascript
    const lbl = document.createElement('span');
    lbl.className = 'dim-label';
    lbl.textContent = dim.label;
    lbl.style.cursor = 'default';
    lbl.addEventListener('mousemove', (e) => {
      ttEl.style.display = 'block';
      ttEl.style.left = Math.min(e.clientX+12, window.innerWidth-320)+'px';
      ttEl.style.top  = Math.min(e.clientY+12, window.innerHeight-100)+'px';
      ttEl.textContent = dim.full;
    });
    lbl.addEventListener('mouseleave', () => { ttEl.style.display = 'none'; });
```

Note: `ttEl` is already declared at module scope (`const ttEl = document.getElementById('tooltip');`).

### 4b: Score-line visualization

**Step 1: Find the `scr` span creation (~line 1197)**

```javascript
    const scr = document.createElement('span');
    scr.className = 'dim-score';
    scr.textContent = score||'·';
```

**Step 2: Replace with score-line format `--■--|`**

```javascript
    const scr = document.createElement('span');
    scr.className = 'dim-score';
    const marker = score >= 1 && score <= 5
      ? Array.from({length:5}, (_,i) => i === score-1 ? '■' : '–').join('')
      : '–––––';
    scr.textContent = marker + '|';
```

**Step 3: Update `.dim-score` CSS (~line 325) to accommodate wider content**

Find:
```css
.dim-score {
  width: 1.2em;
  color: var(--fg);
  text-align: right;
  flex-shrink: 0;
}
```
Replace with:
```css
.dim-score {
  width: 4.2em;
  color: var(--fg);
  text-align: right;
  flex-shrink: 0;
  letter-spacing: 1px;
  font-family: monospace;
}
```

### 4c: Square tooltips showing item text

**Step 1: Find the `addSq` helper and its call sites (~line 1204)**

```javascript
    const addSq = (cls, n) => {
      for (let i=0;i<n;i++) {
        const s = document.createElement('span');
        s.className = 'sq '+cls;
        s.title = cls;
        sqs.appendChild(s);
      }
    };

    addSq('sq-imp-today', impToday);
    addSq('sq-imp-week',  impWeek);
    addSq('sq-nim-today', nimToday);
    addSq('sq-nim-week',  nimWeek);
```

And the filter lines above it (~line 1184):
```javascript
    const impToday  = todayItems.filter(i=>i.dim===dim.key && i.important).length;
    const impWeek   = histItems.filter(i=>i.dim===dim.key && i.important).length;
    const nimToday  = todayItems.filter(i=>i.dim===dim.key && !i.important).length;
    const nimWeek   = histItems.filter(i=>i.dim===dim.key && !i.important).length;
```

**Step 2: Replace both blocks**

Replace the filter lines:
```javascript
    const impTodayItems = todayItems.filter(i=>i.dim===dim.key && i.important);
    const impWeekItems  = histItems.filter(i=>i.dim===dim.key && i.important);
    const nimTodayItems = todayItems.filter(i=>i.dim===dim.key && !i.important);
    const nimWeekItems  = histItems.filter(i=>i.dim===dim.key && !i.important);
```

Replace `addSq` and its calls:
```javascript
    const addSqItems = (cls, items) => {
      items.forEach(item => {
        const s = document.createElement('span');
        s.className = 'sq '+cls;
        s.title = item.text;
        sqs.appendChild(s);
      });
    };

    addSqItems('sq-imp-today', impTodayItems);
    addSqItems('sq-imp-week',  impWeekItems);
    addSqItems('sq-nim-today', nimTodayItems);
    addSqItems('sq-nim-week',  nimWeekItems);
```

**Step 4: Verify**

Boot, add items with dim flags. In balance grid:
- Hover dim label (e.g. `PHY`) → custom tooltip shows `Physical`
- Score `■` should appear at correct position in `–––■–|` format
- Hover squares → tooltip shows item text

**Step 5: Commit**
```bash
git add focus-terminal/focus-terminal.html
git commit -m "feat: balance grid score-line vis, square tooltips, label tooltip"
```

---

## Task 5: Replace `/help` alert with styled in-app popup

**File:** `focus-terminal/focus-terminal.html`

### 5a: Add HTML element

**Step 1: Find the closing `</div>` after `#popup-overlay` block (~line 660)**

After the popup div and before `<script>`, add:
```html
<!-- HELP OVERLAY -->
<div id="help-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:150;align-items:center;justify-content:center;">
  <div style="background:var(--bg);border:1px solid var(--border);padding:16px 20px;min-width:400px;max-width:560px;width:90%;font-family:var(--font);color:var(--fg);font-size:0.9em;">
    <div id="help-title" style="color:var(--accent);font-size:1em;letter-spacing:2px;margin-bottom:10px;border-bottom:1px solid var(--muted);padding-bottom:6px;"></div>
    <div id="help-body" style="line-height:1.8;white-space:pre;"></div>
    <div style="margin-top:12px;border-top:1px solid var(--muted);padding-top:10px;font-size:0.82em;color:var(--dim);">
      <span id="help-close" style="cursor:pointer;">[ESC] CLOSE</span>
    </div>
  </div>
</div>
```

### 5b: Replace showHelp() function

**Step 2: Find `showHelp()` (~line 1449)**

```javascript
function showHelp() {
  const lines = [
    '/boot       — start morning boot sequence',
    ...
  ];
  alert('FOCUS TERMINAL COMMANDS\n\n' + lines.join('\n'));
}
```

Replace with:
```javascript
function showHelp(title, lines) {
  const overlay = document.getElementById('help-overlay');
  document.getElementById('help-title').textContent = title || 'FOCUS TERMINAL — COMMANDS';
  document.getElementById('help-body').textContent = (lines || [
    '/boot            start morning boot sequence',
    '/edit            re-enter boot to modify today',
    '/next            archive today, start fresh',
    '/export          download history (.txt + .json)',
    '/goals           manage north star goals',
    '/add [text]      quick-add item to list',
    '/ni              toggle not-important quadrant',
    '/theme [name]    legacy | solar | monk | space | synth | dos',
    '/backlog [text]  add item to backlog',
    '/backlog list    show all backlog items',
    '/backlog export  download backlog as .txt',
    '/help            this help',
    '',
    'Click any item to open detail/edit popup.',
  ]).join('\n');
  overlay.style.display = 'flex';
}

function closeHelp() {
  document.getElementById('help-overlay').style.display = 'none';
}
```

### 5c: Wire up close events

**Step 3: After the `closeHelp` function, add event listeners**

```javascript
document.getElementById('help-close').addEventListener('click', closeHelp);
document.getElementById('help-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('help-overlay')) closeHelp();
});
document.addEventListener('keydown', e => {
  if (document.getElementById('help-overlay').style.display !== 'none' && e.key === 'Escape') closeHelp();
});
```

**Step 4: Verify**

Type `/help` — styled overlay appears with command list. ESC and clicking outside both close it. Type `/backlog list` with items — overlay shows `BACKLOG` title and items.

**Step 5: Commit**
```bash
git add focus-terminal/focus-terminal.html
git commit -m "feat: replace help alert with styled in-app overlay"
```

---

## Task 6: Q&A improvements — dimension reference + question variants

**File:** `focus-terminal/focus-terminal.html`

### 6a: North star question variants

**Step 1: Add constant after `STORAGE_KEY` (~line 689)**

```javascript
const NORTH_STAR_QUESTIONS = [
  "What 10% move serves this goal today?",
  "What's the smallest action today that builds toward this?",
  "If you could only do one thing for this goal today, what would it be?",
  "What would future-you wish you had done today on this?",
  "What resistance are you avoiding on this — and can you touch it today?",
  "What does 1% better look like for this goal today?",
  "What's the most honest next step on this?",
  "If this goal were already achieved, what did today look like?",
  "What would make today count toward this?"
];
```

**Step 2: Find the focus_goals phase in advanceBoot() (~line 867)**

```javascript
    bootLog('sys','→ What 10% move serves this goal today?');
```

Replace with:
```javascript
    const q = NORTH_STAR_QUESTIONS[Math.floor(Math.random() * NORTH_STAR_QUESTIONS.length)];
    bootLog('sys',`→ ${q}`);
```

### 6b: Show dimension reference during scores phase

**Step 3: Find the scores phase first-pass block (~line 905)**

```javascript
    if (s.subIndex === 0) {
      bootLog('sep','──────────────────────────────────────────────────────');
      bootLog('ask','◈ DIMENSION SCORES: Rate each dimension today (1-5)');
    }
```

Replace with:
```javascript
    if (s.subIndex === 0) {
      bootLog('sep','──────────────────────────────────────────────────────');
      bootLog('ask','◈ DIMENSION SCORES: Rate each dimension today (1-5)');
      bootLog('sys','  ' + DIMS.map(d=>`${d.label}=${d.full}`).join('  ·  '));
    }
```

**Step 4: Verify**

Run `/boot`. Each north star goal should show a different randomly chosen question framing. In the scores phase, a reference line should list all 9 dimensions.

**Step 5: Commit**
```bash
git add focus-terminal/focus-terminal.html
git commit -m "feat: randomise north star prompts, add dim reference in score Q&A"
```

---

## Task 7: /backlog command with localStorage persistence

**File:** `focus-terminal/focus-terminal.html`

### 7a: Add backlog to db state

**Step 1: Find `db` initial state (~line 694)**

```javascript
let db = {
  northStarGoals: [],
  today: null,
  history: [],
  theme: 'legacy'
};
```

Replace with:
```javascript
let db = {
  northStarGoals: [],
  today: null,
  history: [],
  theme: 'legacy',
  backlog: []
};
```

**Step 2: Add migration guard in `loadDB()` (~line 704)**

Find:
```javascript
function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) db = JSON.parse(raw);
  } catch(e) {}
}
```

Replace with:
```javascript
function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) db = JSON.parse(raw);
  } catch(e) {}
  db.backlog = db.backlog || [];
}
```

### 7b: Add backlog handler functions

**Step 3: Add after `quickAdd()` function (~line 1483)**

```javascript
function handleBacklog(arg) {
  if (!arg || arg === 'list') {
    if (!db.backlog.length) { statusMsg('Backlog is empty.'); return; }
    showHelp('BACKLOG', db.backlog.map((b,i)=>`${i+1}. ${b.text}`));
    return;
  }
  if (arg === 'export') {
    exportBacklog(); return;
  }
  db.backlog.push({
    id: Date.now()+'_'+Math.random().toString(36).slice(2,6),
    text: arg,
    createdAt: new Date().toISOString()
  });
  saveDB();
  statusMsg(`Backlog: added "${arg}" (${db.backlog.length} item${db.backlog.length===1?'':'s'})`);
}

function exportBacklog() {
  if (!db.backlog.length) { statusMsg('Backlog is empty.'); return; }
  const now = new Date().toISOString().slice(0,10);
  const txt = '# FOCUS TERMINAL BACKLOG — ' + now + '\n\n'
    + db.backlog.map(b=>`- [ ] ${b.text}`).join('\n') + '\n';
  downloadBlob(txt, `focus-backlog-${now}.txt`, 'text/plain');
  statusMsg(`Exported ${db.backlog.length} backlog item${db.backlog.length===1?'':'s'}.`);
}
```

### 7c: Wire up /backlog in console handler

**Step 4: Find `handleConsoleCmd()` (~line 1438)**

After the `/add` handler:
```javascript
  if (inp.startsWith('/add ')) {
    quickAdd(inp.slice(5)); return;
  }
```

Add:
```javascript
  if (cmd === '/backlog') {
    handleBacklog(inp.slice('/backlog'.length).trim()); return;
  }
```

**Step 5: Verify**

- `/backlog` with no session → `Backlog is empty.`
- `/backlog write unit tests for auth module` → status confirms add
- `/backlog` or `/backlog list` → help overlay shows items numbered
- `/backlog export` → downloads `focus-backlog-YYYY-MM-DD.txt` with `- [ ]` lines
- Reload page → items persist

**Step 6: Commit**
```bash
git add focus-terminal/focus-terminal.html
git commit -m "feat: /backlog command with localStorage persistence and export"
```

---

## Final Verification Checklist

Open `focus-terminal.html` in browser. Confirm all of:

- [ ] Font is visibly larger (~20px base) across all panels
- [ ] ONE THING text and focus items are centered in top row
- [ ] Matrix items show `[PHY]` / `[—]` dim labels
- [ ] Balance grid: score shows `–■–––|` style scale
- [ ] Balance grid: hovering a square shows item text
- [ ] Balance grid: hovering `PHY` label shows `Physical` in custom tooltip
- [ ] `/help` opens styled overlay, ESC/click-outside closes it
- [ ] `/help` lists all commands including `/backlog` variants
- [ ] Boot sequence: north star questions vary randomly across goals
- [ ] Boot sequence: scores phase shows all dimension names as reference
- [ ] NI toggle: show/hide works on every click reliably
- [ ] `/backlog [text]` adds and persists items
- [ ] `/backlog list` shows items in overlay
- [ ] `/backlog export` downloads correctly formatted `.txt`
