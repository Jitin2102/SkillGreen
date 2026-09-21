import { useEffect, useState } from "react";
import {
    BadgeCheck,
    Briefcase,
    GraduationCap,
    Loader2,
    Save,
    Clock,
    TrendingUp,
    Inbox,
} from "lucide-react";
import Header from "../components/Header";
import { getProfile, updateProfile, getAssessments, getOptions } from "../lib/api";
import { PILLAR_META, CATEGORY_TONE } from "../lib/designConstants";

const inputClasses =
    "w-full rounded-md border border-black/12 bg-white px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm shadow-sm " +
    "transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--color-ochre)]/40 focus:border-[var(--color-ochre)]";

function PillarBar({ pillarKey, value }) {
    const meta = PILLAR_META[pillarKey] ?? PILLAR_META.environmental;
    const pct = Math.min(100, Math.max(4, value * 3));
    const Icon = meta.icon;
    return (
        <div className="mb-3 sm:mb-4 w-full">
            <div className="flex justify-between items-baseline mb-1.5">
                <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-ink">
                    <Icon size={13} className={`shrink-0 ${meta.iconColor}`} strokeWidth={2.25} />
                    {meta.label}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold tabular-nums text-ink/80">{value}</span>
            </div>
            <div className="h-1.5 w-full bg-black/[0.07] overflow-hidden rounded-full">
                <div className={`h-full ${meta.bar} transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

/** Small interactive sparkline built with plain SVG — no charting library needed.
    Hovering a point shows its category + date in a tooltip. */
function HistorySparkline({ assessments }) {
    const [hoverIdx, setHoverIdx] = useState(null);
    if (assessments.length < 2) return null;

    const categoryValue = { Low: 1, Medium: 2, High: 3 };
    const points = [...assessments].reverse(); // oldest first, left to right
    const width = 100;
    const height = 32;
    const stepX = width / (points.length - 1);

    const coords = points.map((a, i) => ({
        x: i * stepX,
        y: height - ((categoryValue[a.predicted_category] || 1) - 1) * (height / 2),
        a,
    }));

    const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16" preserveAspectRatio="none">
                <path d={pathD} fill="none" stroke="var(--color-ochre)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                {coords.map((c, i) => (
                    <circle
                        key={i}
                        cx={c.x}
                        cy={c.y}
                        r={hoverIdx === i ? 2.4 : 1.6}
                        fill={hoverIdx === i ? "var(--color-ochre-dark)" : "var(--color-ochre)"}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoverIdx(i)}
                        onMouseLeave={() => setHoverIdx(null)}
                        vectorEffect="non-scaling-stroke"
                    />
                ))}
            </svg>
            {hoverIdx !== null && (
                <div className="text-center text-[11px] text-ink/70 mt-1">
                    <span className="font-semibold">{coords[hoverIdx].a.predicted_category}</span>
                    {" · "}
                    {new Date(coords[hoverIdx].a.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [options, setOptions] = useState({ industries: [], education_levels: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        years_experience: "",
        current_industry: "",
        education_level: "",
        has_esg_certification: false,
    });
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [profileData, assessmentsData, optionsData] = await Promise.all([
                    getProfile(),
                    getAssessments(),
                    getOptions(),
                ]);
                if (cancelled) return;
                setProfile(profileData);
                setAssessments(assessmentsData);
                setOptions(optionsData);
                setForm({
                    years_experience: profileData.years_experience ?? "",
                    current_industry: profileData.current_industry ?? "",
                    education_level: profileData.education_level ?? "",
                    has_esg_certification: !!profileData.has_esg_certification,
                });
            } catch (err) {
                if (!cancelled) setError(err.message || "Could not load your dashboard.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    function updateField(key, value) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    async function handleSaveProfile(e) {
        e.preventDefault();
        setSaving(true);
        setSaveMessage(null);
        try {
            const payload = {
                ...form,
                years_experience: form.years_experience === "" ? null : Number(form.years_experience),
            };
            const updated = await updateProfile(payload);
            setProfile(updated);
            setSaveMessage({ type: "success", text: "Profile saved." });
        } catch (err) {
            setSaveMessage({ type: "error", text: err.message || "Could not save profile." });
        } finally {
            setSaving(false);
        }
    }

    const latest = assessments.length > 0 ? assessments[0] : null;
    const tone = latest ? CATEGORY_TONE[latest.predicted_category] : null;

    return (
        <div className="min-h-screen text-ink relative font-sans overflow-x-hidden">
            <div className="bg-aurora">
                <div className="blob-3" />
            </div>
            <Header />

            <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-12 sm:pb-16">
                <p className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-ochre-dark)] mb-2 sm:mb-3">
                    Your dashboard
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-6 sm:mb-8">
                    ESG readiness overview
                </h2>

                {loading && (
                    <div className="flex items-center gap-2 text-ink/60 text-sm py-10">
                        <Loader2 size={18} className="animate-spin" />
                        Loading your dashboard…
                    </div>
                )}

                {error && !loading && (
                    <div className="text-sm font-medium text-[var(--color-ochre-dark)] bg-[var(--color-ochre-light)] rounded-md px-4 py-3 mb-6">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
                        {/* Profile card */}
                        <div className="lg:col-span-4">
                            <div className="bg-[var(--color-card)] border border-black/[0.08] rounded-lg px-4 sm:px-6 py-5 sm:py-6 shadow-sm h-full">
                                <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-ink/70 mb-4">
                                    Your profile
                                </h3>
                                <form onSubmit={handleSaveProfile}>
                                    <label className="block mb-3.5 w-full">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1.5 text-ink/70">
                                            <Briefcase size={12} strokeWidth={2.25} />
                                            Years of experience
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={form.years_experience}
                                            onChange={(e) => updateField("years_experience", e.target.value)}
                                            className={inputClasses}
                                        />
                                    </label>

                                    <label className="block mb-3.5 w-full">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1.5 text-ink/70">
                                            <Briefcase size={12} strokeWidth={2.25} />
                                            Industry
                                        </span>
                                        <select
                                            value={form.current_industry}
                                            onChange={(e) => updateField("current_industry", e.target.value)}
                                            className={inputClasses}
                                        >
                                            <option value="">Select…</option>
                                            {options.industries.map((i) => (
                                                <option key={i} value={i}>{i}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="block mb-3.5 w-full">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1.5 text-ink/70">
                                            <GraduationCap size={12} strokeWidth={2.25} />
                                            Education
                                        </span>
                                        <select
                                            value={form.education_level}
                                            onChange={(e) => updateField("education_level", e.target.value)}
                                            className={inputClasses}
                                        >
                                            <option value="">Select…</option>
                                            {options.education_levels.map((e) => (
                                                <option key={e} value={e}>{e}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="flex items-center gap-2.5 mb-4 text-xs cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.has_esg_certification}
                                            onChange={(e) => updateField("has_esg_certification", e.target.checked)}
                                        />
                                        <span className="flex items-center gap-1.5 text-ink/80">
                                            <BadgeCheck size={13} strokeWidth={2.25} />
                                            ESG certified
                                        </span>
                                    </label>

                                    {saveMessage && (
                                        <div
                                            className={`mb-3 text-xs font-medium rounded-md px-3 py-2 ${
                                                saveMessage.type === "success"
                                                    ? "text-[var(--color-environmental)] bg-[var(--color-environmental-light)]"
                                                    : "text-[var(--color-ochre-dark)] bg-[var(--color-ochre-light)]"
                                            }`}
                                        >
                                            {saveMessage.text}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full rounded-md bg-[var(--color-ink)] text-[var(--color-parchment)] py-2.5 text-xs font-bold tracking-wide shadow-sm hover:bg-[var(--color-ochre-dark)] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        Save profile
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Latest assessment + trend */}
                        <div className="lg:col-span-8 flex flex-col gap-5 sm:gap-8">
                            <div className="bg-[var(--color-card)] border border-black/[0.08] rounded-lg px-4 sm:px-6 py-5 sm:py-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-ink/70">
                                        Latest readiness
                                    </h3>
                                    {latest && (
                                        <span className="flex items-center gap-1.5 text-[10px] text-ink/50">
                                            <Clock size={12} />
                                            {new Date(latest.created_at).toLocaleDateString(undefined, {
                                                year: "numeric", month: "short", day: "numeric",
                                            })}
                                        </span>
                                    )}
                                </div>

                                {!latest ? (
                                    <div className="flex flex-col items-center text-center py-8 text-ink/50">
                                        <Inbox size={28} className="mb-2 opacity-50" />
                                        <p className="text-sm">No assessments yet.</p>
                                        <p className="text-xs mt-1">
                                            Run a readiness check from the{" "}
                                            <a href="/predict" className="text-[var(--color-ochre-dark)] font-semibold hover:underline">
                                                assessment page
                                            </a>{" "}
                                            while logged in to see it here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <span
                                                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${tone.bg} ${tone.text}`}
                                            >
                                                {latest.predicted_category} readiness
                                            </span>
                                            <p className="text-ink/60 text-xs mt-2.5">
                                                Confidence: <span className="font-semibold tabular-nums">{Math.round(parseFloat(latest.confidence) * 100)}%</span>
                                            </p>
                                            <p className="text-ink/60 text-xs mt-1">
                                                Weakest pillar:{" "}
                                                <span className="font-semibold capitalize">{latest.weakest_pillar}</span>
                                            </p>
                                        </div>
                                        <div>
                                            {latest.pillar_breakdown &&
                                                Object.entries(latest.pillar_breakdown).map(([key, value]) => (
                                                    <PillarBar key={key} pillarKey={key} value={value} />
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {assessments.length >= 2 && (
                                <div className="bg-[var(--color-card)] border border-black/[0.08] rounded-lg px-4 sm:px-6 py-5 sm:py-6 shadow-sm">
                                    <h3 className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-ink/70 mb-4">
                                        <TrendingUp size={13} strokeWidth={2.25} />
                                        Trend over time
                                    </h3>
                                    <HistorySparkline assessments={assessments} />
                                </div>
                            )}

                            {assessments.length > 0 && (
                                <div className="bg-[var(--color-card)] border border-black/[0.08] rounded-lg px-4 sm:px-6 py-5 sm:py-6 shadow-sm">
                                    <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-ink/70 mb-4">
                                        Assessment history ({assessments.length})
                                    </h3>
                                    <div className="overflow-x-auto -mx-1 px-1">
                                        <table className="w-full text-xs sm:text-sm">
                                            <thead>
                                                <tr className="text-left text-ink/50 text-[10px] uppercase tracking-wider">
                                                    <th className="pb-2 pr-4 font-semibold">Date</th>
                                                    <th className="pb-2 pr-4 font-semibold">Category</th>
                                                    <th className="pb-2 pr-4 font-semibold">Confidence</th>
                                                    <th className="pb-2 font-semibold">Weakest pillar</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {assessments.map((a) => {
                                                    const rowTone = CATEGORY_TONE[a.predicted_category];
                                                    return (
                                                        <tr key={a.id} className="border-t border-black/[0.06]">
                                                            <td className="py-2.5 pr-4 text-ink/70 whitespace-nowrap">
                                                                {new Date(a.created_at).toLocaleDateString(undefined, {
                                                                    year: "numeric", month: "short", day: "numeric",
                                                                })}
                                                            </td>
                                                            <td className="py-2.5 pr-4">
                                                                <span className={`inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full ${rowTone.bg} ${rowTone.text}`}>
                                                                    {a.predicted_category}
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 pr-4 text-ink/70 tabular-nums">
                                                                {Math.round(parseFloat(a.confidence) * 100)}%
                                                            </td>
                                                            <td className="py-2.5 text-ink/70 capitalize">{a.weakest_pillar}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
