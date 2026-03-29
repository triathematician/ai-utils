# Soft Utility — UI Guidelines

Guidelines for building **soft-utility** apps in this repo. Soft-utility is a design category: clean, approachable, light-themed, local-first, single-file utility apps built with React. See `docs/soft-utility-template.html` for the copy-me starting point.

---

## Philosophy

- **Local-first, no server.** All state in `localStorage`. Apps work offline and persist without accounts.
- **Single HTML file.** No build step; React, Tailwind, Babel, and Lucide are loaded from CDN. Ship by copying one file.
- **Clean and approachable.** Sans-serif fonts, light backgrounds, generous white space, and large border radii. The UI should feel friendly and usable, not like a developer tool.
- **YAGNI.** Features earn their place. Use modals for forms and cards for data — keep the layout simple.

---

## Tech Stack

Every soft-utility app loads the same five CDN dependencies in the `<head>`:

| Dependency | Source |
|---|---|
| React 18 | `https://unpkg.com/react@18/umd/react.production.min.js` |
| ReactDOM 18 | `https://unpkg.com/react-dom@18/umd/react-dom.production.min.js` |
| Babel Standalone | `https://unpkg.com/@babel/standalone/babel.min.js` |
| Tailwind CSS | `https://cdn.tailwindcss.com` |
| Lucide Icons | `https://unpkg.com/lucide@latest/dist/umd/lucide.js` |

Google Fonts are imported via `@import` in `<style>`:

- **Inter** — primary sans-serif (weights 300, 400, 500, 600, 700)
- **JetBrains Mono** — secondary monospace (weights 400, 500)

Tailwind is configured to extend the default font families:

```js
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
}
```

All app logic goes in a single `<script type="text/babel">` block.

---

## Color System

Soft-utility apps use a fixed light color scheme — not a theme system. The body background is always `#f8f9fa` (near-white gray) and the primary text is always `#1a1a1a` (near-black). Tailwind semantic color utilities provide consistent states:

| Role | Value |
|---|---|
| Page background | `bg-[#f8f9fa]` |
| Primary text | `text-[#1a1a1a]` |
| Card surface | `bg-white` |
| Card border | `border border-gray-100` |
| Secondary / muted text | `text-gray-500` or `text-gray-400` |
| Section labels | `text-gray-400` |
| Destructive / error | `text-red-600`, `bg-red-50`, `border-red-100` |
| Success / positive | `text-green-600`, `bg-green-50` |
| Primary action button | `bg-[#1a1a1a] text-white` |

### Category / tag colors

Use Tailwind's `bg-{color}-100 text-{color}-700` pattern for type badges and per-category chips. Choose from: `blue`, `red`, `green`, `orange`, `purple`, `teal`, `gray`. Each combination should map to a single semantic category and remain consistent across the app.

---

## Typography

- **Primary font:** Inter. Applied to `body` with an explicit `font-family` rule and in the Tailwind `font-sans` extension.
- **Monospace font:** JetBrains Mono. Use the `font-mono` class for dates, IDs, and other technical values.
- **Antialiasing:** Set `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale` on `body`.

### Text scale patterns

| Use | Classes |
|---|---|
| Page title | `text-4xl font-light tracking-tight` |
| Page subtitle | `text-sm text-gray-500 mt-1 font-medium opacity-60` |
| Section label | `text-xs font-bold text-gray-400 uppercase tracking-widest` |
| Card primary label | `font-bold text-sm` |
| Card secondary text | `text-xs text-gray-500` |
| Technical / date value | `text-xs font-mono bg-gray-50 px-3 py-0.5 rounded-lg text-gray-400` |

---

## Layout Patterns

### Page structure

```
┌─────────────────────────────────┐
│  <header>  title + icon actions │
├─────────────────────────────────┤
│  summary strip (optional)       │
├─────────────────────────────────┤
│  search bar + filter + CTA      │
├─────────────────────────────────┤
│  section label                  │
│  item cards (scrollable list)   │
└─────────────────────────────────┘
```

- Outer wrapper: `min-h-screen p-4 md:p-8`
- Inner container: `max-w-3xl mx-auto` (single-column, centered)
- Sections separated with `mb-10` or `mb-12` vertical margin

### Header

```jsx
<header className="flex justify-between items-center mb-10">
  <div>
    <h1 className="text-4xl font-light tracking-tight">App Name</h1>
    <p className="text-sm text-gray-500 mt-1 font-medium opacity-60">Subtitle</p>
  </div>
  <div className="flex gap-1">
    {/* icon action buttons */}
  </div>
</header>
```

### Section label

```jsx
<h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-4">
  Section Name
</h2>
```

---

## Component Patterns

### Cards

Cards are the primary content container. Every card uses the same base classes:

```jsx
<div className="group flex items-center gap-4 bg-white px-5 py-1.5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all w-full">
  {/* icon badge | primary label | secondary text | actions */}
</div>
```

- Hover: `hover:shadow-md transition-all`
- Add `group` to the card wrapper so destructive actions can use `opacity-0 group-hover:opacity-100`

### Icon badge

Pair a category icon with its semantic color using the Tailwind badge pattern:

```jsx
<div className={`p-1.5 rounded-xl ${typeInfo.color}`}>
  <Icon name={typeInfo.icon} size={18} />
</div>
```

### Icon component

Lucide icons must be instantiated via a helper component that calls `lucide.createIcons()`. Never use raw `<i data-lucide>` tags inside JSX — the React render cycle conflicts with Lucide's DOM scanning.

```jsx
const Icon = ({ name, size = 20, className = "" }) => {
  const iconRef = useRef(null);
  useEffect(() => {
    if (iconRef.current && window.lucide) {
      const el = document.createElement('i');
      el.setAttribute('data-lucide', name);
      iconRef.current.innerHTML = '';
      iconRef.current.appendChild(el);
      window.lucide.createIcons({
        attrs: { 'stroke-width': 2, stroke: 'currentColor', width: size, height: size },
      });
    }
  }, [name, size, className]);
  return (
    <span ref={iconRef} className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }} />
  );
};
```

### Buttons

| Type | Classes |
|---|---|
| Primary CTA | `bg-[#1a1a1a] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all font-bold` |
| Icon button (header) | `p-2.5 rounded-full hover:bg-white hover:shadow-sm text-gray-400 hover:text-gray-900` |
| Full-width form submit | `w-full py-4 bg-black text-white rounded-2xl font-bold text-lg` |
| Toggle switch (on) | `w-12 h-6 rounded-full relative transition-all bg-black` |
| Toggle switch (off) | `w-12 h-6 rounded-full relative transition-all bg-gray-300` |

### Search and filter bar

```jsx
<div className="flex flex-col md:flex-row gap-3 mb-12">
  <div className="relative flex-1">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      <Icon name="search" size={18} />
    </span>
    <input
      type="text" placeholder="Search..."
      className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 outline-none"
    />
  </div>
  {/* optional: <select> filter + CTA <button> */}
</div>
```

### Modal

Modals use a blurred backdrop and a generously rounded content card:

```jsx
<div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 relative">
    <button onClick={close} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900">
      <Icon name="x" size={24} />
    </button>
    <h2 className="text-3xl font-light mb-8">Title</h2>
    {/* form or content */}
  </div>
</div>
```

- Close button: absolute top-right `x` icon
- Form width: `max-w-md`; settings / list views: `max-w-lg`
- Add `max-h-[90vh] overflow-y-auto` when content may be tall
- Form inputs: `w-full p-4 bg-gray-50 rounded-2xl outline-none font-medium`
- Textareas: add `min-h-[120px] resize-none`

### Empty state

```jsx
<div className="w-full text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200 text-gray-400">
  No items found
</div>
```

---

## Data and State Management

- Use `useState` for all UI state: form fields, modal visibility, filter values.
- Use a `useEffect` with an empty dependency array to load from `localStorage` on mount.
- Use a `useEffect` watching your data state arrays to persist on every change.
- Define a single `APP_NAME` constant (lowercase-hyphenated) and derive `localStorage` keys from it (e.g. `` `${APP_NAME}-items` ``). This keeps the export filename and storage keys consistent.
- Generate IDs with `Date.now().toString()`.
- Export: serialize to JSON, download via `<a>` element with `URL.createObjectURL`.
- Import: read via `<input type="file">` and a `FileReader`.

---

## Building a New App in This Ecosystem

Checklist for starting a new soft-utility app:

- [ ] Copy the HTML shell from `docs/soft-utility-template.html`
- [ ] Load all five CDN dependencies (React 18, ReactDOM 18, Babel, Tailwind, Lucide)
- [ ] Configure Tailwind to extend Inter and JetBrains Mono
- [ ] Import Inter and JetBrains Mono from Google Fonts via `@import`
- [ ] Apply `-webkit-font-smoothing: antialiased` to `body`
- [ ] Set `bg-[#f8f9fa] text-[#1a1a1a] antialiased` on `<body>`
- [ ] Use a centered `max-w-3xl mx-auto` single-column layout
- [ ] Use the `Icon` helper component for all Lucide icons — never raw `<i data-lucide>`
- [ ] Use `bg-white rounded-2xl shadow-sm border border-gray-100` for all cards
- [ ] Use modal overlay (`backdrop-blur-md` + `rounded-[40px]` inner) for add/edit forms
- [ ] Use `bg-[#1a1a1a] text-white rounded-2xl` for primary action buttons
- [ ] Use `text-xs font-bold text-gray-400 uppercase tracking-widest` for section labels
- [ ] Show destructive actions (delete) on group-hover only — `opacity-0 group-hover:opacity-100`
- [ ] Persist state to `localStorage`; define `APP_NAME` once and derive all storage keys from it
- [ ] Implement JSON export (download) and import (file input)
