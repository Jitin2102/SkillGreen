import { useState, useEffect } from "react";
import {
    Leaf,
    Users,
    ScaleIcon,
    BadgeCheck,
    Briefcase,
    GraduationCap,
    ArrowRight,
    Loader2,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

const PILLAR_META = {
    environmental: {
        label: "Environmental",
        bar: "bg-[var(--color-environmental)]",
        dot: "bg-[var(--color-environmental)]",
        icon: Leaf,
        iconColor: "text-[var(--color-environmental)]",
    },
    social: {
        label: "Social",
        bar: "bg-[var(--color-social)]",
        dot: "bg-[var(--color-social)]",
        icon: Users,
        iconColor: "text-[var(--color-social)]",
    },
    governance: {
        label: "Governance",
        bar: "bg-[var(--color-governance)]",
        dot: "bg-[var(--color-governance)]",
        icon: ScaleIcon,
        iconColor: "text-[var(--color-governance)]",
    },
};

const CATEGORY_TONE = {
    Low: { text: "text-[var(--color-ochre-dark)]", ring: "ring-[var(--color-ochre-dark)]/25", bg: "bg-[var(--color-ochre-light)]" },
    Medium: { text: "text-[var(--color-ochre)]", ring: "ring-[var(--color-ochre)]/25", bg: "bg-[var(--color-ochre-light)]" },
    High: { text: "text-[var(--color-environmental)]", ring: "ring-[var(--color-environmental)]/25", bg: "bg-[var(--color-environmental-light)]" },
};

function PillarBar({ label, value }) {
    const meta = PILLAR_META[label.toLowerCase()] ?? PILLAR_META.environmental;
    const pct = Math.min(100, Math.max(4, value * 3));
    const Icon = meta.icon;
    return (
        <div className="mb-5">
            <div className="flex justify-between items-baseline mb-2">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    <Icon size={15} className={meta.iconColor} strokeWidth={2.25} />
                    {label}
                </span>
                <span className="text-sm tabular-nums text-ink/50">{value}</span>
            </div>
            <div className="h-2 w-full bg-black/[0.07] overflow-hidden">
                <div
                    className={`h-full ${meta.bar} transition-all duration-700 ease-out`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function FormField({ label, children, icon: Icon }) {
    return (
        <label className="block mb-5">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide mb-2 text-ink/55">
                {Icon && <Icon size={13} strokeWidth={2.25} />}
                {label}
            </span>
            {children}
        </label>
    );
}

const inputClasses =
    "w-full rounded-[4px] border border-black/12 bg-white px-3.5 py-2.5 text-sm shadow-sm " +
    "transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--color-ochre)]/40 focus:border-[var(--color-ochre)]";

const checkboxRow =
    "flex items-center gap-3 mb-2.5 text-sm rounded-[4px] border border-transparent px-2 py-1.5 -mx-2 " +
    "hover:bg-black/[0.03] transition-colors cursor-pointer";

export default function App() {
    const [options, setOptions] = useState({ industries: [], education_levels: [] });
    const [form, setForm] = useState({
        years_experience: 5,
        current_industry: "",
        education_level: "",
        has_esg_certification: false,
        environmental_project_exposure: false,
        social_impact_exposure: false,
        governance_exposure: false,
        relevant_skills_count: 3,
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/options`)
            .then((r) => r.json())
            .then((data) => {
                setOptions(data);
                setForm((f) => ({
                    ...f,
                    current_industry: data.industries?.[0] ?? "",
                    education_level: data.education_levels?.[0] ?? "",
                }));
            })
            .catch(() => setError("Could not reach the SkillGreen API. Is it running on port 8000?"));
    }, []);

    function updateField(key, value) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const detail = await res.json().catch(() => null);
                throw new Error(detail?.detail?.[0]?.msg || "Prediction failed. Check your inputs.");
            }
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
            setResult(null);
        } finally {
            setLoading(false);
        }
    }

    const tone = result ? CATEGORY_TONE[result.predicted_category] : null;

    return (
        <div className="min-h-screen text-ink relative">
            {/* Ambient animated background — sits behind all content */}
            <div className="bg-aurora">
                <div className="blob-3" />
            </div>

            {/* Header */}
            <header className="border-b border-black/[0.09]">
                <div className="max-w-6xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-[var(--color-ink)] flex items-center justify-center">
                            <span className="font-[var(--font-display)] text-[var(--color-parchment)] text-base">S</span>
                        </div>
                        <div>
                            <h1 className="text-[15px] font-semibold tracking-tight leading-none">SkillGreen</h1>
                            <p className="text-[11px] text-ink/45 mt-1 tracking-wide uppercase">ESG Readiness Index</p>
                        </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-ink/50 border border-black/12 px-2.5 py-1 tracking-wide uppercase">
                        <span className="h-1.5 w-1.5 bg-[var(--color-environmental)]" />
                        Model v1.1
                    </span>
                </div>
            </header>

            {/* Hero strip */}
            <div className="max-w-6xl mx-auto px-6 md:px-12 pt-10 pb-8">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ochre-dark)] mb-3">
                    Readiness assessment
                </p>
                <h2 className="font-[var(--font-display)] text-[28px] md:text-[34px] leading-[1.15] max-w-xl mb-3">
                    ESG career readiness assessment
                </h2>
                <p className="text-ink/55 max-w-lg leading-relaxed text-[15px]">
                    Enter a professional profile to generate a readiness score across the
                    Environmental, Social, and Governance dimensions, with a recommended
                    area of focus.
                </p>
            </div>

            <main className="max-w-6xl mx-auto px-6 md:px-12 pb-16 grid lg:grid-cols-5 gap-8">
                {/* Left: form card */}
                <section className="lg:col-span-3 bg-[var(--color-card)] rounded-[6px] border border-black/[0.09] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 md:p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid sm:grid-cols-2 gap-x-5">
                            <FormField label="Years of experience">
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={form.years_experience}
                                    onChange={(e) => updateField("years_experience", Number(e.target.value))}
                                    className={inputClasses}
                                />
                            </FormField>

                            <FormField label="Relevant skills held">
                                <input
                                    type="number"
                                    min="0"
                                    value={form.relevant_skills_count}
                                    onChange={(e) => updateField("relevant_skills_count", Number(e.target.value))}
                                    className={inputClasses}
                                />
                            </FormField>

                            <FormField label="Current industry" icon={Briefcase}>
                                <select
                                    value={form.current_industry}
                                    onChange={(e) => updateField("current_industry", e.target.value)}
                                    className={inputClasses}
                                >
                                    {options.industries.map((ind) => (
                                        <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Education level" icon={GraduationCap}>
                                <select
                                    value={form.education_level}
                                    onChange={(e) => updateField("education_level", e.target.value)}
                                    className={inputClasses}
                                >
                                    {options.education_levels.map((ed) => (
                                        <option key={ed} value={ed}>{ed}</option>
                                    ))}
                                </select>
                            </FormField>
                        </div>

                        <div className="h-px bg-black/[0.06] my-6" />

                        <fieldset className="mb-7">
                            <legend className="text-[13px] font-semibold uppercase tracking-wide mb-3 text-ink/55">
                                Background
                            </legend>
                            <div className="grid sm:grid-cols-2 gap-x-2">
                                {[
                                    ["has_esg_certification", "Holds an ESG certification", BadgeCheck],
                                    ["environmental_project_exposure", "Environmental project exposure", Leaf],
                                    ["social_impact_exposure", "Social-impact initiative exposure", Users],
                                    ["governance_exposure", "Governance or compliance work", ScaleIcon],
                                ].map(([key, label, Icon]) => (
                                    <label key={key} className={checkboxRow}>
                                        <input
                                            type="checkbox"
                                            checked={form[key]}
                                            onChange={(e) => updateField(key, e.target.checked)}
                                            className="h-4 w-4 rounded accent-[var(--color-ochre)]"
                                        />
                                        <Icon size={15} className="text-ink/40" strokeWidth={2} />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-[4px] bg-[var(--color-ink)] text-[var(--color-parchment)] py-3 text-sm font-semibold tracking-wide shadow-sm hover:bg-[var(--color-ochre-dark)] hover:shadow-md active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Calculating
                                    </>
                                ) : (
                                    <>
                                        Run assessment
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </span>
                        </button>

                        {error && (
                            <p className="mt-3 text-sm text-[var(--color-ochre-dark)] bg-[var(--color-ochre-light)] rounded-[4px] px-3 py-2">
                                {error}
                            </p>
                        )}
                    </form>
                </section>

                {/* Right: result panel */}
                <section className="lg:col-span-2">
                    <div className="sticky top-8 bg-[var(--color-card)] rounded-[6px] border border-black/[0.09] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 md:p-7 min-h-[420px] flex flex-col">
                        {!result ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                                <div className="h-14 w-14 border-2 border-dashed border-black/15 mb-4 flex items-center justify-center">
                                    <span className="text-black/20 text-xl font-[var(--font-display)]">?</span>
                                </div>
                                <p className="text-sm text-ink/40 max-w-[24ch]">
                                    Run an assessment to see the readiness rating.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between mb-6 pb-6 border-b border-black/[0.08]">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/40 mb-2">
                                            Readiness rating
                                        </p>
                                        <div className={`inline-flex items-center justify-center h-14 w-14 border-2 ${tone.text} border-current`}>
                                            <span className="font-[var(--font-display)] text-2xl font-medium">
                                                {result.predicted_category[0]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/40 mb-2">
                                            Category
                                        </p>
                                        <p className={`text-lg font-semibold ${tone.text}`}>{result.predicted_category}</p>
                                        <p className="text-[11px] text-ink/40 mt-1 tabular-nums">
                                            {Math.round(result.confidence * 100)}% confidence
                                        </p>
                                    </div>
                                </div>

                                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/40 mb-4">
                                    Pillar breakdown
                                </p>
                                {Object.entries(result.pillar_breakdown).map(([key, value]) => (
                                    <PillarBar
                                        key={key}
                                        label={PILLAR_META[key].label}
                                        value={value}
                                    />
                                ))}

                                <div className="mt-auto pt-5 rounded-[4px] bg-[var(--color-parchment-dim)] border border-black/[0.08] px-4 py-3.5 text-sm leading-relaxed">
                                    <span className="font-semibold">Focus area — </span>
                                    <span className="text-ink/75">
                                        {PILLAR_META[result.weakest_pillar]?.label ?? result.weakest_pillar} is your
                                        weakest pillar right now. That's the fastest lever to move up a category.
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>

            <footer className="border-t border-black/[0.07]">
                <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 text-xs text-ink/40">
                    Trained on a synthetically labeled dataset. A proof-of-concept pipeline, not a validated real-world predictor.
                </div>
            </footer>
        </div>
    );
}
