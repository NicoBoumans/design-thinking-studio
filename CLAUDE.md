# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Design Thinking Studio — a single-page web app for tracking design thinking projects, building/facilitating workshops, and training the methodology. Vanilla HTML/CSS/JS, **no dependencies, no build step, no package.json**.

## Commands

```bash
# Run locally
python3 -m http.server 8000        # then open http://localhost:8000

# Syntax check (no test framework; there is a jsdom smoke test approach in git history)
node --check js/app.js && node --check js/data.js

# Deploy — GitHub Pages serves the main branch directly, live ~1 min after push
git add -A && git commit -m "..." && git push
```

Live site: https://nicoboumans.github.io/design-thinking-studio/

## Architecture

Three scripts loaded as plain globals in order (`index.html` → `js/data.js` → `js/app.js`); there are no modules or imports.

- **`js/data.js`** — all static content: `PHASES` (the 5 DT phases with colors and default checklists), `METHODS` (workshop method library), `MODULES` (training lessons + quizzes), plus `*_BY_ID`/`*_BY_KEY` lookup maps. Adding a method or training module means editing only this file — the UI picks it up everywhere (library, pickers, phase suggestions, dashboards) automatically.
- **`js/app.js`** — everything else:
  - **State**: one `state` object (`projects`, `workshops`, `training`), persisted to localStorage under key `dts-state-v1` via `save()` after every mutation. No backend; data is per-browser. Settings page offers JSON export/import.
  - **Routing**: hash-based. The `routes` array maps regexes to render functions; each render function rebuilds the whole `#view` via `innerHTML` template strings. After any state change, views re-render fully — there is no virtual DOM or partial update.
  - **Events**: three global delegated listeners on `document` (click → `data-action`, change → `data-action-change`, input → `data-action-input`) with a switch over action names. New interactions follow this pattern; do not attach per-element listeners (they die on re-render). Exception: the project-notes textarea binds its own blur handler after render.
  - **Escaping**: all user-entered content must go through `esc()` before being interpolated into templates (lesson `content` in data.js is trusted HTML and is deliberately not escaped).
  - The facilitation timer (`timer` object + `stopTimer()`) is module-level state, reset on every route change.

## Conventions

- Quiz pass threshold is 0.7, hardcoded in `trainingProgress()`, `moduleProgress()`, and the quiz-submit handler — change all three together.
- Phase colors/icons live only in `PHASES`; always derive styling from there (`PHASE_BY_KEY[key].color`), never hardcode.
- Keep it dependency-free: the app must keep working by opening `index.html` or any static file server.
