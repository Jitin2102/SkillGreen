import { useEffect, useRef, useState } from "react";
import {
  API_BASE, PREDICT_PATH, OPTIONS_PATH, REQUEST_TIMEOUT_MS, INITIAL_FORM,
  toPayload, fromResponse, PILLARS, LIMITS, LEVEL_VAR, NAV,
} from "./config.js";

function useTheme() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || "light");
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("sg-theme", next); } catch { /* storage unavailable */ }
    setTheme(next);
  };
  return [theme, toggle];
}

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

function NavBar() {
  const [theme, toggleTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const active = useActiveSection(NAV.map((n) => n.id));
  return (
    <header className="nav">
      <div className="wrap">
        <a className="brand" href="#assess"><i aria-hidden="true" />SkillGreen</a>
        <button className="icon-btn menu-btn" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
        <nav id="nav-links" className={`links${open ? " open" : ""}`} aria-label="Main">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} aria-current={active === n.id} onClick={() => setOpen(false)}>{n.label}</a>
          ))}
          <button className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </nav>
      </div>
    </header>
  );
}

function Result({ data }) {
  const lv = `var(${LEVEL_VAR[data.category] || "--muted"})`;
  const weak = PILLARS.find((p) => p.key === data.weakest);
  return (
    <div>
      <p className="muted" style={{ marginBottom: 6 }}>ESG readiness</p>
      <span className="level" style={{ "--lv": lv }}>{data.category}</span>
      <p className="muted" style={{ marginTop: 8 }}>Model confidence: {Math.round(data.confidence * 100)}%</p>
      {PILLARS.map((p) => {
        const v = data.pillars?.[p.key] ?? 0;
        return (
          <div className="pillar" key={p.key}>
            <div className="pillar-head"><span>{p.label}</span><span>{v} / {p.max}</span></div>
            <div className="track" role="img" aria-label={`${p.label} score ${v} out of ${p.max}`}>
              <div className="fill" style={{ "--c": `var(${p.cssVar})`, width: `${Math.min(100, (v / p.max) * 100)}%` }} />
            </div>
          </div>
        );
      })}
      {weak && (
        <div className="weak" style={{ "--c": `var(${weak.cssVar})` }}>
          <strong>Focus next: {weak.label}.</strong> This is your lowest-scoring pillar.
        </div>
      )}
    </div>
  );
}

function Assess() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const slow = useRef(null);
  const [waking, setWaking] = useState(false);
  const [options, setOptions] = useState(null); // { industries, education_levels } from GET /options
  const [optionsError, setOptionsError] = useState(false);

  const loadOptions = () => {
    setOptionsError(false);
    fetch(API_BASE + OPTIONS_PATH)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((o) => {
        setOptions(o);
        setForm((f) => ({ ...f, current_industry: f.current_industry || o.industries[0], education_level: f.education_level || o.education_levels[0] }));
      })
      .catch(() => setOptionsError(true));
  };
  useEffect(loadOptions, []); // also wakes the Render instance on page load

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    setStatus("loading"); setError(""); setWaking(false);
    slow.current = setTimeout(() => setWaking(true), 4000);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(API_BASE + PREDICT_PATH, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form)), signal: ctrl.signal,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail = Array.isArray(body.detail) ? body.detail.map((d) => `${d.loc?.slice(-1)}: ${d.msg}`).join("; ") : body.detail;
        throw new Error(detail || body.error || `Server returned ${res.status}`);
      }
      setData(fromResponse(await res.json()));
      setStatus("done");
    } catch (err) {
      setError(err.name === "AbortError" ? "The server took too long to respond. Try again in a moment." : err.message || "Could not reach the server.");
      setStatus("error");
    } finally {
      clearTimeout(timer); clearTimeout(slow.current); setWaking(false);
    }
  }

  return (
    <section id="assess" className="hero">
      <div className="wrap">
        <h1>See how ready you are for ESG work</h1>
        <p className="muted">Enter your professional profile to get a readiness level and a score for each Environmental, Social and Governance pillar.</p>
        <div className="grid" style={{ marginTop: 24 }}>
          <form className="card" onSubmit={submit}>
            <div className="field">
              <label htmlFor="industry">Industry</label>
              <select id="industry" required value={form.current_industry} onChange={set("current_industry")} disabled={!options}>
                {(options?.industries || []).map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="education">Education</label>
              <select id="education" required value={form.education_level} onChange={set("education_level")} disabled={!options}>
                {(options?.education_levels || []).map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="years">Years of experience</label>
              <input id="years" type="number" min={LIMITS.years.min} max={LIMITS.years.max} step="1" required value={form.years_experience} onChange={set("years_experience")} />
            </div>
            <div className="field">
              <label htmlFor="skills">Relevant ESG skills</label>
              <input id="skills" type="number" min={LIMITS.skills.min} max={LIMITS.skills.max} step="1" required value={form.relevant_skills_count} onChange={set("relevant_skills_count")} />
            </div>
            <fieldset>
              <legend>Your ESG background</legend>
              <label className="check"><input type="checkbox" checked={form.has_esg_certification} onChange={set("has_esg_certification")} />Holds an ESG certification</label>
              <label className="check"><input type="checkbox" checked={form.environmental_project_exposure} onChange={set("environmental_project_exposure")} />Environmental work experience</label>
              <label className="check"><input type="checkbox" checked={form.social_impact_exposure} onChange={set("social_impact_exposure")} />Social work experience</label>
              <label className="check"><input type="checkbox" checked={form.governance_exposure} onChange={set("governance_exposure")} />Governance work experience</label>
            </fieldset>
            <button className="btn" disabled={status === "loading" || !options}>{status === "loading" ? "Assessing..." : "Assess readiness"}</button>
            {!options && !optionsError && <p className="muted" style={{ marginTop: 12 }}>Connecting to the server...</p>}
            {optionsError && <div className="alert" role="alert">Could not load form options. <button type="button" className="icon-btn" onClick={loadOptions}>Retry</button></div>}
            {waking && <p className="muted" style={{ marginTop: 12 }}>The server is waking up. The first request can take up to 50 seconds.</p>}
            {status === "error" && <div className="alert" role="alert">{error}</div>}
          </form>
          <div className="card" aria-live="polite">
            {status === "done" && data ? <Result data={data} /> : <div className="empty">Your results will appear here.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <Assess />
        <section id="method"><div className="wrap">
          <h2>How it works</h2>
          <ol className="steps">
            <li>Your profile is validated, so out-of-range values are rejected.</li>
            <li>Environmental, Social and Governance scores are calculated from your answers.</li>
            <li>A Gradient Boosting model classifies readiness as Low, Medium or High.</li>
            <li>You see the confidence and the pillar to improve first.</li>
          </ol>
        </div></section>
        <section id="about"><div className="wrap">
          <h2>About SkillGreen</h2>
          <p>SkillGreen was built during the 1M1B Green Skills &amp; Applied AI internship. It is a decision-support tool, not a hiring decision-maker.</p>
          <p className="muted">The model is trained on synthetic profiles, so scores show how a profile matches the project's ESG framework, not real hiring outcomes.</p>
        </div></section>
      </main>
      <footer><div className="wrap">SkillGreen &middot; <a href={`${API_BASE}/docs`}>API docs</a> &middot; <a href="https://github.com/Jitin2102/SkillGreen">GitHub</a></div></footer>
    </>
  );
}
