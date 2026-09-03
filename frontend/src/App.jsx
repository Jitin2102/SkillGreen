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

const API_BASE = "https://skillgreen.onrender.com";

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
        <div className="mb-4 sm:mb-5 w-full">
            <div className="flex justify-between items-baseline mb-1.5 sm:mb-2">
                <span className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm font-medium text-ink">
                    <Icon size={14} className={`shrink-0 ${meta.iconColor}`} strokeWidth={2.25} />
                    <span className="truncate">{label}</span>
                </span>
                <span className="text-[11px] sm:text-xs md:text-sm font-semibold tabular-nums text-ink/80 ml-2">{value}</span>
            </div>
            <div className="h-1.5 sm:h-2 w-full bg-black/[0.07] overflow-hidden rounded-full">
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
        <label className="block mb-4 sm:mb-5 w-full">
            <span className="flex items-center gap-1.5 text-[10px] sm:text-xs md:text-[13px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2 text-ink/70 break-words">
                {Icon && <Icon size={13} className="shrink-0" strokeWidth={2.25} />}
                {label}
            </span>
            {children}
        </label>
    );
}

const inputClasses =
    "w-full rounded-md border border-black/12 bg-white px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base shadow-sm " +
    "transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--color-ochre)]/40 focus:border-[var(--color-ochre)]";

const checkboxRow =
    "flex items-start sm:items-center gap-2.5 sm:gap-3 mb-2.5 text-xs sm:text-sm md:text-base rounded-md border border-transparent px-2 py-1.5 -mx-2 " +
    "hover:bg-black/[0.03] transition-colors cursor-pointer w-full";

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
        <div className="min-h-screen text-ink relative font-sans overflow-x-hidden">
            <div className="bg-aurora">
                <div className="blob-3" />
            </div>

            <header className="border-b border-black/[0.09]">
                <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 bg-[var(--color-ink)] flex items-center justify-center rounded-sm shrink-0">
                            <span className="font-serif text-[var(--color-parchment)] text-sm sm:text-base font-bold">S</span>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-[13px] sm:text-base font-bold tracking-tight leading-none truncate">SkillGreen</h1>
                            <p className="text-[9px] sm:text-xs text-ink/60 mt-0.5 sm:mt-1 tracking-widest uppercase font-medium truncate">ESG Readiness Index</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-ink/60 border border-black/12 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full tracking-wider uppercase whitespace-nowrap">
                        <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[var(--color-environmental)] shrink-0" />
                        Model v1.1
                    </span>
                </div>
            </header>

            <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 pt-6 sm:pt-12 pb-5 sm:pb-10">
                <p className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-ochre-dark)] mb-2 sm:mb-4">
                    Readiness assessment
                </p>
                <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15] sm:leading-[1.1] max-w-2xl mb-3 sm:mb-5 break-words">
                    ESG career readiness assessment
                </h2>
                <p className="text-ink/60 max-w-xl leading-relaxed text-xs sm:text-base lg:text-lg font-medium break-words">
                    Enter a professional profile to generate a readiness score across the
                    Environmental, Social, and Governance dimensions, with a recommended
                    area of focus.
                </p>
            </div>

            <main className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 pb-12 sm:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 2xl:gap-12">

                <section className="col-span-1 lg:col-span-7 xl:col-span-8 bg-[var(--color-card)] rounded-xl border border-black/[0.09] shadow-sm p-4 sm:p-6 md:p-8 w-full">
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-1 sm:gap-y-2 w-full">
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

                        <div className="h-px w-full bg-black/[0.06] my-5 sm:my-8" />

                        <fieldset className="mb-6 sm:mb-8 w-full">
                            <legend className="text-[10px] sm:text-[13px] font-bold uppercase tracking-wider mb-3 sm:mb-4 text-ink/70">
                                Background
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 sm:gap-y-1 w-full">
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
                                            className="h-4 w-4 md:h-5 md:w-5 shrink-0 rounded border-gray-300 text-[var(--color-ochre)] focus:ring-[var(--color-ochre)] mt-0.5 sm:mt-0"
                                        />
                                        <Icon size={16} className="text-ink/40 shrink-0 mt-0.5 sm:mt-0" strokeWidth={2} />
                                        <span className="leading-tight">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-[var(--color-ink)] text-[var(--color-parchment)] py-2.5 sm:py-3.5 text-xs sm:text-base font-bold tracking-wide shadow-sm hover:bg-[var(--color-ochre-dark)] hover:shadow-md active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin sm:h-[18px] sm:w-[18px]" />
                                        Calculating
                                    </>
                                ) : (
                                    <>
                                        Run assessment
                                        <ArrowRight size={16} className="sm:h-[18px] sm:w-[18px]" />
                                    </>
                                )}
                            </span>
                        </button>

                        {error && (
                            <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-[var(--color-ochre-dark)] bg-[var(--color-ochre-light)] rounded-md px-3 py-2 sm:px-4 sm:py-3 break-words">
                                {error}
                            </p>
                        )}
                    </form>
                </section>

                <section className="col-span-1 lg:col-span-5 xl:col-span-4 w-full">
                    <div className="lg:sticky lg:top-8 bg-[var(--color-card)] rounded-xl border border-black/[0.09] shadow-sm p-4 sm:p-6 md:p-8 min-h-[280px] sm:min-h-[420px] flex flex-col w-full">
                        {!result ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 lg:py-16">
                                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-dashed border-black/15 mb-3 sm:mb-5 flex items-center justify-center bg-black/[0.02]">
                                    <span className="text-black/20 text-xl sm:text-2xl font-serif">?</span>
                                </div>
                                <p className="text-xs sm:text-base font-medium text-ink/50 max-w-[20ch] leading-snug sm:leading-normal">
                                    Run an assessment to see the readiness rating.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between mb-5 sm:mb-8 pb-5 sm:pb-8 border-b border-black/[0.08] w-full">
                                    <div className="min-w-0 pr-2">
                                        <p className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-ink/75 mb-1.5 sm:mb-3 truncate">
                                            Readiness rating
                                        </p>
                                        <div className={`inline-flex items-center justify-center h-12 w-12 sm:h-20 sm:w-20 rounded-lg border-2 ${tone.text} border-current bg-white shadow-sm shrink-0`}>
                                            <span className="font-serif text-2xl sm:text-4xl font-bold">
                                                {result.predicted_category[0]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right min-w-0 pl-2">
                                        <p className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-ink/75 mb-1.5 sm:mb-3 truncate">
                                            Category
                                        </p>
                                        <p className={`text-base sm:text-2xl font-bold ${tone.text} truncate`}>{result.predicted_category}</p>
                                        <p className="text-[10px] sm:text-sm font-semibold text-ink/80 mt-1 sm:mt-1.5 tabular-nums bg-black/[0.06] border border-black/5 inline-block px-2 sm:px-2.5 py-1 sm:py-1.5 rounded truncate max-w-full">
                                            {Math.round(result.confidence * 100)}% confidence
                                        </p>
                                    </div>
                                </div>

                                <p className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-ink/75 mb-3 sm:mb-5 truncate">
                                    Pillar breakdown
                                </p>
                                <div className="w-full">
                                    {Object.entries(result.pillar_breakdown).map(([key, value]) => (
                                        <PillarBar
                                            key={key}
                                            label={PILLAR_META[key].label}
                                            value={value}
                                        />
                                    ))}
                                </div>

                                <div className="mt-4 sm:mt-auto pt-4 sm:pt-5 rounded-lg bg-[var(--color-parchment-dim)] border border-black/[0.08] px-3 sm:px-5 py-3 sm:py-5 text-xs sm:text-base leading-relaxed break-words w-full">
                                    <span className="font-bold text-ink">Focus area — </span>
                                    <span className="text-ink/80 font-medium">
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
