const { useState, useEffect, useMemo, useRef } = React;

/* ------------------------------------------------------------------ */
/*  Tokens (locked brand)                                             */
/* ------------------------------------------------------------------ */
const CSS = `
:root{
  --bg:#F9F7F0;
  --ink:#000000;
  --muted:#5C5A52;
  --accent:#40429B;
  --accent-dark:#33356E;
  --accent-wash:rgba(64,66,155,0.07);
  --line:rgba(0,0,0,0.12);
  --card:#FFFFFF;
  --display:"Libre Baskerville",Georgia,serif;
  --body:"Inter",system-ui,sans-serif;
}
*{box-sizing:border-box}
.sc-root{background:var(--bg);color:var(--ink);font-family:var(--body);
  min-height:100%;line-height:1.55;-webkit-font-smoothing:antialiased}
.sc-display{font-family:var(--display)}
.sc-eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;
  color:var(--accent);font-weight:600}
.sc-muted{color:var(--muted)}
.sc-btn{font-family:var(--body);font-weight:600;font-size:15px;border:none;
  cursor:pointer;border-radius:2px;padding:14px 26px;background:var(--accent);
  color:#fff;display:inline-flex;align-items:center;gap:10px;
  transition:background .18s ease,transform .18s ease}
.sc-btn:hover{background:var(--accent-dark)}
.sc-btn:active{transform:translateY(1px)}
.sc-btn:disabled{opacity:.4;cursor:not-allowed}
.sc-btn-ghost{background:transparent;color:var(--muted);padding:10px 4px;
  font-weight:500;font-size:14px}
.sc-btn-ghost:hover{background:transparent;color:var(--ink)}
.sc-opt{width:100%;text-align:left;font-family:var(--body);font-size:16px;
  background:var(--card);border:1px solid var(--line);border-radius:3px;
  padding:16px 18px;cursor:pointer;color:var(--ink);display:flex;
  align-items:center;gap:14px;transition:border-color .15s ease,
  background .15s ease,box-shadow .15s ease}
.sc-opt:hover{border-color:var(--accent);box-shadow:0 1px 0 var(--accent)}
.sc-opt[data-on="true"]{border-color:var(--accent);background:var(--accent-wash);
  box-shadow:inset 0 0 0 1px var(--accent)}
.sc-tick{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--line);
  flex:0 0 auto;display:flex;align-items:center;justify-content:center}
.sc-opt[data-on="true"] .sc-tick{background:var(--accent);border-color:var(--accent)}
.sc-input{width:100%;font-family:var(--body);font-size:16px;padding:14px 16px;
  border:1px solid var(--line);border-radius:3px;background:#fff;color:var(--ink)}
.sc-input:focus{outline:none;border-color:var(--accent);
  box-shadow:0 0 0 3px var(--accent-wash)}
.sc-prog{height:2px;background:rgba(0,0,0,.08);width:100%}
.sc-prog>span{display:block;height:100%;background:var(--accent);
  transition:width .35s ease}
.sc-fade{animation:scfade .35s ease both}
@keyframes scfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.sc-card{background:var(--card);border:1px solid var(--line);border-radius:4px}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
@media (prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important}
}
`;

/* ------------------------------------------------------------------ */
/*  Inline icons (lucide-style)                                       */
/* ------------------------------------------------------------------ */
const Icon = ({ size = 18, color = "currentColor", style, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ color, flex: "0 0 auto", ...style }}>
    {children}
  </svg>
);
const ArrowRight = (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>;
const ArrowLeft = (p) => <Icon {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>;
const Check = (p) => <Icon {...p}><polyline points="20 6 9 17 4 12" /></Icon>;
const ChevronDown = (p) => <Icon {...p}><polyline points="6 9 12 15 18 9" /></Icon>;
const ChevronUp = (p) => <Icon {...p}><polyline points="18 15 12 9 6 15" /></Icon>;
const Lock = (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>;
const ShieldAlert = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>;

/* ------------------------------------------------------------------ */
/*  Survey definition                                                 */
/* ------------------------------------------------------------------ */
const QUESTIONS = [
  {
    id: "size", intel: true, eyebrow: "About you",
    q: "How many people work at your organization?", type: "single",
    options: [
      { v: "u50", label: "Fewer than 50" },
      { v: "s250", label: "50 to 250" },
      { v: "s1000", label: "250 to 1,000" },
      { v: "o1000", label: "More than 1,000" },
    ],
  },
  {
    id: "industry", intel: true, eyebrow: "About you",
    q: "What kind of company are you?", type: "single",
    options: [
      { v: "aiml", label: "AI / ML product company" },
      { v: "fintech", label: "Fintech" },
      { v: "banking", label: "Banking / insurance" },
      { v: "healthtech", label: "Healthtech / life sciences" },
      { v: "retail", label: "Retail / e-commerce" },
      { v: "manufacturing", label: "Manufacturing / industrial" },
      { v: "devtools", label: "Developer tools / infrastructure" },
      { v: "saas", label: "Other B2B SaaS" },
      { v: "other", label: "Other" },
    ],
  },
  {
    id: "deployments", eyebrow: "Your AI footprint",
    q: "What AI do you run in production today?",
    helper: "Select all that apply. Most AI-native teams check several.", type: "multi",
    options: [
      { v: "core", label: "LLM features in our core product", w: 4 },
      { v: "chatbots", label: "Customer-facing chatbots or conversational AI", w: 3 },
      { v: "copilots", label: "Internal copilots / assistants", w: 1 },
      { v: "agents", label: "Autonomous or multi-step agents", w: 4 },
      { v: "mcp", label: "Tool-using agents (MCP / function calling)", w: 4 },
      { v: "rag", label: "RAG over proprietary or customer data", w: 3 },
      { v: "custom", label: "Fine-tuned or self-hosted models", w: 2 },
      { v: "codegen", label: "AI code generation in our SDLC", w: 2 },
    ],
  },
  {
    id: "inventory", eyebrow: "Visibility",
    q: "Do you have a continuous inventory of every model, agent, and AI tool in use?",
    helper: "Including what engineers spin up and tools adopted outside IT.", type: "single",
    options: [
      { v: "comprehensive", label: "Yes, comprehensive and continuous" },
      { v: "partial", label: "Partial. We track the sanctioned ones" },
      { v: "none", label: "No real inventory today" },
      { v: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "runtime", eyebrow: "Protection",
    q: "What protects your AI at runtime against prompt injection, data leakage, and unsafe outputs?",
    type: "single",
    options: [
      { v: "dedicated", label: "Dedicated AI runtime guardrails" },
      { v: "provider", label: "The model provider's built-in filters only" },
      { v: "homegrown", label: "Guardrails we built in-house" },
      { v: "nothing", label: "Nothing specific yet" },
      { v: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "testing", eyebrow: "Testing",
    q: "Do you adversarially test your AI before and after you ship it?", type: "single",
    options: [
      { v: "continuous", label: "Yes, continuous automated red-teaming" },
      { v: "onetime", label: "A one-time manual review" },
      { v: "planned", label: "Planned, not started" },
      { v: "none", label: "No" },
    ],
  },
  {
    id: "governance", eyebrow: "Ownership",
    q: "Who owns AI security, and is your AI usage policy enforced in code?", type: "single",
    options: [
      { v: "enforced", label: "A dedicated AI security owner, policy enforced" },
      { v: "sharedsec", label: "Security owns it alongside everything else" },
      { v: "eng", label: "Engineering owns it informally" },
      { v: "noowner", label: "No clear owner yet" },
    ],
  },
  {
    id: "detection", eyebrow: "Detection",
    q: "If an agent went off-script or a model leaked data in production, would you catch it?",
    type: "single",
    options: [
      { v: "aiaware", label: "Yes, AI-aware monitoring is in place" },
      { v: "siem", label: "Only through general app or SIEM monitoring" },
      { v: "none", label: "No" },
      { v: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "intent", intel: true, eyebrow: "Last one",
    q: "What's driving your interest today?", type: "single",
    options: [
      { v: "custask", label: "A customer or prospect is asking how we secure our AI" },
      { v: "shipping", label: "We're shipping AI faster than we can secure it" },
      { v: "compliance", label: "Preparing for compliance (SOC 2, EU AI Act, security reviews)" },
      { v: "benchmark", label: "Benchmarking where we stand" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */
const DIMS = [
  { key: "guardrails", label: "Guardrails", weight: 20 },
  { key: "testing", label: "Testing", weight: 20 },
  { key: "shadowAI", label: "Shadow AI", weight: 15 },
  { key: "surface", label: "Surface", weight: 15 },
  { key: "governance", label: "Governance", weight: 15 },
  { key: "detection", label: "Detection", weight: 15 },
];

const MAPS = {
  inventory: { comprehensive: 95, partial: 55, none: 20, unsure: 25 },
  runtime: { dedicated: 95, provider: 50, homegrown: 35, nothing: 10, unsure: 15 },
  testing: { continuous: 95, onetime: 50, planned: 25, none: 10 },
  governance: { enforced: 95, sharedsec: 55, eng: 40, noowner: 15 },
  detection: { aiaware: 95, siem: 50, none: 15, unsure: 20 },
};

function computeScores(a) {
  const guardrails = MAPS.runtime[a.runtime] ?? 15;
  const testing = MAPS.testing[a.testing] ?? 10;
  const shadowAI = MAPS.inventory[a.inventory] ?? 25;
  const governance = MAPS.governance[a.governance] ?? 15;
  const detection = MAPS.detection[a.detection] ?? 20;

  const deps = a.deployments || [];
  const depOpts = QUESTIONS.find((q) => q.id === "deployments").options;
  const weightOf = (v) => {
    const o = depOpts.find((x) => x.v === v);
    return o ? o.w : 0;
  };
  const risk = deps.reduce((s, v) => s + weightOf(v), 0);
  let surface = 100 - Math.min(80, risk * 8);
  if (a.runtime === "dedicated") surface += 12;
  else if (a.runtime === "provider") surface += 4;
  if (a.testing === "continuous") surface += 8;
  else if (a.testing === "onetime") surface += 3;
  surface = Math.max(0, Math.min(100, surface));

  const scores = { guardrails, testing, shadowAI, surface, governance, detection };
  const total = Math.round(
    DIMS.reduce((s, d) => s + scores[d.key] * d.weight, 0) / 100
  );
  return { scores, total };
}

// Scale tops out at A-. There is no literal A.
function grade(total) {
  if (total >= 85) return { letter: "A-", band: "Leading" };
  if (total >= 75) return { letter: "B+", band: "Strong" };
  if (total >= 65) return { letter: "B", band: "Developing" };
  if (total >= 55) return { letter: "C+", band: "Notable exposure" };
  if (total >= 45) return { letter: "C", band: "High exposure" };
  return { letter: "D", band: "Critical exposure" };
}

const VERDICT = {
  "A-": "You're ahead of most peers. The gaps that remain are the ones attackers target first.",
  "B+": "A solid foundation with real blind spots. A focused effort closes the distance to leading.",
  "B": "The basics are forming, but coverage is uneven and your AI footprint is outpacing your controls.",
  "C+": "Meaningful exposure. Several core defenses are missing while AI is already in production.",
  "C": "High exposure. Your AI is live and largely undefended against AI-native attacks.",
  "D": "Critical exposure. There is little standing between your AI systems and an AI-native attack.",
};

const EXPOSURES = {
  guardrails: {
    name: "Unprotected runtime",
    detail: "Your AI surface has no dedicated defense against prompt injection, data leakage, and unsafe outputs at inference time.",
    cap: "VirtueGuard runtime guardrails (TextGuard, ActionGuard)",
  },
  testing: {
    name: "Untested attack surface",
    detail: "AI is shipping without adversarial testing, so you find failures in production instead of before it.",
    cap: "VirtueRed continuous red-teaming",
  },
  shadowAI: {
    name: "Shadow AI blind spots",
    detail: "You can't protect AI usage you can't see. Tools adopted outside IT are an unmanaged data and compliance risk.",
    cap: "Shadow AI Detection (AgentSuite-Blue)",
  },
  surface: {
    name: "Expanding agentic attack surface",
    detail: "Autonomous and tool-using agents take real actions, which widens your blast radius faster than traditional controls cover it.",
    cap: "ActionGuard and MCPGuard",
  },
  governance: {
    name: "Policy without enforcement",
    detail: "A policy that isn't technically enforced is documentation, not a control. Usage drifts from intent.",
    cap: "PolicyGuard",
  },
  detection: {
    name: "No AI-aware detection",
    detail: "General monitoring won't catch an agent acting out of bounds or an LLM exfiltrating data.",
    cap: "AgentSuite-Blue monitoring and response",
  },
};

/* ------------------------------------------------------------------ */
/*  Virtue AI research — surfaced as "learn more" on weak dimensions  */
/*  (link/blurb copy is draft and safe to reword)                     */
/* ------------------------------------------------------------------ */
const RESEARCH = {
  decodingtrust: {
    title: "DecodingTrust: A Comprehensive Assessment of Trustworthiness in GPT Models",
    blurb: "In this award-winning paper, Virtue AI researchers provide a comprehensive trustworthiness-focused evaluation of GPT-4 and GPT-3.5 across metrics like toxicity, stereotype bias, adversarial robustness, and more.",
    url: "https://www.virtueai.com/research/decodingtrust-a-comprehensive-assessment-of-trustworthiness-in-gpt-models",
  },
  dtap: {
    title: "DecodingTrust-Agent Platform (DTap): Controllable, Interactive Red-Teaming for AI Agents",
    blurb: "Virtue AI conducted large-scale evaluations of modern AI agents across realistic environments. The result? Today's agents are systematically vulnerable.",
    url: "https://www.virtueai.com/research/decodingtrust-agent-platform-dtap-a-controllable-and-interactive-red-teaming-platform-for-ai-agents",
  },
  mastrike: {
    title: "MAStrike: Shapley-Guided Collusive Red-Teaming on Multi-Agent Systems",
    blurb: "Our research team and collaborators at Wells Fargo and Salesforce built the first method that scores each agent's contribution to a system's vulnerability, then targets the highest-leverage coalition.",
    url: "https://www.virtueai.com/research/mastrike-shapley-guided-collusive-red-teaming-on-multi-agent-systems",
  },
  devopsgym: {
    title: "DevOps-Gym: Benchmarking AI Agents in the Software DevOps Cycle",
    blurb: "We introduce DevOps-Gym, the first end-to-end benchmark for evaluating AI agents across core DevOps workflows: build and configuration, monitoring, issue resolving, and test generation.",
    url: "https://www.virtueai.com/research/devops-gym-benchmarking-ai-agents-in-software-devops-cycle",
  },
};

// Each scorecard dimension maps to the most relevant paper. Shadow AI and
// Governance have no dedicated paper, so they fall back to DecodingTrust.
const DIM_RESEARCH = {
  guardrails: "decodingtrust",
  testing: "dtap",
  surface: "mastrike",
  detection: "devopsgym",
  shadowAI: "decodingtrust",
  governance: "decodingtrust",
};

/* ------------------------------------------------------------------ */
/*  Labels for the sales handoff                                       */
/* ------------------------------------------------------------------ */
const LABELS = {
  size: { u50: "Under 50", s250: "50-250", s1000: "250-1k", o1000: "1k+" },
  industry: {
    aiml: "AI / ML product", fintech: "fintech", banking: "banking / insurance",
    healthtech: "healthtech", retail: "retail / e-commerce",
    manufacturing: "manufacturing / industrial",
    devtools: "dev tools / infrastructure", saas: "B2B SaaS", other: "their sector",
  },
  intent: {
    custask: "a customer is asking how they secure their AI",
    shipping: "shipping AI faster than they can secure it",
    compliance: "preparing for compliance",
    benchmark: "benchmarking where they stand",
  },
};
const DEP_LABEL = {
  core: "core-product LLM features", chatbots: "customer-facing chatbots",
  agents: "autonomous agents",
  mcp: "MCP / tool-using agents", rag: "RAG over proprietary data",
  custom: "fine-tuned / self-hosted models", codegen: "AI code generation",
  copilots: "internal copilots",
};

function temperature(intent) {
  if (intent === "custask" || intent === "shipping") return "Hot";
  if (intent === "compliance") return "Warm";
  return "Cool";
}

// Legal disclaimer — single source of truth, shown on the landing page and in
// the footer on subsequent pages.
const DISCLAIMER = "This scorecard is provided for general informational and educational purposes only. It does not constitute an official security diagnosis, audit, assessment, certification, or professional advice of any kind. Any grades, scores, and benchmark figures are illustrative and should not be relied upon for any security, compliance, or business decision. Virtue AI makes no representation, warranty, or guarantee, express or implied, as to the accuracy or completeness of these results or any security outcome, and disclaims all liability arising from their use to the fullest extent permitted by law.";

/* ------------------------------------------------------------------ */
/*  Radar (hand-rolled SVG, no chart library)                         */
/* ------------------------------------------------------------------ */
function RadarSVG({ data }) {
  const S = 380, cx = S / 2, cy = S / 2, R = 118, n = data.length;
  const ang = (i) => ((-90 + (360 / n) * i) * Math.PI) / 180;
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  const ring = (r) => data.map((_, i) => pt(i, R * r).join(",")).join(" ");
  const dataPoly = data.map((d, i) => pt(i, R * (d.score / 100)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${S} ${S}`} width="100%" style={{ maxWidth: 460 }}>
      {[0.25, 0.5, 0.75, 1].map((r, i) => (
        <polygon key={i} points={ring(r)} fill="none" stroke="rgba(0,0,0,0.14)" />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(0,0,0,0.12)" />;
      })}
      <polygon points={dataPoly} fill="#40429B" fillOpacity="0.24" stroke="#40429B" strokeWidth="2.5" strokeLinejoin="round" />
      {data.map((d, i) => {
        const [x, y] = pt(i, R * (d.score / 100));
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#40429B" />;
      })}
      {data.map((d, i) => {
        const [lx, ly] = pt(i, R + 22);
        const anchor = Math.abs(lx - cx) < 12 ? "middle" : lx > cx ? "start" : "end";
        return (
          <text key={i} x={lx} y={ly} fontFamily="Inter" fontSize="13" fontWeight="500"
            fill="#000" textAnchor={anchor} dominantBaseline="middle">
            {d.dim}
          </text>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
function Scorecard() {
  const [phase, setPhase] = useState("intro");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [showHandoff, setShowHandoff] = useState(false);
  const [animScore, setAnimScore] = useState(0);
  const advanceTimer = useRef(null);

  const result = useMemo(
    () => (phase === "result" ? computeScores(answers) : null),
    [phase, answers]
  );
  const g = result ? grade(result.total) : null;

  useEffect(() => {
    if (phase !== "result" || !result) return;
    let raf;
    const start = performance.now();
    const dur = 900;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setAnimScore(Math.round(result.total * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, result]);

  const Q = QUESTIONS[qi];
  const total = QUESTIONS.length;

  function pickSingle(id, v) {
    setAnswers((a) => ({ ...a, [id]: v }));
    // Debounce the auto-advance: a second tap within the window (e.g. the user
    // changing their answer) replaces the pending advance instead of queueing a
    // second one. Without this, two advances fire and qi jumps by two — skipping
    // a question, or running off the end of QUESTIONS and crashing the app.
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => advance(), 220);
  }
  function toggleMulti(id, v) {
    setAnswers((a) => {
      const cur = a[id] || [];
      return {
        ...a,
        [id]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v],
      };
    });
  }
  function advance() {
    setQi((i) => {
      if (i < total - 1) return i + 1;
      setPhase("result");
      return i;
    });
  }
  function back() {
    clearTimeout(advanceTimer.current);
    if (qi === 0) setPhase("intro");
    else setQi((i) => i - 1);
  }
  const validEmail = /\S+@\S+\.\S+/.test(email);

  /* ---------------------------- INTRO --------------------------- */
  if (phase === "intro") {
    return (
      <Shell footerNote={false}>
        <div className="sc-fade" style={{ maxWidth: 620, margin: "0 auto", paddingTop: 40 }}>
          <p className="sc-eyebrow" style={{ marginBottom: 22 }}>By Virtue AI</p>
          <h1 className="sc-display" style={{ fontSize: "clamp(34px,6vw,52px)", lineHeight: 1.08, margin: "0 0 20px", fontWeight: 700 }}>
            2-Minute AI Security Scorecard
          </h1>
          <p className="sc-display" style={{ fontSize: "clamp(20px,3vw,25px)", lineHeight: 1.3, margin: "0 0 16px", maxWidth: 560, fontWeight: 400 }}>
            Benchmark your AI risk surface and find your highest-priority exposures.
          </p>
          <p style={{ fontSize: 18, margin: "0 0 14px", maxWidth: 540 }}>
            Nine questions. One honest grade on how your agents, models, and chatbots hold up.
          </p>
          <p className="sc-muted" style={{ fontSize: 15, margin: "0 0 34px" }}>
            Built by Virtue AI.
          </p>
          <button className="sc-btn" onClick={() => setPhase("survey")}>
            Discover My AI Vulnerabilities <ArrowRight size={18} />
          </button>
          <p className="sc-muted" style={{ fontSize: 13, marginTop: 18 }}>
            No sign-up to begin. You'll see your grade before anything else.
          </p>
          <p className="sc-muted" style={{ fontSize: 11, lineHeight: 1.5, marginTop: 30, maxWidth: 560 }}>
            {DISCLAIMER}
          </p>
        </div>
      </Shell>
    );
  }

  /* --------------------------- SURVEY --------------------------- */
  if (phase === "survey") {
    const multiSel = answers[Q.id] || [];
    return (
      <Shell progress={qi / total}>
        <div key={qi} className="sc-fade" style={{ maxWidth: 620, margin: "0 auto", paddingTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
            <span className="sc-eyebrow">{Q.eyebrow}</span>
            <span className="sc-muted" style={{ fontSize: 13 }}>{qi + 1} / {total}</span>
          </div>
          <h2 className="sc-display" style={{ fontSize: "clamp(22px,3.4vw,28px)", lineHeight: 1.2, margin: "0 0 8px", fontWeight: 700 }}>
            {Q.q}
          </h2>
          {Q.helper
            ? <p className="sc-muted" style={{ fontSize: 15, margin: "0 0 22px" }}>{Q.helper}</p>
            : <div style={{ height: 16 }} />}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Q.options.map((o) => {
              const on = Q.type === "multi" ? multiSel.includes(o.v) : answers[Q.id] === o.v;
              return (
                <button key={o.v} className="sc-opt" data-on={on}
                  onClick={() => Q.type === "multi" ? toggleMulti(Q.id, o.v) : pickSingle(Q.id, o.v)}>
                  <span className="sc-tick">{on && <Check size={13} color="#fff" />}</span>
                  {o.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 26 }}>
            <button className="sc-btn sc-btn-ghost" onClick={back}>
              <ArrowLeft size={15} /> Back
            </button>
            {Q.type === "multi" && (
              <button className="sc-btn" disabled={multiSel.length === 0} onClick={advance}>
                Continue <ArrowRight size={17} />
              </button>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  /* --------------------------- RESULT --------------------------- */
  const ranked = [...DIMS].sort((a, b) => result.scores[a.key] - result.scores[b.key]);
  const weakest = ranked.slice(0, 3);
  // Dimensions where the respondent already scores strongly (>85). When present,
  // the exposures section acknowledges their coverage before pivoting to the gaps.
  const strong = DIMS.filter((d) => result.scores[d.key] > 85);
  const fmtList = (a) =>
    a.length <= 1 ? (a[0] || "") :
    a.length === 2 ? `${a[0]} and ${a[1]}` :
    `${a.slice(0, -1).join(", ")}, and ${a[a.length - 1]}`;
  const radarData = DIMS.map((d) => ({ dim: d.label, score: result.scores[d.key] }));
  const peerMedian = 56;

  // Research to point people to: the papers tied to their weakest dimensions,
  // plus footprint-driven picks (agents -> MAStrike, AI codegen -> DevOps-Gym).
  const researchPicks = (() => {
    const ids = [];
    const add = (id) => { if (id && !ids.includes(id)) ids.push(id); };
    weakest.forEach((d) => add(DIM_RESEARCH[d.key]));
    const deps = answers.deployments || [];
    if (deps.includes("agents") || deps.includes("mcp")) add("mastrike");
    if (deps.includes("codegen")) add("devopsgym");
    return ids.slice(0, 3).map((id) => RESEARCH[id]);
  })();

  return (
    <Shell>
      <div className="sc-fade" style={{ maxWidth: 760, margin: "0 auto", paddingTop: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p className="sc-eyebrow" style={{ marginBottom: 18 }}>Your AI security grade</p>
          <div className="sc-display" style={{ fontSize: "clamp(88px,18vw,150px)", lineHeight: .9, color: "var(--accent)", fontWeight: 700 }}>
            {g.letter}
          </div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: "10px 0 2px" }}>{g.band}</p>
          <p className="sc-muted" style={{ fontSize: 15, margin: 0 }}>
            {animScore} / 100 &nbsp;·&nbsp; peer median {peerMedian} (illustrative)
          </p>
          <p style={{ maxWidth: 480, margin: "20px auto 0", fontSize: 16 }}>{VERDICT[g.letter]}</p>
        </div>

        {!unlocked ? (
          <div className="sc-card" style={{ padding: "30px 28px", maxWidth: 460, margin: "0 auto", textAlign: "center" }}>
            <Lock size={22} color="var(--accent)" />
            <h3 className="sc-display" style={{ fontSize: 22, margin: "12px 0 6px", fontWeight: 700 }}>
              Unlock your full exposure map
            </h3>
            <p className="sc-muted" style={{ fontSize: 14, margin: "0 0 18px" }}>
              See your six-dimension breakdown and your three highest-priority exposures.
            </p>
            <input className="sc-input" type="email" placeholder="Work email"
              value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 12 }} />
            <button className="sc-btn" disabled={!validEmail} onClick={() => setUnlocked(true)}
              style={{ width: "100%", justifyContent: "center" }}>
              Reveal my exposure map <ArrowRight size={17} />
            </button>
            <p className="sc-muted" style={{ fontSize: 12, marginTop: 14, lineHeight: 1.5 }}>
              By continuing, you agree that Virtue AI may use your responses and contact you
              about your results and related products. See our{" "}
              <a href="#privacy" style={{ color: "var(--accent)" }}>Privacy Policy</a>. You can opt out anytime.
            </p>
          </div>
        ) : (
          <div className="sc-fade">
            <div className="sc-card" style={{ padding: "28px 22px 20px", marginBottom: 24 }}>
              <p className="sc-eyebrow" style={{ textAlign: "center", marginBottom: 4 }}>Posture by dimension</p>
              <h3 className="sc-display" style={{ textAlign: "center", fontSize: "clamp(20px,3vw,26px)", fontWeight: 700, margin: "0 0 4px" }}>
                The shape of your exposure
              </h3>
              <p className="sc-muted" style={{ textAlign: "center", fontSize: 14, margin: "0 0 4px" }}>
                The smaller the shape, the wider the opening for an attacker.
              </p>
              <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "6px 0 2px" }}>
                <RadarSVG data={radarData} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "14px 28px", marginTop: 6, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
                {DIMS.map((d) => {
                  const s = result.scores[d.key];
                  return (
                    <div key={d.key}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                        <span style={{ fontWeight: 500 }}>{d.label}</span>
                        <span className="sc-muted">{s}</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(0,0,0,0.08)", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${s}%`, background: "var(--accent)", borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="sc-eyebrow" style={{ marginBottom: strong.length ? 8 : 14 }}>Your top exposures</p>
            {strong.length > 0 && (
              <p style={{ fontSize: 15, margin: "0 0 16px", maxWidth: 620 }}>
                You've built real breadth — {fmtList(strong.map((d) => d.label))} {strong.length > 1 ? "are" : "is"} already in strong shape. But AI-native threats evolve faster than any single control, and even a strong posture leaves openings. These are your highest-priority gaps right now:
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {weakest.map((d, i) => {
                const ex = EXPOSURES[d.key];
                const paper = RESEARCH[DIM_RESEARCH[d.key]];
                return (
                  <div key={d.key} className="sc-card" style={{ padding: "18px 20px", display: "flex", gap: 16 }}>
                    <ShieldAlert size={20} color="var(--accent)" style={{ marginTop: 2 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 16, margin: "0 0 4px" }}>
                        {i + 1}. {ex.name}
                        <span className="sc-muted" style={{ fontWeight: 400 }}> · {result.scores[d.key]}/100</span>
                      </p>
                      <p style={{ fontSize: 15, margin: "0 0 6px" }}>{ex.detail}</p>
                      <p className="sc-muted" style={{ fontSize: 13, margin: 0 }}>Where Virtue AI helps: {ex.cap}</p>
                      {paper && (
                        <a href={paper.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                          Read the research <ArrowRight size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
              <h3 className="sc-display" style={{ fontSize: "clamp(22px,3.4vw,28px)", margin: "0 0 10px", fontWeight: 700 }}>
                You've seen the gaps. Now close them.
              </h3>
              <p style={{ fontSize: 16, maxWidth: 460, margin: "0 auto 22px" }}>
                Thirty minutes with a Virtue AI security engineer turns this scorecard into a prioritized plan for the exposures you just saw.
              </p>
              <CTAButton />
            </div>

            {researchPicks.length > 0 && (
              <div style={{ marginTop: 44, borderTop: "1px solid var(--line)", paddingTop: 28 }}>
                <p className="sc-eyebrow" style={{ marginBottom: 6 }}>Go deeper with our research</p>
                <p className="sc-muted" style={{ fontSize: 14, margin: "0 0 16px" }}>
                  Peer-reviewed work from Virtue AI on the exposures you scored lowest on.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {researchPicks.map((r) => (
                    <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="sc-card"
                      style={{ padding: "16px 20px", textDecoration: "none", color: "var(--ink)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 4px", color: "var(--accent)" }}>{r.title}</p>
                        <p className="sc-muted" style={{ fontSize: 14, margin: 0 }}>{r.blurb}</p>
                      </div>
                      <ArrowRight size={16} color="var(--accent)" style={{ marginTop: 3 }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 40, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
              <button className="sc-btn sc-btn-ghost" onClick={() => setShowHandoff((s) => !s)} style={{ fontSize: 13 }}>
                {showHandoff ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                Internal preview: what sales receives
              </button>
              {showHandoff && (
                <div className="sc-card sc-fade" style={{ padding: "20px 22px", marginTop: 10, fontSize: 14 }}>
                  <p className="sc-muted" style={{ fontSize: 12, margin: "0 0 14px" }}>
                    Hidden in production. Shown here so the team can see the enriched lead the form generates.
                  </p>
                  <Handoff answers={answers} result={result} g={g} weakest={weakest} email={email} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */
function Logo() {
  return (
    <svg height="30" viewBox="0 0 187 172" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Virtue AI">
      <g clipPath="url(#vlogo)">
        <path d="M118.71 50.6718L79.1191 120.724L84.5291 130.312L134.887 41.1113H85.774V50.6718H118.71Z" fill="#312E81" />
        <path d="M85.7744 25.1797V34.7402H145.668L88.1209 136.683L93.5178 146.244L161.84 25.1797H85.7744Z" fill="#312E81" />
        <path d="M62.9738 60.2326L84.5158 98.4212L89.9062 88.8607L83.512 77.5323L83.5251 77.7457L78.1999 68.2987L78.252 68.2053L53.7964 25.1797H43.0352L57.5768 50.6721L62.9738 60.2326Z" fill="#312E81" />
        <path d="M46.7962 44.3007L35.8785 25.1797H25.0391L75.5276 114.353L80.918 104.793L46.7962 44.3007Z" fill="#312E81" />
        <path d="M100.081 140.947L100.645 139.97L104.596 140.505L104.626 140.454L102.187 137.3L102.751 136.323L107.16 138.869L106.717 139.635L103.688 137.886L103.665 137.927L105.977 140.887L105.647 141.46L101.921 140.933L101.897 140.974L104.932 142.726L104.49 143.493L100.081 140.947Z" fill="#312E81" />
        <path d="M98.3287 145.529L97.6592 145.143L99.6901 141.625L100.36 142.012L99.5728 143.374L103.312 145.533L102.855 146.325L99.1154 144.166L98.3287 145.529Z" fill="#312E81" />
      </g>
      <defs>
        <clipPath id="vlogo"><rect width="136.878" height="121.424" fill="white" transform="translate(25 25)" /></clipPath>
      </defs>
    </svg>
  );
}

function Shell({ children, progress, footerNote = true }) {
  return (
    <div className="sc-root">
      <style>{CSS}</style>
      <div style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />
          <span className="sc-muted" style={{ fontSize: 12, letterSpacing: ".04em" }}>2-Minute AI Security Scorecard</span>
        </div>
        {progress != null && (
          <div className="sc-prog"><span style={{ width: `${progress * 100}%` }} /></div>
        )}
      </div>
      <div style={{ padding: "32px 24px 40px" }}>{children}</div>
      <footer style={{ borderTop: "1px solid var(--line)", padding: "18px 24px 40px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", fontSize: 12, lineHeight: 1.6, color: "var(--muted)" }}>
          {footerNote && <span>{DISCLAIMER}{" "}</span>}
          © Virtue AI. <a href="#privacy" style={{ color: "var(--accent)" }}>Privacy Policy</a>.
        </div>
      </footer>
    </div>
  );
}

function CTAButton() {
  const [done, setDone] = useState(false);
  return (
    <button className="sc-btn" onClick={() => setDone(true)} disabled={done}>
      {done
        ? <React.Fragment><Check size={17} /> We'll be in touch</React.Fragment>
        : <React.Fragment>Book my deep-dive <ArrowRight size={17} /></React.Fragment>}
    </button>
  );
}

function Handoff({ answers, result, g, weakest, email }) {
  const deps = (answers.deployments || []).map((d) => DEP_LABEL[d]).join(", ") || "none reported";
  const temp = temperature(answers.intent);
  const tempColor = temp === "Hot" ? "var(--accent)" : "var(--muted)";
  const entry = weakest.slice(0, 2).map((d) => EXPOSURES[d.key].cap).join("; ");
  const weakNames = weakest.slice(0, 2).map((d) => EXPOSURES[d.key].name.toLowerCase()).join(" and ");
  const talk = `${LABELS.size[answers.size]} ${LABELS.industry[answers.industry]} org running ${deps}. Weakest areas: ${weakNames}. Likely entry points: ${entry}. Timing: ${LABELS.intent[answers.intent]}.`;

  const Row = ({ k, v }) => (
    <div style={{ display: "flex", gap: 12, padding: "6px 0", borderBottom: "1px dashed var(--line)" }}>
      <span className="sc-muted" style={{ flex: "0 0 130px", fontSize: 13 }}>{k}</span>
      <span style={{ fontSize: 14 }}>{v}</span>
    </div>
  );

  return (
    <div>
      <Row k="Email" v={email || "(captured at gate)"} />
      <Row k="Company size" v={LABELS.size[answers.size]} />
      <Row k="Industry" v={LABELS.industry[answers.industry]} />
      <Row k="In production" v={deps} />
      <Row k="Grade / score" v={`${g.letter} · ${result.total}/100`} />
      <Row k="Weakest two" v={weakest.slice(0, 2).map((d) => `${EXPOSURES[d.key].name} (${result.scores[d.key]})`).join(", ")} />
      <Row k="Intent" v={LABELS.intent[answers.intent]} />
      <Row k="Lead temp" v={<strong style={{ color: tempColor }}>{temp}</strong>} />
      <Row k="Suggested entry" v={entry} />
      <div style={{ marginTop: 14 }}>
        <p className="sc-eyebrow" style={{ marginBottom: 6 }}>Auto-generated talk track</p>
        <p style={{ fontSize: 14, fontStyle: "italic", margin: 0 }}>{talk}</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Scorecard />);
