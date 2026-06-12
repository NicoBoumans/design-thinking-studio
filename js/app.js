/* ============================================================
   Design Thinking Studio — app logic
   State in localStorage; hash routing; views render into #view.
   ============================================================ */

/* ---------------- state ---------------- */

const STORE_KEY = "dts-state-v1";

const defaultState = () => ({
  projects: [],
  workshops: [],
  training: { lessons: {}, quizzes: {} }, // lessons: {modId:[idx]}, quizzes: {modId:{score,total}}
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { console.warn("state load failed", e); }
  return defaultState();
}
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

const uid = () => Math.random().toString(36).slice(2, 10);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function newProject(name, description, owner) {
  const phases = {};
  PHASES.forEach(p => {
    phases[p.key] = {
      notes: "",
      checklist: p.checklist.map(text => ({ id: uid(), text, done: false })),
    };
  });
  return {
    id: uid(), name, description, owner,
    createdAt: new Date().toISOString().slice(0, 10),
    currentPhase: 0, status: "active", phases,
  };
}

function projectProgress(prj) {
  let total = 0, done = 0;
  PHASES.forEach(p => {
    prj.phases[p.key].checklist.forEach(c => { total++; if (c.done) done++; });
  });
  return total ? Math.round((done / total) * 100) : 0;
}

function trainingProgress() {
  let total = 0, done = 0;
  MODULES.forEach(m => {
    total += m.lessons.length + 1; // +1 for quiz
    done += (state.training.lessons[m.id] || []).length;
    const q = state.training.quizzes[m.id];
    if (q && q.score / q.total >= 0.7) done++;
  });
  return total ? Math.round((done / total) * 100) : 0;
}

function moduleProgress(mod) {
  const lessonsDone = (state.training.lessons[mod.id] || []).length;
  const q = state.training.quizzes[mod.id];
  const quizDone = q && q.score / q.total >= 0.7 ? 1 : 0;
  return Math.round(((lessonsDone + quizDone) / (mod.lessons.length + 1)) * 100);
}

/* ---------------- toast & modal ---------------- */

let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

function openModal(html) {
  closeModal();
  const wrap = document.createElement("div");
  wrap.className = "modal-backdrop";
  wrap.id = "modal";
  wrap.innerHTML = `<div class="modal">${html}</div>`;
  wrap.addEventListener("click", e => { if (e.target === wrap) closeModal(); });
  document.body.appendChild(wrap);
  const first = wrap.querySelector("input, select, textarea");
  if (first) first.focus();
}
function closeModal() { document.getElementById("modal")?.remove(); }

/* ---------------- router ---------------- */

const view = () => document.getElementById("view");

const routes = [
  { re: /^#?\/?$/, fn: renderDashboard, nav: "dashboard" },
  { re: /^#\/projects$/, fn: renderProjects, nav: "projects" },
  { re: /^#\/project\/(\w+)$/, fn: m => renderProject(m[1]), nav: "projects" },
  { re: /^#\/workshops$/, fn: renderWorkshops, nav: "workshops" },
  { re: /^#\/workshop\/(\w+)$/, fn: m => renderWorkshop(m[1]), nav: "workshops" },
  { re: /^#\/facilitate\/(\w+)$/, fn: m => renderFacilitate(m[1]), nav: "workshops" },
  { re: /^#\/methods$/, fn: renderMethods, nav: "methods" },
  { re: /^#\/training$/, fn: renderTraining, nav: "training" },
  { re: /^#\/module\/([\w-]+)$/, fn: m => renderModule(m[1]), nav: "training" },
  { re: /^#\/settings$/, fn: renderSettings, nav: "settings" },
];

function route() {
  stopTimer();
  closeModal();
  const hash = location.hash || "#/";
  for (const r of routes) {
    const m = hash.match(r.re);
    if (m) {
      document.querySelectorAll(".nav-link").forEach(a =>
        a.classList.toggle("active", a.dataset.nav === r.nav));
      r.fn(m);
      window.scrollTo(0, 0);
      return;
    }
  }
  view().innerHTML = `<div class="empty"><span class="big-ico">🤔</span>Page not found. <a href="#/">Back to dashboard</a></div>`;
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);

/* ---------------- dashboard ---------------- */

function renderDashboard() {
  const active = state.projects.filter(p => p.status === "active");
  const upcoming = state.workshops
    .filter(w => w.status !== "completed")
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

  const projCards = active.length
    ? active.map(p => {
        const ph = PHASES[p.currentPhase];
        return `<div class="card clickable" onclick="location.hash='#/project/${p.id}'">
          <div class="row between">
            <h3>${esc(p.name)}</h3>
            <span class="chip" style="background:${ph.color}1a;color:${ph.color}">${ph.icon} ${ph.name}</span>
          </div>
          <p class="muted">${esc(p.description || "")}</p>
          <div class="progress"><div style="width:${projectProgress(p)}%"></div></div>
          <div class="muted" style="margin-top:6px">${projectProgress(p)}% of activities complete</div>
        </div>`;
      }).join("")
    : `<div class="card empty"><span class="big-ico">📁</span>No active projects yet.<br><br>
       <button class="btn" data-action="new-project">+ Start your first project</button></div>`;

  const wsRows = upcoming.slice(0, 4).map(w => `
    <div class="list-row clickable" onclick="location.hash='#/workshop/${w.id}'">
      <div class="grow">
        <div class="title">${esc(w.title)}</div>
        <div class="meta">${w.date ? esc(w.date) : "no date"} · ${w.agenda.length} activities · ${agendaTotal(w)} min</div>
      </div>
      <span class="chip">${w.status === "completed" ? "done" : "planned"}</span>
    </div>`).join("");

  view().innerHTML = `
    <div class="page-head">
      <div><h1>Dashboard</h1><p class="sub">Your design thinking practice at a glance.</p></div>
      <div class="row">
        <button class="btn secondary" data-action="new-workshop">+ Workshop</button>
        <button class="btn" data-action="new-project">+ Project</button>
      </div>
    </div>

    <div class="grid cols-4 mb">
      <div class="card stat"><span class="num">${active.length}</span><span class="lbl">Active projects</span></div>
      <div class="card stat"><span class="num">${upcoming.length}</span><span class="lbl">Workshops planned</span></div>
      <div class="card stat"><span class="num">${METHODS.length}</span><span class="lbl">Methods in library</span></div>
      <div class="card stat"><span class="num">${trainingProgress()}%</span><span class="lbl">Training complete</span></div>
    </div>

    <h2>Projects</h2>
    <div class="grid cols-2 mb">${projCards}</div>

    <div class="grid cols-2">
      <div>
        <h2>Upcoming workshops</h2>
        <div class="card flush">${wsRows || `<div class="empty">No workshops planned. <a href="#/workshops">Plan one →</a></div>`}</div>
      </div>
      <div>
        <h2>Keep learning</h2>
        <div class="card">
          <div class="progress mb"><div style="width:${trainingProgress()}%"></div></div>
          <p class="muted">Work through the training modules to build a shared foundation in your team.</p>
          <a class="btn secondary" href="#/training">Go to training →</a>
        </div>
      </div>
    </div>`;
}

/* ---------------- projects ---------------- */

function renderProjects() {
  const rows = state.projects.map(p => {
    const ph = PHASES[p.currentPhase];
    return `<div class="list-row clickable" onclick="location.hash='#/project/${p.id}'">
      <span class="phase-dot" style="background:${ph.color}"></span>
      <div class="grow">
        <div class="title">${esc(p.name)} ${p.status === "completed" ? "✅" : ""}</div>
        <div class="meta">${esc(p.owner || "no owner")} · started ${esc(p.createdAt)} · phase: ${ph.name}</div>
      </div>
      <div style="width:130px"><div class="progress"><div style="width:${projectProgress(p)}%"></div></div></div>
      <span class="muted">${projectProgress(p)}%</span>
    </div>`;
  }).join("");

  view().innerHTML = `
    <div class="page-head">
      <div><h1>Projects</h1><p class="sub">Track each challenge through the five phases.</p></div>
      <button class="btn" data-action="new-project">+ New project</button>
    </div>
    <div class="card flush">
      ${rows || `<div class="empty"><span class="big-ico">📁</span>No projects yet — create your first design thinking project.</div>`}
    </div>`;
}

function renderProject(id) {
  const p = state.projects.find(x => x.id === id);
  if (!p) { view().innerHTML = `<div class="empty">Project not found. <a href="#/projects">Back</a></div>`; return; }

  const steps = PHASES.map((ph, i) => `
    <div class="step ${i === p.currentPhase ? "current" : ""} ${i < p.currentPhase ? "done" : ""}"
         style="--step-color:${ph.color}" data-action="set-phase" data-id="${p.id}" data-phase="${i}"
         title="${esc(ph.tagline)}">
      <span class="ico">${ph.icon}</span>${ph.name}
    </div>`).join("");

  const ph = PHASES[p.currentPhase];
  const phData = p.phases[ph.key];

  const checks = phData.checklist.map(c => `
    <div class="check-item ${c.done ? "done" : ""}">
      <input type="checkbox" ${c.done ? "checked" : ""} data-action="toggle-check" data-id="${p.id}" data-check="${c.id}">
      <span class="txt">${esc(c.text)}</span>
      <button class="del" title="Remove" data-action="del-check" data-id="${p.id}" data-check="${c.id}">✕</button>
    </div>`).join("");

  const phaseMethods = METHODS.filter(m => m.phase === ph.key)
    .map(m => `<span class="chip outline" data-action="show-method" data-method="${m.id}">${esc(m.name)}</span>`).join(" ");

  view().innerHTML = `
    <div class="page-head">
      <div>
        <p class="muted"><a href="#/projects">← Projects</a></p>
        <h1>${esc(p.name)}</h1>
        <p class="sub">${esc(p.description || "")} ${p.owner ? "· owned by " + esc(p.owner) : ""}</p>
      </div>
      <div class="row">
        <button class="btn secondary" data-action="toggle-project-status" data-id="${p.id}">
          ${p.status === "completed" ? "Reopen project" : "Mark completed"}</button>
        <button class="btn danger" data-action="del-project" data-id="${p.id}">Delete</button>
      </div>
    </div>

    <div class="stepper">${steps}</div>

    <div class="grid cols-2">
      <div class="card">
        <div class="row between">
          <h3>${ph.icon} ${ph.name} — activities</h3>
          <span class="muted">${phData.checklist.filter(c => c.done).length}/${phData.checklist.length}</span>
        </div>
        <p class="muted">${esc(ph.tagline)}</p>
        <div>${checks || `<div class="muted">No activities.</div>`}</div>
        <div class="row mt">
          <input type="text" id="new-check" placeholder="Add an activity…" style="flex:1"
                 onkeydown="if(event.key==='Enter')document.getElementById('add-check-btn').click()">
          <button class="btn small" id="add-check-btn" data-action="add-check" data-id="${p.id}">Add</button>
        </div>
      </div>

      <div>
        <div class="card mb">
          <h3>📝 Notes for ${ph.name}</h3>
          <textarea id="phase-notes" placeholder="Insights, decisions, links, quotes…"
            data-action-blur="save-notes" data-id="${p.id}">${esc(phData.notes)}</textarea>
          <div class="muted" style="margin-top:6px">Saved automatically when you click away.</div>
        </div>
        <div class="card">
          <h3>🧰 Suggested methods for this phase</h3>
          <div class="row">${phaseMethods}</div>
        </div>
      </div>
    </div>`;

  document.getElementById("phase-notes").addEventListener("blur", e => {
    p.phases[ph.key].notes = e.target.value;
    save(); toast("Notes saved");
  });
}

/* ---------------- workshops ---------------- */

function agendaTotal(w) { return w.agenda.reduce((s, a) => s + (a.duration || 0), 0); }

function renderWorkshops() {
  const rows = [...state.workshops]
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"))
    .map(w => `
    <div class="list-row clickable" onclick="location.hash='#/workshop/${w.id}'">
      <div class="grow">
        <div class="title">${esc(w.title)} ${w.status === "completed" ? "✅" : ""}</div>
        <div class="meta">${w.date ? esc(w.date) : "no date"} · ${w.agenda.length} activities · ${agendaTotal(w)} min
          ${w.projectId ? " · project: " + esc(state.projects.find(p => p.id === w.projectId)?.name || "?") : ""}</div>
      </div>
      <span class="chip">${w.status === "completed" ? "done" : "planned"}</span>
    </div>`).join("");

  view().innerHTML = `
    <div class="page-head">
      <div><h1>Workshops</h1><p class="sub">Build an agenda from the method library, then run it with live timers.</p></div>
      <button class="btn" data-action="new-workshop">+ New workshop</button>
    </div>
    <div class="card flush">
      ${rows || `<div class="empty"><span class="big-ico">🎤</span>No workshops yet — plan your first session.</div>`}
    </div>`;
}

function renderWorkshop(id) {
  const w = state.workshops.find(x => x.id === id);
  if (!w) { view().innerHTML = `<div class="empty">Workshop not found. <a href="#/workshops">Back</a></div>`; return; }

  const items = w.agenda.map((a, i) => {
    const m = METHOD_BY_ID[a.methodId];
    return `<div class="agenda-item">
      <span class="ord">${i + 1}</span>
      <div class="grow" style="flex:1">
        <strong>${esc(m?.name || "Unknown")}</strong>
        <span class="chip" style="margin-left:6px;background:${PHASE_BY_KEY[m?.phase]?.color}1a;color:${PHASE_BY_KEY[m?.phase]?.color}">${PHASE_BY_KEY[m?.phase]?.name || ""}</span>
        <div class="muted">${esc(m?.summary || "")}</div>
      </div>
      <input class="dur" type="number" min="1" value="${a.duration}" title="minutes"
             data-action-change="agenda-dur" data-id="${w.id}" data-idx="${i}"> <span class="muted">min</span>
      <button class="mv" data-action="agenda-up" data-id="${w.id}" data-idx="${i}" ${i === 0 ? "disabled" : ""}>↑</button>
      <button class="mv" data-action="agenda-down" data-id="${w.id}" data-idx="${i}" ${i === w.agenda.length - 1 ? "disabled" : ""}>↓</button>
      <button class="mv" data-action="agenda-del" data-id="${w.id}" data-idx="${i}">✕</button>
    </div>`;
  }).join("");

  const projOpts = state.projects.map(p =>
    `<option value="${p.id}" ${w.projectId === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("");

  view().innerHTML = `
    <div class="page-head">
      <div>
        <p class="muted"><a href="#/workshops">← Workshops</a></p>
        <h1>${esc(w.title)}</h1>
        <p class="sub">${w.agenda.length} activities · total ${agendaTotal(w)} minutes</p>
      </div>
      <div class="row">
        <button class="btn danger" data-action="del-workshop" data-id="${w.id}">Delete</button>
        <button class="btn big" data-action="start-facilitation" data-id="${w.id}" ${w.agenda.length ? "" : "disabled"}>▶ Start facilitation</button>
      </div>
    </div>

    <div class="grid cols-2 mb">
      <div class="card">
        <label class="fld">Date</label>
        <input type="date" value="${esc(w.date || "")}" data-action-change="ws-date" data-id="${w.id}">
      </div>
      <div class="card">
        <label class="fld">Linked project (optional)</label>
        <select data-action-change="ws-project" data-id="${w.id}">
          <option value="">— none —</option>${projOpts}
        </select>
      </div>
    </div>

    <div class="row between mb">
      <h2 style="margin:0">Agenda</h2>
      <button class="btn secondary" data-action="open-method-picker" data-id="${w.id}">+ Add activity</button>
    </div>
    ${items || `<div class="card empty"><span class="big-ico">🧩</span>Empty agenda — add activities from the method library.<br><br>
      <button class="btn" data-action="open-method-picker" data-id="${w.id}">+ Add first activity</button></div>`}`;
}

/* ---------------- facilitation mode ---------------- */

let timer = { interval: null, remaining: 0, running: false };
function stopTimer() { if (timer.interval) clearInterval(timer.interval); timer = { interval: null, remaining: 0, running: false }; }

function renderFacilitate(id) {
  const w = state.workshops.find(x => x.id === id);
  if (!w || !w.agenda.length) { view().innerHTML = `<div class="empty">Workshop not found or empty. <a href="#/workshops">Back</a></div>`; return; }
  w._pos = Math.min(w._pos || 0, w.agenda.length - 1);
  drawFacilitate(w);
}

function drawFacilitate(w) {
  stopTimer();
  const pos = w._pos || 0;
  const a = w.agenda[pos];
  const m = METHOD_BY_ID[a.methodId];
  const ph = PHASE_BY_KEY[m.phase];
  timer.remaining = a.duration * 60;

  const agendaList = w.agenda.map((it, i) => {
    const im = METHOD_BY_ID[it.methodId];
    return `<div class="item ${i === pos ? "now" : i < pos ? "past" : ""}" data-action="fac-jump" data-id="${w.id}" data-idx="${i}">
      <span>${i + 1}. ${esc(im?.name)}</span><span class="muted">${it.duration}m</span>
    </div>`;
  }).join("");

  view().innerHTML = `
    <div class="page-head">
      <div>
        <p class="muted"><a href="#/workshop/${w.id}">← Back to agenda</a></p>
        <h1>🎤 ${esc(w.title)}</h1>
        <p class="sub">Activity ${pos + 1} of ${w.agenda.length}</p>
      </div>
      <button class="btn secondary" data-action="finish-workshop" data-id="${w.id}">Finish workshop</button>
    </div>

    <div class="facilitate">
      <div class="card fac-agenda"><h3>Agenda</h3>${agendaList}</div>

      <div>
        <div class="card timer-box mb">
          <div class="row" style="justify-content:center">
            <span class="chip" style="background:${ph.color}1a;color:${ph.color}">${ph.icon} ${ph.name}</span>
          </div>
          <h2 style="margin:8px 0 0">${esc(m.name)}</h2>
          <div class="timer-display" id="timer">${fmtTime(timer.remaining)}</div>
          <div class="timer-controls">
            <button class="btn big" id="timer-toggle" data-action="timer-toggle">▶ Start</button>
            <button class="btn secondary" data-action="timer-reset">Reset</button>
            <button class="btn secondary" data-action="fac-prev" data-id="${w.id}" ${pos === 0 ? "disabled" : ""}>← Previous</button>
            <button class="btn secondary" data-action="fac-next" data-id="${w.id}" ${pos === w.agenda.length - 1 ? "disabled" : ""}>Next →</button>
          </div>
        </div>

        <div class="card">
          <h3>How to run it</h3>
          <p class="muted">${esc(m.summary)} · ${esc(m.people)} people · ${esc(m.materials)}</p>
          <ol class="method-steps">${m.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
        </div>
      </div>
    </div>`;
}

function fmtTime(sec) {
  const neg = sec < 0;
  sec = Math.abs(sec);
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${neg ? "-" : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function tick() {
  timer.remaining--;
  const el = document.getElementById("timer");
  if (!el) { stopTimer(); return; }
  el.textContent = fmtTime(timer.remaining);
  el.classList.toggle("warning", timer.remaining <= 60 && timer.remaining > 0);
  el.classList.toggle("overtime", timer.remaining <= 0);
  if (timer.remaining === 0) beep();
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.3, 0.6].forEach(t => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; g.gain.value = 0.15;
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.2);
    });
  } catch (e) { /* audio unavailable */ }
}

/* ---------------- methods library ---------------- */

let methodFilter = { phase: "", q: "" };

function renderMethods() {
  const chips = ["", ...PHASES.map(p => p.key)].map(k => {
    const label = k ? `${PHASE_BY_KEY[k].icon} ${PHASE_BY_KEY[k].name}` : "All";
    return `<span class="chip outline ${methodFilter.phase === k ? "active" : ""}" data-action="filter-phase" data-phase="${k}">${label}</span>`;
  }).join(" ");

  const list = METHODS.filter(m =>
    (!methodFilter.phase || m.phase === methodFilter.phase) &&
    (!methodFilter.q || (m.name + m.summary).toLowerCase().includes(methodFilter.q)));

  const cards = list.map(m => {
    const ph = PHASE_BY_KEY[m.phase];
    return `<div class="card clickable" data-action="show-method" data-method="${m.id}">
      <div class="row between">
        <h3 style="margin:0">${esc(m.name)}</h3>
        <span class="chip" style="background:${ph.color}1a;color:${ph.color}">${ph.name}</span>
      </div>
      <p class="muted" style="margin:8px 0 6px">${esc(m.summary)}</p>
      <div class="muted">⏱ ${m.duration} min · 👥 ${esc(m.people)}</div>
    </div>`;
  }).join("");

  view().innerHTML = `
    <div class="page-head">
      <div><h1>Method library</h1><p class="sub">${METHODS.length} proven techniques, organised by phase.</p></div>
      <input class="search-bar" type="text" placeholder="Search methods…" value="${esc(methodFilter.q)}"
             data-action-input="method-search">
    </div>
    <div class="row mb">${chips}</div>
    <div class="grid cols-3">${cards || `<div class="empty">No methods match.</div>`}</div>`;
}

function showMethodModal(mid) {
  const m = METHOD_BY_ID[mid];
  if (!m) return;
  const ph = PHASE_BY_KEY[m.phase];
  openModal(`
    <span class="chip" style="background:${ph.color}1a;color:${ph.color}">${ph.icon} ${ph.name}</span>
    <h2 style="margin-top:10px">${esc(m.name)}</h2>
    <p class="muted">⏱ ${m.duration} min · 👥 ${esc(m.people)} · 🧰 ${esc(m.materials)}</p>
    <p>${esc(m.summary)}</p>
    <h3>Steps</h3>
    <ol class="method-steps">${m.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
    <div class="actions"><button class="btn secondary" data-action="close-modal">Close</button></div>`);
}

/* ---------------- training ---------------- */

function renderTraining() {
  const cards = MODULES.map(m => {
    const pct = moduleProgress(m);
    const q = state.training.quizzes[m.id];
    const passed = q && q.score / q.total >= 0.7;
    return `<div class="card clickable" onclick="location.hash='#/module/${m.id}'">
      <div class="row between">
        <h3 style="margin:0">${m.icon} ${esc(m.title)}</h3>
        ${passed ? `<span class="chip badge-pass">✓ passed</span>` : ""}
      </div>
      <p class="muted" style="margin:8px 0 10px">${esc(m.description)}</p>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <div class="muted" style="margin-top:6px">${pct}% · ${m.lessons.length} lessons + quiz</div>
    </div>`;
  }).join("");

  view().innerHTML = `
    <div class="page-head">
      <div><h1>Training</h1><p class="sub">Build a shared design thinking foundation, one module at a time.</p></div>
      <span class="chip">${trainingProgress()}% overall</span>
    </div>
    <div class="grid cols-2">${cards}</div>`;
}

let quizState = null; // {modId, answers:[], submitted:bool}

function renderModule(modId) {
  const mod = MODULE_BY_ID[modId];
  if (!mod) { view().innerHTML = `<div class="empty">Module not found. <a href="#/training">Back</a></div>`; return; }
  if (!quizState || quizState.modId !== modId) quizState = { modId, answers: Array(mod.quiz.length).fill(null), submitted: false };

  const doneLessons = state.training.lessons[modId] || [];

  const lessons = mod.lessons.map((l, i) => {
    const done = doneLessons.includes(i);
    return `<div class="lesson">
      <div class="lesson-head" data-action="toggle-lesson" data-idx="${i}">
        <span>${i + 1}. ${esc(l.title)}</span>
        ${done ? `<span class="tick">✓ completed</span>` : ""}
      </div>
      <div class="lesson-body" id="lesson-${i}" style="display:none">
        ${l.content}
        <button class="btn small ${done ? "secondary" : ""}" data-action="complete-lesson" data-mod="${modId}" data-idx="${i}">
          ${done ? "Mark as not completed" : "✓ Mark as completed"}
        </button>
      </div>
    </div>`;
  }).join("");

  const best = state.training.quizzes[modId];

  const quizHtml = mod.quiz.map((q, qi) => {
    const sel = quizState.answers[qi];
    const opts = q.options.map((opt, oi) => {
      let cls = "";
      if (quizState.submitted) {
        if (oi === q.answer) cls = "correct";
        else if (sel === oi) cls = "wrong";
      } else if (sel === oi) cls = "selected";
      return `<div class="quiz-opt ${cls}" data-action="quiz-pick" data-q="${qi}" data-o="${oi}">${esc(opt)}</div>`;
    }).join("");
    const explain = quizState.submitted ? `<div class="quiz-explain">💡 ${esc(q.explain)}</div>` : "";
    return `<div class="quiz-q"><strong>${qi + 1}. ${esc(q.q)}</strong>${opts}${explain}</div>`;
  }).join("");

  let quizFooter;
  if (quizState.submitted) {
    const score = quizState.answers.filter((a, i) => a === mod.quiz[i].answer).length;
    const pass = score / mod.quiz.length >= 0.7;
    quizFooter = `<div class="row between">
      <span class="chip ${pass ? "badge-pass" : ""}">${pass ? "🏅 Passed" : "Not passed"} — ${score}/${mod.quiz.length}</span>
      <button class="btn secondary" data-action="quiz-retry">Try again</button>
    </div>`;
  } else {
    const ready = quizState.answers.every(a => a !== null);
    quizFooter = `<button class="btn" data-action="quiz-submit" data-mod="${modId}" ${ready ? "" : "disabled"}>Submit answers</button>`;
  }

  view().innerHTML = `
    <div class="page-head">
      <div>
        <p class="muted"><a href="#/training">← Training</a></p>
        <h1>${mod.icon} ${esc(mod.title)}</h1>
        <p class="sub">${esc(mod.description)}</p>
      </div>
      <span class="chip">${moduleProgress(mod)}%</span>
    </div>

    <h2>Lessons</h2>
    ${lessons}

    <h2 class="mt">Knowledge check ${best ? `<span class="muted" style="font-size:13px">— best: ${best.score}/${best.total}</span>` : ""}</h2>
    <div class="card">${quizHtml}${quizFooter}</div>`;
}

/* ---------------- settings (export/import) ---------------- */

function renderSettings() {
  view().innerHTML = `
    <div class="page-head"><div><h1>Settings & data</h1>
      <p class="sub">Your data lives in this browser. Export it to back up or share with teammates.</p></div></div>
    <div class="grid cols-2">
      <div class="card">
        <h3>⬇️ Export</h3>
        <p class="muted">Download all projects, workshops and training progress as a JSON file.</p>
        <button class="btn" data-action="export-data">Export data</button>
      </div>
      <div class="card">
        <h3>⬆️ Import</h3>
        <p class="muted">Load a previously exported file. Replaces what is currently in this browser.</p>
        <input type="file" id="import-file" accept=".json" style="margin-bottom:10px">
        <button class="btn secondary" data-action="import-data">Import data</button>
      </div>
    </div>
    <div class="card mt">
      <h3>🗑️ Reset</h3>
      <p class="muted">Remove all projects, workshops and training progress from this browser.</p>
      <button class="btn danger" data-action="reset-data">Reset everything</button>
    </div>`;
}

/* ---------------- forms ---------------- */

function newProjectModal() {
  openModal(`
    <h2>New project</h2>
    <p class="muted">A real challenge your team owns — not a toy example.</p>
    <label class="fld">Project name</label>
    <input type="text" id="f-name" placeholder="e.g. Improve onboarding for new colleagues">
    <label class="fld">What problem are you exploring?</label>
    <textarea id="f-desc" placeholder="Short description of the challenge…"></textarea>
    <label class="fld">Owner</label>
    <input type="text" id="f-owner" placeholder="Who drives this project?">
    <div class="actions">
      <button class="btn secondary" data-action="close-modal">Cancel</button>
      <button class="btn" data-action="create-project">Create project</button>
    </div>`);
}

function newWorkshopModal() {
  const projOpts = state.projects.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("");
  openModal(`
    <h2>New workshop</h2>
    <label class="fld">Title</label>
    <input type="text" id="f-title" placeholder="e.g. Ideation session — onboarding">
    <label class="fld">Date</label>
    <input type="date" id="f-date">
    <label class="fld">Linked project (optional)</label>
    <select id="f-proj"><option value="">— none —</option>${projOpts}</select>
    <div class="actions">
      <button class="btn secondary" data-action="close-modal">Cancel</button>
      <button class="btn" data-action="create-workshop">Create workshop</button>
    </div>`);
}

function methodPickerModal(wid) {
  const groups = PHASES.map(ph => {
    const ms = METHODS.filter(m => m.phase === ph.key).map(m =>
      `<div class="list-row clickable" data-action="picker-add" data-id="${wid}" data-method="${m.id}">
        <div class="grow"><div class="title">${esc(m.name)}</div><div class="meta">${esc(m.summary)}</div></div>
        <span class="muted">${m.duration}m</span>
      </div>`).join("");
    return `<h3 style="margin-top:14px">${ph.icon} ${ph.name}</h3><div class="card flush">${ms}</div>`;
  }).join("");
  openModal(`
    <h2>Add activity</h2>
    <p class="muted">Click a method to add it to the agenda. You can adjust its duration afterwards.</p>
    ${groups}
    <div class="actions"><button class="btn secondary" data-action="close-modal">Done</button></div>`);
}

/* ---------------- global event handling ---------------- */

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-action]");
  if (!t) return;
  const act = t.dataset.action;
  const id = t.dataset.id;

  switch (act) {
    case "close-modal": closeModal(); break;

    /* projects */
    case "new-project": newProjectModal(); break;
    case "create-project": {
      const name = document.getElementById("f-name").value.trim();
      if (!name) { toast("Give the project a name"); return; }
      const p = newProject(name, document.getElementById("f-desc").value.trim(), document.getElementById("f-owner").value.trim());
      state.projects.push(p); save(); closeModal();
      location.hash = `#/project/${p.id}`;
      toast("Project created 🎉");
      break;
    }
    case "set-phase": {
      const p = state.projects.find(x => x.id === id);
      p.currentPhase = +t.dataset.phase; save(); renderProject(id);
      break;
    }
    case "toggle-check": {
      const p = state.projects.find(x => x.id === id);
      const c = PHASES.flatMap(ph => p.phases[ph.key].checklist).find(c => c.id === t.dataset.check);
      c.done = t.checked; save(); renderProject(id);
      break;
    }
    case "del-check": {
      const p = state.projects.find(x => x.id === id);
      PHASES.forEach(ph => {
        p.phases[ph.key].checklist = p.phases[ph.key].checklist.filter(c => c.id !== t.dataset.check);
      });
      save(); renderProject(id);
      break;
    }
    case "add-check": {
      const inp = document.getElementById("new-check");
      const text = inp.value.trim();
      if (!text) return;
      const p = state.projects.find(x => x.id === id);
      p.phases[PHASES[p.currentPhase].key].checklist.push({ id: uid(), text, done: false });
      save(); renderProject(id);
      break;
    }
    case "toggle-project-status": {
      const p = state.projects.find(x => x.id === id);
      p.status = p.status === "completed" ? "active" : "completed";
      save(); renderProject(id);
      toast(p.status === "completed" ? "Project completed 🏁" : "Project reopened");
      break;
    }
    case "del-project": {
      if (!confirm("Delete this project and all its notes?")) return;
      state.projects = state.projects.filter(x => x.id !== id);
      save(); location.hash = "#/projects"; toast("Project deleted");
      break;
    }

    /* workshops */
    case "new-workshop": newWorkshopModal(); break;
    case "create-workshop": {
      const title = document.getElementById("f-title").value.trim();
      if (!title) { toast("Give the workshop a title"); return; }
      const w = {
        id: uid(), title,
        date: document.getElementById("f-date").value,
        projectId: document.getElementById("f-proj").value || null,
        agenda: [], status: "planned",
      };
      state.workshops.push(w); save(); closeModal();
      location.hash = `#/workshop/${w.id}`;
      toast("Workshop created");
      break;
    }
    case "open-method-picker": methodPickerModal(id); break;
    case "picker-add": {
      const w = state.workshops.find(x => x.id === id);
      const m = METHOD_BY_ID[t.dataset.method];
      w.agenda.push({ methodId: m.id, duration: m.duration });
      save(); toast(`Added: ${m.name}`);
      break;
    }
    case "agenda-up": case "agenda-down": {
      const w = state.workshops.find(x => x.id === id);
      const i = +t.dataset.idx, j = act === "agenda-up" ? i - 1 : i + 1;
      [w.agenda[i], w.agenda[j]] = [w.agenda[j], w.agenda[i]];
      save(); renderWorkshop(id);
      break;
    }
    case "agenda-del": {
      const w = state.workshops.find(x => x.id === id);
      w.agenda.splice(+t.dataset.idx, 1);
      save(); renderWorkshop(id);
      break;
    }
    case "del-workshop": {
      if (!confirm("Delete this workshop?")) return;
      state.workshops = state.workshops.filter(x => x.id !== id);
      save(); location.hash = "#/workshops"; toast("Workshop deleted");
      break;
    }
    case "start-facilitation": location.hash = `#/facilitate/${id}`; break;
    case "finish-workshop": {
      const w = state.workshops.find(x => x.id === id);
      w.status = "completed"; w._pos = 0;
      save(); location.hash = `#/workshop/${id}`;
      toast("Workshop completed — don't forget the summary within 24h! 🎉");
      break;
    }
    case "fac-next": case "fac-prev": case "fac-jump": {
      const w = state.workshops.find(x => x.id === id);
      if (act === "fac-next") w._pos = (w._pos || 0) + 1;
      else if (act === "fac-prev") w._pos = (w._pos || 0) - 1;
      else w._pos = +t.dataset.idx;
      drawFacilitate(w);
      break;
    }
    case "timer-toggle": {
      const btn = document.getElementById("timer-toggle");
      if (timer.running) {
        clearInterval(timer.interval); timer.interval = null; timer.running = false;
        btn.textContent = "▶ Resume";
      } else {
        timer.interval = setInterval(tick, 1000); timer.running = true;
        btn.textContent = "⏸ Pause";
      }
      break;
    }
    case "timer-reset": {
      const hash = location.hash.match(/^#\/facilitate\/(\w+)$/);
      if (hash) renderFacilitate(hash[1]);
      break;
    }

    /* methods */
    case "filter-phase": methodFilter.phase = t.dataset.phase; renderMethods(); break;
    case "show-method": e.stopPropagation(); showMethodModal(t.dataset.method); break;

    /* training */
    case "toggle-lesson": {
      const body = document.getElementById(`lesson-${t.dataset.idx}`);
      body.style.display = body.style.display === "none" ? "block" : "none";
      break;
    }
    case "complete-lesson": {
      const mod = t.dataset.mod, idx = +t.dataset.idx;
      const arr = state.training.lessons[mod] || (state.training.lessons[mod] = []);
      const pos = arr.indexOf(idx);
      if (pos >= 0) arr.splice(pos, 1); else arr.push(idx);
      save(); renderModule(mod);
      break;
    }
    case "quiz-pick": {
      if (quizState.submitted) return;
      quizState.answers[+t.dataset.q] = +t.dataset.o;
      renderModule(quizState.modId);
      break;
    }
    case "quiz-submit": {
      quizState.submitted = true;
      const mod = MODULE_BY_ID[t.dataset.mod];
      const score = quizState.answers.filter((a, i) => a === mod.quiz[i].answer).length;
      const prev = state.training.quizzes[mod.id];
      if (!prev || score > prev.score) state.training.quizzes[mod.id] = { score, total: mod.quiz.length };
      save(); renderModule(mod.id);
      if (score / mod.quiz.length >= 0.7) toast(`🏅 Passed — ${score}/${mod.quiz.length}!`);
      break;
    }
    case "quiz-retry": {
      const modId = quizState.modId;
      quizState = { modId, answers: Array(MODULE_BY_ID[modId].quiz.length).fill(null), submitted: false };
      renderModule(modId);
      break;
    }

    /* settings */
    case "export-data": {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `design-thinking-studio-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      toast("Data exported");
      break;
    }
    case "import-data": {
      const f = document.getElementById("import-file").files[0];
      if (!f) { toast("Choose a file first"); return; }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!data.projects || !data.workshops) throw new Error("invalid format");
          state = Object.assign(defaultState(), data);
          save(); toast("Data imported"); location.hash = "#/"; route();
        } catch { toast("That file doesn't look like a Studio export"); }
      };
      reader.readAsText(f);
      break;
    }
    case "reset-data": {
      if (!confirm("Really delete ALL projects, workshops and training progress?")) return;
      state = defaultState(); save(); toast("Everything reset"); location.hash = "#/"; route();
      break;
    }
  }
});

/* change/input delegated events */
document.addEventListener("change", (e) => {
  const t = e.target.closest("[data-action-change]");
  if (!t) return;
  const id = t.dataset.id;
  switch (t.dataset.actionChange) {
    case "agenda-dur": {
      const w = state.workshops.find(x => x.id === id);
      w.agenda[+t.dataset.idx].duration = Math.max(1, +t.value || 1);
      save(); renderWorkshop(id);
      break;
    }
    case "ws-date": {
      const w = state.workshops.find(x => x.id === id);
      w.date = t.value; save(); toast("Date saved");
      break;
    }
    case "ws-project": {
      const w = state.workshops.find(x => x.id === id);
      w.projectId = t.value || null; save(); toast("Project link saved");
      break;
    }
  }
});

document.addEventListener("input", (e) => {
  const t = e.target.closest("[data-action-input]");
  if (!t) return;
  if (t.dataset.actionInput === "method-search") {
    methodFilter.q = t.value.toLowerCase();
    const pos = t.selectionStart;
    renderMethods();
    const inp = document.querySelector('[data-action-input="method-search"]');
    inp.focus(); inp.setSelectionRange(pos, pos);
  }
});
