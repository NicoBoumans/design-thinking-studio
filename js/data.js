/* ============================================================
   Design Thinking Studio — static content: phases, methods,
   training modules. App state lives in storage.js / app.js.
   ============================================================ */

const PHASES = [
  {
    key: "empathize", name: "Empathize", color: "#e91e63", icon: "🔍",
    tagline: "Understand your users and their world",
    checklist: [
      "Identify stakeholders & target users",
      "Conduct 3–5 user interviews",
      "Observe users in their context",
      "Create an empathy map",
      "Share findings with the team",
    ],
  },
  {
    key: "define", name: "Define", color: "#9c27b0", icon: "🎯",
    tagline: "Frame the right problem to solve",
    checklist: [
      "Cluster research insights",
      "Write a Point-of-View statement",
      "Formulate a 'How Might We' question",
      "Validate the problem with stakeholders",
    ],
  },
  {
    key: "ideate", name: "Ideate", color: "#ff9800", icon: "💡",
    tagline: "Generate a wide range of ideas",
    checklist: [
      "Run an ideation session",
      "Generate 20+ ideas",
      "Cluster and discuss ideas",
      "Select ideas to pursue (dot voting)",
    ],
  },
  {
    key: "prototype", name: "Prototype", color: "#00bcd4", icon: "🛠️",
    tagline: "Make ideas tangible, fast and cheap",
    checklist: [
      "Decide what you want to learn",
      "Build a low-fidelity prototype",
      "Prepare a realistic test scenario",
    ],
  },
  {
    key: "test", name: "Test", color: "#4caf50", icon: "🧪",
    tagline: "Learn from real user feedback",
    checklist: [
      "Recruit 3–5 testers",
      "Run test sessions",
      "Capture feedback in a grid",
      "Decide: persevere, pivot or iterate",
    ],
  },
];

const PHASE_BY_KEY = Object.fromEntries(PHASES.map(p => [p.key, p]));

/* ---------------- Method library ---------------- */

const METHODS = [
  {
    id: "stakeholder-map", name: "Stakeholder Mapping", phase: "empathize",
    duration: 30, people: "2–8", materials: "Whiteboard, sticky notes",
    summary: "Map everyone who touches the problem to decide who to research and involve.",
    steps: [
      "Write the challenge in the centre of the board.",
      "Brainstorm every person/group affected by or influencing it.",
      "Arrange them by influence (vertical) and interest (horizontal).",
      "Mark who you must interview, inform, or involve in sessions.",
    ],
  },
  {
    id: "user-interview", name: "User Interviews", phase: "empathize",
    duration: 45, people: "2 per interview", materials: "Interview guide, recorder, consent",
    summary: "Semi-structured conversations to uncover needs, motivations and frustrations.",
    steps: [
      "Prepare an interview guide: open questions about behaviour, not opinions.",
      "Work in pairs: one interviews, one takes notes.",
      "Ask 'why?' and 'tell me about the last time…' — avoid leading questions.",
      "Capture quotes verbatim; debrief within 30 minutes of the interview.",
    ],
  },
  {
    id: "empathy-map", name: "Empathy Map", phase: "empathize",
    duration: 30, people: "3–8", materials: "Empathy map canvas, sticky notes",
    summary: "Organise observations into Says / Thinks / Does / Feels to build shared understanding.",
    steps: [
      "Draw four quadrants: Says, Thinks, Does, Feels.",
      "Transfer interview observations onto sticky notes, one per note.",
      "Place each note in the right quadrant as a team.",
      "Discuss tensions (e.g. says ≠ does) — these hide the best insights.",
    ],
  },
  {
    id: "persona", name: "Persona", phase: "empathize",
    duration: 40, people: "3–8", materials: "Persona template",
    summary: "A fictional but research-grounded archetype of your user that keeps the team aligned.",
    steps: [
      "Cluster interviewees with similar goals and behaviours.",
      "Give the archetype a name, context, goals, frustrations and a quote.",
      "Base every element on actual research data, not imagination.",
      "Hang the persona where the team works and refer to it in decisions.",
    ],
  },
  {
    id: "journey-map", name: "Customer Journey Map", phase: "empathize",
    duration: 60, people: "3–8", materials: "Long paper roll or board, sticky notes",
    summary: "Visualise the user's end-to-end experience to find moments of pain and delight.",
    steps: [
      "Define the persona and the scenario to map.",
      "List the journey steps left to right.",
      "For each step add actions, thoughts and an emotion curve.",
      "Highlight pain points — these are your design opportunities.",
    ],
  },
  {
    id: "affinity-clustering", name: "Affinity Clustering", phase: "define",
    duration: 45, people: "3–8", materials: "All research notes, wall space",
    summary: "Group research observations bottom-up until patterns and insights emerge.",
    steps: [
      "Put every observation on its own sticky note on the wall.",
      "Silently group notes that belong together.",
      "Name each cluster with an insight statement, not a category label.",
      "Prioritise clusters by impact on the user.",
    ],
  },
  {
    id: "pov-statement", name: "Point-of-View Statement", phase: "define",
    duration: 30, people: "2–6", materials: "Template: [user] needs [need] because [insight]",
    summary: "Compress your research into one actionable problem definition.",
    steps: [
      "Pick your primary user and your strongest insight.",
      "Fill in: '[User] needs a way to [need] because [insight]'.",
      "The need must be a verb, not a solution.",
      "Write several variants and pick the most energising one.",
    ],
  },
  {
    id: "hmw", name: "How Might We", phase: "define",
    duration: 20, people: "2–8", materials: "Sticky notes, POV statement",
    summary: "Reframe the problem as optimistic, open questions that launch ideation.",
    steps: [
      "Start from your POV statement.",
      "Generate many 'How might we…?' questions.",
      "Check the scope: not so broad it's vague, not so narrow it implies a solution.",
      "Dot-vote the HMW that will kick off ideation.",
    ],
  },
  {
    id: "assumption-map", name: "Assumption Mapping", phase: "define",
    duration: 40, people: "3–8", materials: "2x2 grid: importance vs. evidence",
    summary: "Surface what you believe but haven't verified, and pick the riskiest assumption to test.",
    steps: [
      "List all assumptions behind the problem and the direction.",
      "Plot each on a 2x2: how important vs. how much evidence we have.",
      "Important + low evidence = riskiest assumptions.",
      "Design your next research or prototype to test the top one.",
    ],
  },
  {
    id: "brainstorm", name: "Classic Brainstorm", phase: "ideate",
    duration: 30, people: "4–8", materials: "Sticky notes, markers, HMW question",
    summary: "Rapid group idea generation under the rules of deferred judgement.",
    steps: [
      "Post the HMW question visibly.",
      "Review the rules: defer judgement, go for quantity, build on others, wild ideas welcome.",
      "Everyone writes ideas on stickies and posts them while saying them aloud.",
      "Timebox to 15 minutes, then cluster.",
    ],
  },
  {
    id: "brainwriting", name: "Brainwriting 6-3-5", phase: "ideate",
    duration: 35, people: "6", materials: "A4 sheets with 3x6 grid",
    summary: "Silent written ideation — 6 people, 3 ideas, 5 minutes per round. Great for quieter voices.",
    steps: [
      "Each person writes 3 ideas on their sheet in 5 minutes.",
      "Pass the sheet to your neighbour.",
      "Build on or vary the ideas already on the sheet — 3 more in 5 minutes.",
      "After 6 rounds you have up to 108 ideas; cluster the best.",
    ],
  },
  {
    id: "crazy8s", name: "Crazy 8s", phase: "ideate",
    duration: 15, people: "2–10", materials: "A4 folded into 8 panels, pens",
    summary: "Sketch 8 idea variations in 8 minutes to break past your first obvious idea.",
    steps: [
      "Fold an A4 sheet into 8 panels.",
      "Set a timer: 8 minutes, one sketch per panel.",
      "Quantity over beauty — stick figures are fine.",
      "Share: everyone presents their strongest 1–2 sketches.",
    ],
  },
  {
    id: "scamper", name: "SCAMPER", phase: "ideate",
    duration: 30, people: "2–8", materials: "SCAMPER prompt cards",
    summary: "Systematically transform an existing idea: Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse.",
    steps: [
      "Pick one existing idea or current solution.",
      "Walk through each SCAMPER prompt and force at least one variation.",
      "Capture every variation, even absurd ones.",
      "Review which transformations unlocked something new.",
    ],
  },
  {
    id: "dot-voting", name: "Dot Voting", phase: "ideate",
    duration: 10, people: "3–12", materials: "Dot stickers (3–5 per person)",
    summary: "Fast, democratic idea selection that avoids endless discussion.",
    steps: [
      "Display all clustered ideas.",
      "Everyone gets 3–5 dots; vote silently.",
      "Optionally use criteria dots (e.g. green = impact, blue = feasible).",
      "Discuss only the top-voted ideas.",
    ],
  },
  {
    id: "paper-prototype", name: "Paper Prototyping", phase: "prototype",
    duration: 60, people: "2–4", materials: "Paper, scissors, markers",
    summary: "Sketch screens or service touchpoints on paper to test flows before building anything.",
    steps: [
      "Decide the single flow or moment to prototype.",
      "Sketch each screen/step on its own sheet.",
      "One person 'plays computer' by swapping sheets as the user acts.",
      "Iterate the sketches immediately between test rounds.",
    ],
  },
  {
    id: "storyboard", name: "Storyboarding", phase: "prototype",
    duration: 45, people: "2–6", materials: "6–8 panel template, pens",
    summary: "Draw the user's experience with your solution as a comic strip to test the story, not the product.",
    steps: [
      "Define the opening scene: user + context + trigger.",
      "Sketch 6–8 panels from problem to resolved outcome.",
      "Add a caption under every panel.",
      "Walk stakeholders through it and capture where the story breaks.",
    ],
  },
  {
    id: "wizard-of-oz", name: "Wizard of Oz", phase: "prototype",
    duration: 90, people: "2–4", materials: "Depends on the fake — often just a human behind the curtain",
    summary: "Fake the working product with humans behind the scenes to test demand before building.",
    steps: [
      "Identify the expensive part of the solution (e.g. the algorithm).",
      "Replace it with a hidden human performing the task manually.",
      "Let real users interact as if it were real.",
      "Measure behaviour: do they use it, return, pay?",
    ],
  },
  {
    id: "usability-test", name: "Usability Testing", phase: "test",
    duration: 45, people: "2 per session + 1 tester", materials: "Prototype, task script, note grid",
    summary: "Watch real users attempt tasks with your prototype — say little, learn a lot.",
    steps: [
      "Write 2–3 realistic tasks, not feature tours.",
      "Ask the user to think aloud; don't help or explain.",
      "One facilitates, one takes notes on behaviour and quotes.",
      "After 3–5 users, patterns will be obvious.",
    ],
  },
  {
    id: "feedback-grid", name: "Feedback Capture Grid", phase: "test",
    duration: 20, people: "2–8", materials: "2x2 grid: likes / criticisms / questions / ideas",
    summary: "Structure test feedback into four quadrants so nothing gets lost or dismissed.",
    steps: [
      "Draw four quadrants: Likes, Criticisms, Questions, Ideas.",
      "During or right after each test, fill all four — push for balance.",
      "Merge grids across test sessions.",
      "Turn criticisms and questions into the next iteration's goals.",
    ],
  },
  {
    id: "i-like-i-wish", name: "I Like / I Wish / What If", phase: "test",
    duration: 15, people: "3–12", materials: "Sticky notes or just voices",
    summary: "A constructive feedback ritual — also perfect for closing workshops and retros.",
    steps: [
      "Everyone phrases feedback starting with 'I like…', 'I wish…' or 'What if…'.",
      "Go round-robin; no discussion during the round.",
      "Capture every statement visibly.",
      "Cluster the wishes and what-ifs into next actions.",
    ],
  },
];

const METHOD_BY_ID = Object.fromEntries(METHODS.map(m => [m.id, m]));

/* ---------------- Training modules ---------------- */

const MODULES = [
  {
    id: "intro", title: "Introduction to Design Thinking", icon: "🧭",
    description: "What design thinking is, why it works, and the mindsets behind it.",
    lessons: [
      {
        title: "What is design thinking?",
        content: `<p>Design thinking is a <strong>human-centred approach to innovation</strong>. Instead of starting from what is technically possible or commercially attractive, it starts from what people actually need — and only then asks whether we can build it and whether it's viable.</p>
<p>The process is usually drawn as five phases: <strong>Empathize → Define → Ideate → Prototype → Test</strong>. In practice it is not linear: you will loop back constantly. Testing teaches you something that sharpens your problem definition; a prototype raises a question that sends you back to users.</p>
<p>The phases are a map, not a conveyor belt. The real engine is the mindset underneath.</p>`,
      },
      {
        title: "The core mindsets",
        content: `<p>Five mindsets matter more than any template:</p>
<ul>
<li><strong>Fall in love with the problem, not the solution.</strong> Teams that jump to solutions solve the wrong problem beautifully.</li>
<li><strong>Show, don't tell.</strong> A rough prototype beats a polished slide deck — it invites honest feedback.</li>
<li><strong>Embrace ambiguity.</strong> Early on, not knowing the answer is the correct state. Resist premature certainty.</li>
<li><strong>Bias to action.</strong> An hour of testing teaches more than a week of debating.</li>
<li><strong>Radical collaboration.</strong> Diverse perspectives in the room produce better problem framings and ideas.</li>
</ul>`,
      },
      {
        title: "Diverge and converge",
        content: `<p>Every phase alternates between two modes:</p>
<p><strong>Diverging</strong> — opening up: gathering many observations, generating many ideas, exploring many directions. The rule is quantity and deferred judgement.</p>
<p><strong>Converging</strong> — narrowing down: clustering, prioritising, choosing. The rule is explicit criteria and decisions.</p>
<p>Most dysfunctional sessions mix the modes: someone proposes an idea (diverging) and someone else immediately critiques it (converging). A good facilitator names the current mode out loud and protects it. This is also why methods like Brainwriting and Dot Voting exist — they keep the modes clean.</p>`,
      },
    ],
    quiz: [
      {
        q: "What is the right order of the five design thinking phases?",
        options: [
          "Define → Empathize → Prototype → Ideate → Test",
          "Empathize → Define → Ideate → Prototype → Test",
          "Ideate → Empathize → Define → Test → Prototype",
          "Empathize → Ideate → Define → Prototype → Test",
        ],
        answer: 1,
        explain: "Understand users first, frame the problem, then generate, build and test ideas — looping back as you learn.",
      },
      {
        q: "A teammate pitches an idea and another instantly says 'that will never work'. What principle is being violated?",
        options: [
          "Bias to action",
          "Show, don't tell",
          "Separating diverging from converging",
          "Radical collaboration",
        ],
        answer: 2,
        explain: "Judging ideas during a diverging activity kills idea flow. Critique belongs in a separate converging step.",
      },
      {
        q: "Why does design thinking insist on starting with empathy rather than ideas?",
        options: [
          "Ideas are less important than research",
          "It prevents teams from efficiently solving the wrong problem",
          "Users always know exactly what solution they want",
          "It makes projects finish faster",
        ],
        answer: 1,
        explain: "The biggest waste in innovation is building something nobody needs. Empathy work de-risks the problem itself.",
      },
    ],
  },
  {
    id: "empathize", title: "Empathize", icon: "🔍",
    description: "Interviewing, observing, and turning encounters into shared understanding.",
    lessons: [
      {
        title: "Good interviews",
        content: `<p>The goal of a user interview is to understand <strong>behaviour and motivation</strong>, not to collect opinions or feature requests.</p>
<ul>
<li>Ask about <strong>specific past behaviour</strong>: "Tell me about the last time you…" beats "Would you ever…?"</li>
<li>Ask <strong>why</strong>, repeatedly and gently. The first answer is rarely the real one.</li>
<li><strong>Embrace silence.</strong> Count to five before filling a pause — people elaborate when given room.</li>
<li>Never pitch your idea during research. The moment you do, you get politeness instead of truth.</li>
</ul>
<p>Work in pairs: an interviewer who stays in the conversation and a note-taker who captures quotes verbatim.</p>`,
      },
      {
        title: "Observation beats opinion",
        content: `<p>What people <em>say</em> and what people <em>do</em> are different data sets, and the gap between them is where insight lives.</p>
<p>Whenever possible, watch users in their real context: how they actually use the tool, the workaround spreadsheet next to the official system, the sticky note with the password on the monitor. These <strong>workarounds are gold</strong> — each one is an unmet need the user already cared enough about to solve badly.</p>
<p>Capture observations separately from interpretations. "She printed the form and filled it in by hand" is an observation. "She doesn't trust the digital form" is an interpretation that needs verification.</p>`,
      },
      {
        title: "From data to insight",
        content: `<p>Research only pays off when it is processed <strong>as a team</strong>. Plan a download session within a day or two of your interviews.</p>
<p>Use an <strong>Empathy Map</strong> (Says / Thinks / Does / Feels) per persona or interview, then <strong>Affinity Clustering</strong> across all of them. Name clusters as insight statements: not "Onboarding" but "New colleagues are afraid to ask the same question twice".</p>
<p>An insight is a non-obvious truth about the user that creates opportunity. If nobody in the room is at least a little surprised, keep digging.</p>`,
      },
    ],
    quiz: [
      {
        q: "Which interview question will give the most reliable data?",
        options: [
          "Would you use an app that did X?",
          "Do you like the current process?",
          "Can you walk me through the last time you submitted an expense?",
          "How often do you think you'd use this feature?",
        ],
        answer: 2,
        explain: "Specific past behaviour is real data. Hypothetical questions invite polite speculation.",
      },
      {
        q: "You notice a user keeps a personal spreadsheet next to the official tool. What is this?",
        options: [
          "A compliance problem to report",
          "A workaround revealing an unmet need — gold for research",
          "Proof the user needs training",
          "Irrelevant to the research",
        ],
        answer: 1,
        explain: "Workarounds show needs users already care enough about to solve themselves — prime design opportunities.",
      },
      {
        q: "What belongs in the 'Says' quadrant of an empathy map?",
        options: [
          "Your interpretation of the user's mood",
          "A verbatim quote from the interview",
          "The feature you plan to build",
          "The user's job title",
        ],
        answer: 1,
        explain: "'Says' holds direct quotes. Keeping observation separate from interpretation protects the data.",
      },
    ],
  },
  {
    id: "define", title: "Define", icon: "🎯",
    description: "Turning research into a sharp, actionable problem statement.",
    lessons: [
      {
        title: "The Point-of-View statement",
        content: `<p>The Define phase compresses everything you learned into one sentence the whole team can rally behind:</p>
<p><strong>[User] needs a way to [need] because [insight].</strong></p>
<ul>
<li>The <strong>user</strong> is specific — a persona, not "everyone".</li>
<li>The <strong>need</strong> is a verb, never a solution. "Needs an app" is a solution; "needs to feel confident the request arrived" is a need.</li>
<li>The <strong>insight</strong> is the surprising truth from research that explains the need.</li>
</ul>
<p>A good POV is falsifiable and energising. If it could have been written without doing the research, it isn't done yet.</p>`,
      },
      {
        title: "How Might We",
        content: `<p>'How Might We' (HMW) questions translate your POV into launchpads for ideation.</p>
<p>Each word is doing work: <strong>How</strong> assumes it's solvable, <strong>Might</strong> gives permission to explore imperfect answers, <strong>We</strong> makes it a team sport.</p>
<p>Calibrate the scope. Too broad ("HMW improve work?") gives no traction. Too narrow ("HMW add a green confirmation button?") smuggles in the solution. Aim between: "HMW give Sara certainty that her request is being handled?"</p>
<p>Generate many HMWs from one POV, then vote on which to take into ideation.</p>`,
      },
      {
        title: "Choosing the right problem",
        content: `<p>Define is the highest-leverage moment of the whole process: every later phase amplifies the choice you make here.</p>
<p>Validate before you proceed: replay the POV to the stakeholders and ideally to users. Do they nod, or do they correct you? A correction at this stage is cheap; the same correction after development is not.</p>
<p>Also surface your <strong>assumptions</strong> explicitly (use Assumption Mapping). The riskiest assumption — important and unproven — should shape what you prototype first.</p>`,
      },
    ],
    quiz: [
      {
        q: "Which is a well-formed need for a POV statement?",
        options: [
          "…needs a mobile app",
          "…needs a dashboard with filters",
          "…needs to trust that her report reached the right person",
          "…needs more features",
        ],
        answer: 2,
        explain: "Needs are verbs/outcomes, never solutions. Apps and dashboards are solutions in disguise.",
      },
      {
        q: "What is wrong with 'How might we add a chatbot to the intranet?'",
        options: [
          "It is too broad",
          "It already contains the solution",
          "Chatbots are outdated",
          "Nothing — it is a good HMW",
        ],
        answer: 1,
        explain: "A HMW should frame the user problem and leave the solution space open — 'chatbot' closes it.",
      },
      {
        q: "Why is the Define phase considered the highest-leverage step?",
        options: [
          "It takes the most time",
          "Every later phase amplifies the problem choice made here",
          "It requires the most people",
          "It produces the most documents",
        ],
        answer: 1,
        explain: "Ideating, prototyping and testing all execute against the framing — a wrong frame wastes all of it.",
      },
    ],
  },
  {
    id: "ideate", title: "Ideate", icon: "💡",
    description: "Generating volume, building on each other, and selecting without politics.",
    lessons: [
      {
        title: "Quantity has a quality of its own",
        content: `<p>The first ideas any group produces are the obvious ones — the ideas everyone already had. Original options live <em>past</em> that point, which is why ideation techniques are designed to push volume.</p>
<p>The four classic brainstorm rules: <strong>defer judgement, encourage wild ideas, build on the ideas of others ("yes, and…"), go for quantity.</strong></p>
<p>Wild ideas are not meant to ship; they stretch the space. The practical winner is often a tamed version of a wild idea — a destination you'd never reach by being sensible from the start.</p>`,
      },
      {
        title: "Beyond shouting: structured techniques",
        content: `<p>Classic brainstorming favours the loudest voices. Mix in structured formats:</p>
<ul>
<li><strong>Brainwriting 6-3-5</strong> — silent and written; introverts contribute equally, and ideas build across rounds.</li>
<li><strong>Crazy 8s</strong> — 8 sketches in 8 minutes forces past the first obvious concept.</li>
<li><strong>SCAMPER</strong> — systematic transformations of an existing idea when the well runs dry.</li>
</ul>
<p>Always ideate <em>against</em> a visible HMW question, and warm the group up first — two minutes of a silly exercise measurably raises idea flow.</p>`,
      },
      {
        title: "Converging without politics",
        content: `<p>Selecting ideas is where hierarchy sneaks back in — the boss's idea mysteriously wins. Counter it with structure:</p>
<ul>
<li><strong>Cluster first</strong>, so you vote on directions rather than 80 stickies.</li>
<li><strong>Dot voting</strong>, silently, before any discussion.</li>
<li>Use <strong>criteria dots</strong> if useful: one colour for user impact, another for feasibility.</li>
<li>Keep a 'parking lot' for ideas you're not pursuing — nothing is deleted, which makes letting go easier.</li>
</ul>
<p>The output of ideation is not 'the answer'; it is 1–3 promising directions worth prototyping.</p>`,
      },
    ],
    quiz: [
      {
        q: "Why are wild ideas explicitly encouraged?",
        options: [
          "They are usually the ones that ship",
          "They stretch the solution space; tamed versions are often the winners",
          "They make the session more fun, nothing more",
          "They impress stakeholders",
        ],
        answer: 1,
        explain: "Wild ideas are stepping stones to original-but-feasible ones you'd never reach by being sensible from the start.",
      },
      {
        q: "Your team has two dominant talkers and three quiet members. Which technique helps most?",
        options: [
          "Classic open brainstorm",
          "A longer discussion",
          "Brainwriting 6-3-5",
          "Letting the manager decide",
        ],
        answer: 2,
        explain: "Silent written ideation equalises participation — everyone produces ideas regardless of volume of voice.",
      },
      {
        q: "What is the correct output of an ideation session?",
        options: [
          "One final validated solution",
          "A complete project plan",
          "1–3 promising directions to prototype",
          "A list of requirements",
        ],
        answer: 2,
        explain: "Ideation narrows to candidates; prototyping and testing decide. Committing to one 'answer' now skips the learning.",
      },
    ],
  },
  {
    id: "prototype-test", title: "Prototype & Test", icon: "🧪",
    description: "Building to learn, testing with users, and deciding what's next.",
    lessons: [
      {
        title: "Prototype to learn, not to impress",
        content: `<p>A prototype is a <strong>question made tangible</strong>. Before building anything, finish this sentence: "We are building this to find out whether…"</p>
<p>Match fidelity to the question. Testing a flow? Paper screens are enough. Testing desirability? A fake landing page or a Wizard-of-Oz setup. Polish actively hurts early testing — people critique rough things honestly and flatter finished-looking ones.</p>
<p>Rule of thumb: if your prototype took more than a day, you are probably testing too much at once.</p>`,
      },
      {
        title: "Running a good test",
        content: `<p>The hardest skill in testing is <strong>staying quiet</strong>.</p>
<ul>
<li>Give a realistic task, then stop talking. No tours, no hints.</li>
<li>Ask users to <strong>think aloud</strong>.</li>
<li>When they get stuck, ask "what would you expect to happen?" instead of helping.</li>
<li>Watch what they <em>do</em>; note what they <em>say</em>; treat their <em>solutions</em> as signals of needs, not specs.</li>
</ul>
<p>Capture everything in a <strong>Feedback Capture Grid</strong> (likes / criticisms / questions / ideas). After 3–5 users, the patterns repeat — that's your signal to stop testing and start iterating.</p>`,
      },
      {
        title: "Persevere, pivot or iterate",
        content: `<p>End every test round with an explicit decision, made against the question you defined up front:</p>
<ul>
<li><strong>Persevere</strong> — the direction works; raise fidelity and test the next riskiest assumption.</li>
<li><strong>Iterate</strong> — the direction works but the execution doesn't; adjust and retest.</li>
<li><strong>Pivot</strong> — the assumption failed; return to your insights and choose a different direction. This is a success of the process, not a failure of the team: you just avoided building the wrong thing.</li>
</ul>
<p>Share what you learned beyond the team. Visible learning is what keeps stakeholders funding the loop.</p>`,
      },
    ],
    quiz: [
      {
        q: "What should you define before building any prototype?",
        options: [
          "The colour scheme",
          "The question it must answer ('we're building this to find out whether…')",
          "The full feature list",
          "The launch date",
        ],
        answer: 1,
        explain: "A prototype is a question made tangible. Without the question, you can't choose fidelity or judge results.",
      },
      {
        q: "During a usability test the user gets stuck. What do you do?",
        options: [
          "Show them the right button",
          "Explain the design intention",
          "Ask 'what would you expect to happen here?'",
          "End the session",
        ],
        answer: 2,
        explain: "Helping destroys the data. Their expectation at the stuck moment is exactly the insight you came for.",
      },
      {
        q: "Your riskiest assumption failed in testing. What is the honest conclusion?",
        options: [
          "The team failed and should be retrained",
          "Test with different users until it passes",
          "The process worked: you avoided building the wrong thing — pivot",
          "Ship it anyway since the prototype is done",
        ],
        answer: 2,
        explain: "Invalidating a bad direction cheaply is the entire point of prototyping. Pivoting now is the win.",
      },
    ],
  },
  {
    id: "facilitation", title: "Facilitating Workshops", icon: "🎤",
    description: "Designing and running sessions that produce results — not just sticky notes.",
    lessons: [
      {
        title: "Design the session backwards",
        content: `<p>Start from the <strong>outcome</strong>: what must exist at the end of the session that doesn't exist now? (A chosen HMW, three prototype directions, a tested decision.)</p>
<p>Then build the agenda backwards from that outcome, alternating diverging and converging blocks. Use the Studio's workshop builder: every activity gets a method and a timebox.</p>
<p>Practical defaults: 60–90 minute sessions beat half-day marathons; plan a warm-up; plan the last 10 minutes for deciding next steps — the part most workshops skip and then regret.</p>`,
      },
      {
        title: "During the session",
        content: `<p>The facilitator manages <strong>energy, time and fairness</strong> — and stays out of the content.</p>
<ul>
<li>Announce each activity's goal, mode (diverging/converging) and timebox.</li>
<li>Use a <strong>visible timer</strong> — it depersonalises cutting discussions short.</li>
<li>Draw out quiet voices ("Sam, what's on your sheet?") and gently park dominant ones.</li>
<li>When stuck, change the format, not the volume: switch talking to writing or sketching.</li>
<li>Park off-topic gold in a visible 'parking lot'.</li>
</ul>`,
      },
      {
        title: "Landing it: outputs and follow-through",
        content: `<p>A workshop without follow-through trains people that workshops are theatre. Land it:</p>
<ul>
<li>Photograph or digitise every artifact <em>before</em> people leave the room.</li>
<li>End with <strong>I Like / I Wish / What If</strong> for fast feedback on the session itself.</li>
<li>Make next steps explicit: owner + action + date, captured in the project tracker.</li>
<li>Send the summary within 24 hours while memory is fresh.</li>
</ul>
<p>Rotate facilitation across the team — it builds skill, shares ownership, and is the single best way to make the practice stick.</p>`,
      },
    ],
    quiz: [
      {
        q: "Where should agenda design start?",
        options: [
          "With the icebreaker",
          "With the outcome the session must produce",
          "With the list of available methods",
          "With the room booking",
        ],
        answer: 1,
        explain: "Define what must exist at the end, then build the agenda backwards toward it.",
      },
      {
        q: "Two people dominate the discussion. What is the best facilitator move?",
        options: [
          "Let it run — they are senior",
          "Switch to a written format like brainwriting",
          "End the session early",
          "Argue with their ideas",
        ],
        answer: 1,
        explain: "Changing the format equalises participation without confronting anyone personally.",
      },
      {
        q: "What most determines whether workshops keep being valued by a team?",
        options: [
          "Quality of the snacks",
          "Number of sticky notes produced",
          "Follow-through: owners, actions and a summary within 24 hours",
          "Length of the session",
        ],
        answer: 2,
        explain: "Without visible follow-through, people learn that workshops are theatre and disengage.",
      },
    ],
  },
];

const MODULE_BY_ID = Object.fromEntries(MODULES.map(m => [m.id, m]));
