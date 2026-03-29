# TECHNICAL SPECIFICATION: FOCUS TERMINAL (v1.0)
# Target Architecture: Single-File HTML5 / Vanilla JavaScript
# Aesthetic: Terminal Emulator / ASCII Art / Monospace

## 1. PROJECT OVERVIEW
A high-intent, low-friction daily focus application designed to run locally in a browser. 
The app replaces traditional UI with a text-driven "Morning Boot" sequence that forces 
deep reflection on personal dimensions of health, professional leadership, and 
long-term "North Star" goals.

## 2. CORE PHILOSOPHY
- Local First: No external database; data persists in browser localStorage.
- Interactivity: One question at a time to minimize cognitive load.
- Output: A persistent ASCII dashboard used as a touchpoint throughout the day.
- Portability: Exportable daily logs to a local file system via text blob.

## 3. DATA MODEL
### 3.1 Dimensions of Health (The "Monk Manual +" Set)
1. **Physical** (The Engine)
2. **Mental** (The Clarity)
3. **Identity** (The Compass)
4. **Relational** (The Heart)
5. **Vocational** (The Mission)
6. **Financial** (The Home)
7. **Personal Growth** (The Evolution)
8. **Play** (The Vitality)
9. **Peace** (The Resolution)

### 3.2 Urgent vs Important (Eisenhower Matrix)
- Urgent vs Not Urgent
- Important vs Not Important

### 3.2 Key Data Points
- NorthStarGoals: List of long-term objectives, by "end of year X" or unbounded
- DailyIntention:
  - Day type [Work|Personal|Travel]
  - Intentions: list of macro objectives / each with dimension of health + urgent/important category + completion status
  - Energy: single free text response to "what kind of energy" for the day / by dimension of health
  - One thing: single free text response to "what one thing will matter most a year from now?"
  - The list: list of other things that come to mind to do, etc. / each with dimension of health + urgent/important category + completion status
- History: Array of DailyIntention objects stored in localStorage.

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Phase 1: The Morning Boot (Input Mode)
- The app shall display questions sequentially.
- Input must be handled via a single text command line at the bottom of the screen.
- Allow skips by command '/skip' or just hitting enter without asking, but require at least one "One Thing" question to continue
- Move on to the next Q&A section with '/next'
- Allow quick categorization by adding to the end of the input e.g. '/physical' or '/phy' for health and '+u' for urgent, '+i' for important
  - Confirm category in follow-up question (or give a second opportunity to input)
- Sequence:
    1. Framing Question
	  - Ask whether its Work day, Personal day, or Travel day, use defaults by M-F and Sa-Su
    2. "Focus" Questions
      - For each North Star Goal, ask "What 10% move serves this today?" or a variant of that
	  - Ask a variant of a general question about e.g. "What is a hard thing you would feel good if you accomplished today?"
	3. "Energy" Question
	  - Ask a single energy question based on what type of day it is
	4. "List" Questions
	  - Ask "What else would you like to do today?" or a variant to generate additional list items (purpose is braindump)
    5. Ask: "Score each Dimension (1-5)" -> Sequential prompts for each of the health dimensions.
    6. Final prompt always shown: "What is the ONE THING that matters most a year from now?"
	7. If there are more than 2 responses to the "Focus" questions, have the user select the most important (show numbered list ask them to pick two numbers from the list)

### 4.2 Phase 2: The Dashboard (Display Mode)
- Render an ASCII Dashboard
- Top row (about 0.3 of the screen)
	- Full width row devoted to the "ONE THING" response and 1-2 "FOCUS" responses
- Middle row (about 0.6 of the screen)
	- Left two-thirds: visualization of the Eisenhower Matrix. All daily responses in the correct quadrant, organizing the todo and focus list, (NU/NI) list revealed only on request
    - Right third: implement a "Balance Grid" visualization: [■■■□□]. To the right of the 1-5 value scores, Continue with a unit square ■ depiction of recent attention for types in the following order: (i) today's items (focus + list + one-thing) in that category that are important, (ii) items in past week that are important, (iii) today's items that are not important (different color), (iv) items in past week that are not important
- Bottom row (about 0.1 of the screen) console for input

### 4.3 Command Console (Interactive Mode)
- /next or /clear: Archives current day to history, clears state
- /start or /boot: Starts morning boot sequence
- /export: Generates a .txt file blob of the entire history for local backup
- /edit: Returns to Phase 1 to modify today's intentions

### 4.4 Interactive elements
- tooltips over any item show details (time of entry, question, response, categories)
- click item shows a popup to edit details (popup also has ascii look and feel, navigate with cursors, space to select, etc.)

## 5. TECHNICAL STACK
- Frontend: HTML5, CSS3 (CSS Grid for layout, Monospace fonts).
- Logic: Vanilla JavaScript (ES6+).
- Storage: Web Storage API (localStorage).
- Persistence Strategy: JSON.stringify() of the data object into a single "focus_terminal_db" key.

## 6. VISUAL DESIGN SPEC
The app shall support dynamic theme swapping via a `/theme [name]` command. Styles are managed via CSS Variables in a `:root` block.

| Feature | **Legacy** | **Solarized Dark** | **Paper White** |
| :--- | :--- | :--- | :--- |
| **Vibes** | Mission Critical | Deep Work Flow | Reflective Journal |
| **Alias** | `legacy` | `solar` | `monk` |
| **Background** | `#121212` (Off-black) | `#002b36` (Deep Navy) | `#f5f5f5` (Paper) |
| **Foreground** | `#ffb000` (Amber) | `#839496` (Grey-Teal) | `#2a2a2a` (Charcoal) |
| **Accent** | `#ff0000` (Red) | `#b58900` (Yellow) | `#000000` (Bold) |
| **Borders** | `═`, `║`, `╔`, `╗` | `█`, `▀`, `▄` | `+`, `-`, `.` |
| **Font** | 'Cradleville' / Courier | 'Fira Code' | 'Source Code Pro' |

Ideas for "vibes" for additional themes: Deep Space, Cybernetic, Brutalist, Monochrome, Synthwave, Obsidian, Blueprint, Forest, DOS, WordPerfect5.1

## 7. NEXT STEPS
- [ ] Design the full data model
- [ ] Implement the question-state machine to handle sequential prompting.
- [ ] Design/build the ASCII page layout
- [ ] Design/build the Eisenhower Matrix generator
- [ ] Design/build the ASCII bar chart generator
- [ ] Build the command terminal
- [ ] Create the "Next Day" archival logic.