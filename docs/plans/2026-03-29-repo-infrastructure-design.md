---
date: 2026-03-29
title: Repo Infrastructure Design
status: approved
---

# Repo Infrastructure Design

Three deliverables to build out shared infrastructure for the ai-utils repo.

---

## 1. Navigation Page (`index.html`)

Single terminal-web HTML file at repo root. Boot sequence on load, then drops into a live console prompt.

### Boot sequence
- Fake scan lines: `INITIALIZING AI-UTILS LAUNCHER...`, `SCANNING MODULES...`
- Apps appear one by one, each line typed out: number, name, description, category badge, initiation date, `[LAUNCH]` button
- Ends with `> SYSTEM READY. Type /help for commands.` and console row activates

### Post-boot state
- Detected app lines remain on screen as scrollable log above console
- Console prompt: `AI-UTILS>`
- Commands: `/launch <n>`, `/list`, `/help`, `/theme <name>`
- `[LAUNCH]` buttons open app in new window (`window.open`)

### App registry
Hardcoded JS array: `{ name, description, category, path, date }`. Adding a new app = one new object.

### Style
Full terminal-web CSS variable system, theme switcher, legacy amber default.

### Apps to register (at time of design)
| # | Name | Description | Category | Path | Date |
|---|------|-------------|----------|------|------|
| 1 | FOCUS TERMINAL | Personal productivity terminal with tasks, backlog, and focus sessions | terminal-web | focus-terminal/focus-terminal.html | — |
| 2 | LIFE TRACKER | Portable appointment and life event tracker | terminal-web | appt-tracker/appt-tracker.html | — |
| 3 | PORTFOLIO SIGNAL DESK | Portfolio monitoring and signal dashboard | terminal-web | portfolio-manager/portfolio-manager.html | — |
| 4 | LIVELAB MEGAWALL | Live display wall for metrics and feeds | terminal-web | work/display-wall/display-wall.html | — |

---

## 2. UI Guidelines Refinement (`docs/terminal-web.md`)

Rename and reframe `ui-guidelines.md` as a design category document.

### Changes
- Title: "Terminal Web — UI Guidelines"
- Intro: describes terminal-web as a design category within this repo, not a specific app's rules
- Add template reference at top: pointer to `docs/terminal-web-template.html`
- Remove focus-terminal-specific language throughout
- Keep all existing content: CSS variable contract, theme system, layout patterns, component patterns, interaction conventions

### New file: `docs/terminal-web-template.html`
Clean HTML shell containing:
- `#app` grid structure (30/60/10vh rows)
- Console row with prompt, input, status
- Boot overlay
- Tooltip element
- Help overlay
- Full `:root` CSS variable block with all themes
- Stub JS: `loadDB()`, `saveDB()`, `handleConsoleCmd()`, `statusMsg()`
- `STORAGE_KEY` placeholder

---

## 3. CLAUDE.md (repo root)

Lightweight LLM orientation document. Short — fits on one screen.

### Sections
1. **Vision** — bite-sized, single-file, local-first apps built via vibe coding; intentionally lightweight and flexible; many apps will be one-offs
2. **Repo structure** — directory map of apps, docs/, index.html
3. **Design categories** — one entry per category:
   - Category name
   - Apps belonging to it
   - Link to guidelines doc
   - Link to template file
   - Instruction: "to start a new terminal-web app, copy `docs/terminal-web-template.html`"
4. **One-off apps** — note that apps not fitting a category are fine; no template required, just keep them self-contained
5. **Adding a new app** — checklist: build the file, add entry to `index.html` app registry, optionally add to a category in CLAUDE.md

### Design categories at time of writing
- `terminal-web`: Focus Terminal, Life Tracker, Portfolio Signal Desk, LiveLab MegaWall

---

## File Structure After Implementation

```
ai-utils/
  index.html                          ← new nav page
  CLAUDE.md                           ← new ops/LLM guidance
  docs/
    terminal-web.md                   ← renamed + refined from ui-guidelines.md
    terminal-web-template.html        ← new template
    plans/
      2026-03-29-repo-infrastructure-design.md
  focus-terminal/
  appt-tracker/
  portfolio-manager/
  work/
  yahoo-finance-proxy/
  common/
  specs/
```

Note: `ui-guidelines.md` at root is deleted (it was already moved from `focus-terminal/docs/`); canonical location becomes `docs/terminal-web.md`.
