import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Leaf,
    Users,
    ScaleIcon,
    BadgeCheck,
    ArrowRight,
    LogIn,
    FileText,
    Target,
    BarChart3,
    TrendingUp,
    LayoutDashboard,
    ClipboardList,
} from "lucide-react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { THRESHOLDS } from "../config";
import { CATEGORY_TONE } from "../lib/designConstants";

/* Live score preview                                                  */

const YEARS_WEIGHT = 1;
const SKILLS_WEIGHT = 3;
const FLAG_BONUS = 6;

const FLAGS = [
    {
        key: "environmental",
        label: "Environmental project",
        icon: Leaf,
        on: "bg-[var(--color-environmental-light)] text-[var(--color-environmental)] border-[var(--color-environmental)]/40",
        bar: "bg-[var(--color-environmental)]",
    },
    {
        key: "social",
        label: "Social-impact work",
        icon: Users,
        on: "bg-[var(--color-social-light)] text-[var(--color-social)] border-[var(--color-social)]/40",
        bar: "bg-[var(--color-social)]",
    },
    {
        key: "governance",
        label: "Governance or compliance",
        icon: ScaleIcon,
        on: "bg-[var(--color-governance-light)] text-[var(--color-governance)] border-[var(--color-governance)]/40",
        bar: "bg-[var(--color-governance)]",
    },
    {
        key: "certification",
        label: "ESG certification",
        icon: BadgeCheck,
        on: "bg-[var(--color-ochre-light)] text-[var(--color-ochre-dark)] border-[var(--color-ochre)]/50",
        bar: "bg-[var(--color-ochre)]",
    },
];

function Slider({ id, label, value, min, max, onChange }) {
    return (
        <div className="mb-4">
            <div className="flex justify-between items-baseline mb-1.5 text-xs font-medium">
                <label htmlFor={id} className="!text-ink">{label}</label>
                <span className="tabular-nums font-bold text-ink">{value}</span>
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 cursor-pointer !bg-transparent accent-[var(--color-primary)]"
            />
        </div>
    );
}

function ScorePreview() {
    const [years, setYears] = useState(4);
    const [skills, setSkills] = useState(3);
    const [flags, setFlags] = useState({ environmental: true, social: false, governance: false, certification: false });

    const rows = [
        { label: "Experience", value: years * YEARS_WEIGHT, bar: "bg-[var(--color-ink)]" },
        { label: "Skills", value: skills * SKILLS_WEIGHT, bar: "bg-[var(--color-primary)]" },
        ...FLAGS.map((f) => ({ label: f.label, value: flags[f.key] ? FLAG_BONUS : 0, bar: f.bar })),
    ];
    const score = rows.reduce((sum, r) => sum + r.value, 0);
    const category = score < THRESHOLDS.low ? "Low" : score < THRESHOLDS.medium ? "Medium" : "High";
    const tone = CATEGORY_TONE[category];

    const scaleMax = THRESHOLDS.medium * 1.5;
    const lowPct = (THRESHOLDS.low / scaleMax) * 100;
    const medPct = ((THRESHOLDS.medium - THRESHOLDS.low) / scaleMax) * 100;
    const markerPct = Math.min((score / scaleMax) * 100, 100);
    const rowMax = 30;

    return (
        <div className="relative">
            {/* soft glow behind the card */}
            <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[var(--color-environmental)]/15 via-transparent to-[var(--color-ochre)]/20 blur-2xl"
            />
            <div className="relative bg-[var(--color-card)] border border-black/[0.09] rounded-2xl shadow-[0_24px_60px_-24px_rgba(30,50,40,0.35)] p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <p className="text-xs font-semibold text-ink/60 mb-1">Try the scoring</p>
                        <div className="flex items-baseline gap-2.5">
                            <span className="font-serif text-6xl font-bold leading-none tabular-nums text-ink">{score}</span>
                            <span className="text-sm text-ink/50 font-medium">points</span>
                        </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors duration-300 ${tone.bg} ${tone.text}`}>
                        {category} readiness
                    </span>
                </div>

                {/* Low / Medium / High scale */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full">
                            <div className="bg-[var(--color-ochre-light)]" style={{ width: `${lowPct}%` }} />
                            <div className="bg-[var(--color-ochre)]/45" style={{ width: `${medPct}%` }} />
                            <div className="flex-1 bg-[var(--color-environmental)]/55" />
                        </div>
                        <div
                            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[var(--color-ink)] bg-white shadow-md transition-[left] duration-500 ease-out"
                            style={{ left: `${markerPct}%` }}
                        />
                    </div>
                    <div className="flex mt-2 text-[10px] font-semibold text-ink/55">
                        <span style={{ width: `${lowPct}%` }}>Low</span>
                        <span style={{ width: `${medPct}%` }}>Medium</span>
                        <span className="flex-1 text-right">High</span>
                    </div>
                </div>

                <Slider id="demo-years" label="Years of experience" value={years} min={0} max={20} onChange={setYears} />
                <Slider id="demo-skills" label="Relevant skills" value={skills} min={0} max={10} onChange={setSkills} />

                <div className="grid grid-cols-2 gap-2 mb-6">
                    {FLAGS.map((f) => {
                        const Icon = f.icon;
                        const active = flags[f.key];
                        return (
                            <button
                                key={f.key}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setFlags((s) => ({ ...s, [f.key]: !s[f.key] }))}
                                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[11px] sm:text-xs font-semibold leading-tight transition-all duration-200 ${
                                    active ? f.on : "border-black/12 bg-white text-ink/55 hover:bg-black/[0.03]"
                                }`}
                            >
                                <Icon size={14} strokeWidth={2.25} className="shrink-0" />
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                <div className="border-t border-black/[0.08] pt-4">
                    <p className="text-[11px] font-semibold text-ink/60 mb-3">Where the points come from</p>
                    {rows.map((r) => (
                        <div key={r.label} className={`mb-2 transition-opacity ${r.value === 0 ? "opacity-40" : ""}`}>
                            <div className="flex justify-between text-[11px] font-medium text-ink mb-1">
                                <span>{r.label}</span>
                                <span className="tabular-nums">+{r.value}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-black/[0.07] overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${r.bar} transition-[width] duration-500 ease-out`}
                                    style={{ width: `${Math.min((r.value / rowMax) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mt-4 text-[10px] sm:text-[11px] leading-relaxed text-ink/50">
                    Illustrative preview of the scoring formula. Your real result comes from the trained model on the assessment page.
                </p>
            </div>
        </div>
    );
}

/* Page content                                                        */

const PILLARS = [
    {
        key: "environmental",
        label: "Environmental",
        icon: Leaf,
        accent: "border-[var(--color-environmental)]",
        color: "text-[var(--color-environmental)]",
        bg: "bg-[var(--color-environmental-light)]",
        desc: "Hands-on exposure to sustainability projects, emissions work, or environmental initiatives.",
        skills: ["Carbon accounting", "Renewable energy", "Environmental impact assessment"],
    },
    {
        key: "social",
        label: "Social",
        icon: Users,
        accent: "border-[var(--color-social)]",
        color: "text-[var(--color-social)]",
        bg: "bg-[var(--color-social-light)]",
        desc: "Experience with community impact, diversity programs, or social-good initiatives.",
        skills: ["Diversity & inclusion", "Community engagement"],
    },
    {
        key: "governance",
        label: "Governance",
        icon: ScaleIcon,
        accent: "border-[var(--color-governance)]",
        color: "text-[var(--color-governance)]",
        bg: "bg-[var(--color-governance-light)]",
        desc: "Familiarity with compliance, ethics, reporting standards, or board-level accountability.",
        skills: ["Corporate governance", "Regulatory compliance", "Risk management"],
    },
];

const STEPS = [
    { title: "Build your profile", desc: "Industry, experience and education. Saved once and reused." },
    { title: "Add your resume", desc: "Optional. Upload a PDF or DOCX and see which ESG skills we detect." },
    { title: "Run the assessment", desc: "Get a Low, Medium or High rating with a score for each pillar." },
    { title: "Close the gap", desc: "See the skills you are missing and track your progress over time." },
];

const chip = "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold";

export default function Landing() {
    const { isAuthenticated } = useAuth();

    // Smooth scrolling for the navbar's in-page links, unless the visitor prefers reduced motion.
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const root = document.documentElement;
        const previous = root.style.scrollBehavior;
        root.style.scrollBehavior = "smooth";
        return () => {
            root.style.scrollBehavior = previous;
        };
    }, []);

    return (
        <div className="min-h-dvh text-ink relative font-sans overflow-x-hidden">
            <div className="bg-aurora">
                <div className="blob-3" />
            </div>
            <Header />

            {/* Hero */}
            <section className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 lg:pt-20 pb-14 sm:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
                <div className="lg:col-span-7">
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[var(--color-card)]/80 px-3.5 py-1.5 text-xs font-semibold text-ink/75 mb-6">
                        <span className="h-2 w-2 rounded-full bg-[var(--color-environmental)]" />
                        Resume-aware ESG readiness
                    </span>
                    <h1 className="font-serif text-4xl sm:text-6xl lg:text-[4.25rem] font-bold tracking-tight leading-[1.05] mb-6">
                        How ready are you for the sustainability-focused role you want?
                    </h1>
                    <p className="text-ink/70 text-base sm:text-lg leading-relaxed max-w-[540px] mb-9">
                        SkillGreen scores your ESG career readiness from your background, shows exactly how each input
                        moves the score, and points to the skills you still need.
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] !text-white px-7 py-3.5 text-sm font-bold tracking-wide shadow-md hover:bg-[var(--color-primary-dark)] hover:shadow-lg active:scale-[0.99] transition-all duration-200"
                                >
                                    <LayoutDashboard size={16} />
                                    Go to dashboard
                                </Link>
                                <Link
                                    to="/predict"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-[var(--color-card)]/70 px-7 py-3.5 text-sm font-bold tracking-wide hover:bg-black/[0.04] transition-colors"
                                >
                                    Run an assessment
                                    <ArrowRight size={16} />
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] !text-white px-7 py-3.5 text-sm font-bold tracking-wide shadow-md hover:bg-[var(--color-primary-dark)] hover:shadow-lg active:scale-[0.99] transition-all duration-200"
                                >
                                    Sign up free
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-[var(--color-card)]/70 px-7 py-3.5 text-sm font-bold tracking-wide hover:bg-black/[0.04] transition-colors"
                                >
                                    <LogIn size={16} />
                                    Log in
                                </Link>
                            </>
                        )}
                    </div>

                    <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-ink/65">
                        {["Free to use", "Resume upload is optional", "Every score is explained"].map((t) => (
                            <li key={t} className="flex items-center gap-2">
                                <BadgeCheck size={16} className="text-[var(--color-environmental)]" strokeWidth={2.25} />
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="lg:col-span-5 w-full md:max-w-[560px] lg:max-w-none">
                    <ScorePreview />
                </div>
            </section>

            {/* Pillars */}
            <section id="pillars" className="scroll-mt-24 w-full max-w-[1180px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
                <div className="max-w-[560px] mb-10 sm:mb-12">
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                        Three pillars, scored separately
                    </h2>
                    <p className="text-ink/65 text-sm sm:text-base leading-relaxed">
                        ESG readiness is not one number. You may be strong on governance and thin on environmental work,
                        and the score should show that.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {PILLARS.map((p) => {
                        const Icon = p.icon;
                        return (
                            <div
                                key={p.key}
                                className={`bg-[var(--color-card)] border border-black/[0.08] border-t-4 ${p.accent} rounded-xl p-5 sm:p-6 shadow-sm`}
                            >
                                <div className={`inline-flex items-center justify-center h-11 w-11 rounded-full ${p.bg} mb-5`}>
                                    <Icon size={20} className={p.color} strokeWidth={2.25} />
                                </div>
                                <h3 className="font-serif text-xl font-bold mb-2">{p.label}</h3>
                                <p className="text-ink/65 text-sm leading-relaxed mb-5">{p.desc}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {p.skills.map((s) => (
                                        <span key={s} className={`${chip} ${p.bg} ${p.color}`}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Features */}
            <section id="features" className="scroll-mt-24 w-full max-w-[1180px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
                <div className="max-w-[560px] mb-10 sm:mb-12">
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                        More than a single score
                    </h2>
                    <p className="text-ink/65 text-sm sm:text-base leading-relaxed">
                        Resume parsing and skill matching use clear, deterministic rules. The one trained model is kept for
                        the one job that is a real classification problem.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="md:col-span-2 bg-[var(--color-card)] border border-black/[0.08] rounded-xl p-6 sm:p-8 shadow-sm">
                        <FileText size={22} className="text-[var(--color-primary)] mb-4" strokeWidth={2.25} />
                        <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">Resume skill detection</h3>
                        <p className="text-ink/65 text-sm leading-relaxed max-w-[460px] mb-5">
                            Upload a PDF or DOCX. We match it against a curated ESG skill list and show you exactly what was
                            found, so nothing is a black box.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {["Carbon accounting", "ESG reporting", "Risk management", "Community engagement"].map((s) => (
                                <span key={s} className={`${chip} bg-[var(--color-primary-light)] text-[var(--color-primary)]`}>{s}</span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[var(--color-card)] border border-black/[0.08] rounded-xl p-6 sm:p-8 shadow-sm">
                        <Target size={22} className="text-[var(--color-ochre-dark)] mb-4" strokeWidth={2.25} />
                        <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">Skill-gap analysis</h3>
                        <p className="text-ink/65 text-sm leading-relaxed mb-5">
                            Compare what you have with what the next readiness tier expects.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            <span className={`${chip} bg-[var(--color-environmental-light)] text-[var(--color-environmental)]`}>ESG reporting</span>
                            <span className={`${chip} bg-[var(--color-ochre-light)] text-[var(--color-ochre-dark)]`}>Carbon accounting</span>
                        </div>
                    </div>

                    <div className="bg-[var(--color-card)] border border-black/[0.08] rounded-xl p-6 sm:p-8 shadow-sm">
                        <BarChart3 size={22} className="text-[var(--color-social)] mb-4" strokeWidth={2.25} />
                        <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">Scores you can read</h3>
                        <p className="text-ink/65 text-sm leading-relaxed">
                            See how experience, skills and exposure each add to your total, point by point.
                        </p>
                    </div>

                    <div className="md:col-span-2 bg-[var(--color-card)] border border-black/[0.08] rounded-xl p-6 sm:p-8 shadow-sm">
                        <TrendingUp size={22} className="text-[var(--color-governance)] mb-4" strokeWidth={2.25} />
                        <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">Progress you can track</h3>
                        <p className="text-ink/65 text-sm leading-relaxed max-w-[460px]">
                            Every assessment is saved to your dashboard with a trend over time, so you can see whether the work
                            you are doing is moving your readiness.
                        </p>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="scroll-mt-24 w-full max-w-[1180px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-10 sm:mb-14">How it works</h2>
                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                    <div aria-hidden="true" className="hidden lg:block absolute top-5 left-5 right-5 h-px bg-black/15" />
                    {STEPS.map((s, i) => (
                        <div key={s.title} className="relative">
                            <div className="relative flex items-center justify-center h-10 w-10 rounded-full bg-[var(--color-ink)] text-[var(--color-parchment)] mb-5 font-serif font-bold text-sm">
                                {i + 1}
                            </div>
                            <h3 className="font-bold text-base mb-1.5">{s.title}</h3>
                            <p className="text-ink/65 text-sm leading-relaxed max-w-[250px]">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Closing band: points to the assessment, not a second sign-up button */}
            <section className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
                <div className="rounded-3xl bg-[var(--color-primary)] px-6 py-12 sm:px-14 sm:py-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div className="max-w-[560px]">
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight !text-white mb-3">
                            See where you stand today.
                        </h2>
                        <p className="!text-white/75 text-sm sm:text-base leading-relaxed">
                            Run the assessment now. Log in first if you want the result saved to your dashboard.
                        </p>
                    </div>
                    <Link
                        to="/predict"
                        className="inline-flex items-center justify-center gap-2 self-start lg:self-auto rounded-full bg-white !text-[var(--color-primary)] px-7 py-3.5 text-sm font-bold tracking-wide shadow-md hover:bg-[var(--color-parchment)] active:scale-[0.99] transition-all duration-200"
                    >
                        <ClipboardList size={16} />
                        Take the assessment
                    </Link>
                </div>
            </section>

            <footer className="border-t border-black/[0.07]">
                <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6 text-xs text-ink/45 flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div>© 2026 SkillGreen. All rights reserved.</div>
                    <div className="max-w-md sm:text-right leading-relaxed">
                        A decision-support tool, not an automated employment decision. Results reflect a scoring framework
                        trained on synthetic data.
                    </div>
                </div>
            </footer>
        </div>
    );
}
