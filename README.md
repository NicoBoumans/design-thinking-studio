# 💡 Design Thinking Studio

A one-stop shop for practising design thinking as a team: track projects through
the five phases, build and facilitate workshops, and train the methodology.

## Run it

No installation or build step needed — it's plain HTML/CSS/JS. From this folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

(Opening `index.html` directly also works in most browsers, but serving it over
HTTP is more reliable for localStorage.)

## What's inside

| Section | What it does |
|---|---|
| **Dashboard** | Overview of active projects, upcoming workshops and training progress |
| **Projects** | Track each challenge through Empathize → Define → Ideate → Prototype → Test, with per-phase checklists and notes |
| **Workshops** | Build a timeboxed agenda from the method library, then run it in live facilitation mode with countdown timers and step-by-step instructions |
| **Method library** | 20 proven techniques (interviews, empathy maps, Crazy 8s, dot voting, Wizard of Oz…) with durations, materials and steps |
| **Training** | 6 modules with lessons and knowledge-check quizzes, from the basics to facilitation skills |
| **Settings & data** | Export/import all data as JSON — use this to back up or share with teammates |

## Data & sharing

All data is stored in the browser's localStorage — nothing leaves your machine.
To share with the team: **Settings & data → Export**, send the JSON file, and
teammates import it on their side.

## Tech

Vanilla HTML/CSS/JS, no dependencies, no build step.

- `index.html` — shell and navigation
- `js/data.js` — phases, the method library and all training content (edit this to add methods or lessons)
- `js/app.js` — state, routing and views
- `css/styles.css` — styling
