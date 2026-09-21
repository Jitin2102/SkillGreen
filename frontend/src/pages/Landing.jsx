import { Link } from "react-router-dom";
import { Leaf, Users, ScaleIcon, ArrowRight, ClipboardList, LineChart, UserPlus } from "lucide-react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

const PILLARS = [
    {
        key: "environmental",
        label: "Environmental",
        icon: Leaf,
        color: "text-[var(--color-environmental)]",
        bg: "bg-[var(--color-environmental-light)]",
        desc: "Hands-on exposure to sustainability projects, emissions work, or environmental initiatives.",
    },
    {
        key: "social",
        label: "Social",
        icon: Users,
        color: "text-[var(--color-social)]",
        bg: "bg-[var(--color-social-light)]",
        desc: "Experience with community impact, diversity programs, or social-good initiatives.",
    },
    {
        key: "governance",
        label: "Governance",
        icon: ScaleIcon,
        color: "text-[var(--color-governance)]",
        bg: "bg-[var(--color-governance-light)]",
        desc: "Familiarity with compliance, ethics, reporting standards, or board-level accountability.",
    },
];

const STEPS = [
    {
        icon: ClipboardList,
        title: "Share your background",
        desc: "Industry, experience, education, and any ESG-related exposure you already have.",
    },
    {
        icon: Leaf,
        title: "Get your readiness score",
        desc: "A model-backed Low/Medium/High score with a pillar-by-pillar breakdown.",
    },
    {
        icon: LineChart,
        title: "Track it over time",
        desc: "Create an account to save your profile and watch your readiness improve.",
    },
];

export default function Landing() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen text-ink relative font-sans overflow-x-hidden">
            <div className="bg-aurora">
                <div className="blob-3" />
            </div>
            <Header />

            {/* Hero */}
            <section className="w-full max-w-[900px] mx-auto px-4 pt-14 sm:pt-24 pb-10 sm:pb-16 text-center">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-ochre-dark)] mb-4">
                    ESG Readiness Index
                </p>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
                    How ready are you for the sustainability-focused role you want?
                </h1>
                <p className="text-ink/65 text-sm sm:text-base max-w-[560px] mx-auto mb-8 sm:mb-10">
                    SkillGreen predicts your ESG career readiness from your background —
                    then helps you track and improve it as sustainability becomes central
                    to how companies hire.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/predict"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-ink)] text-[var(--color-parchment)] px-6 py-3 text-sm font-bold tracking-wide shadow-sm hover:bg-[var(--color-ochre-dark)] hover:shadow-md active:scale-[0.99] transition-all duration-200"
                    >
                        Try the free assessment <ArrowRight size={16} />
                    </Link>
                    {!isAuthenticated && (
                        <Link
                            to="/register"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-black/15 px-6 py-3 text-sm font-bold tracking-wide hover:bg-black/[0.04] transition-colors"
                        >
                            <UserPlus size={16} />
                            Sign up to save progress
                        </Link>
                    )}
                </div>
                <p className="text-[11px] sm:text-xs text-ink/45 mt-4">
                    No account needed to try it — sign up any time to save your history.
                </p>
            </section>

            {/* Pillars */}
            <section className="w-full max-w-[1100px] mx-auto px-4 py-10 sm:py-14">
                <h2 className="text-center font-serif text-xl sm:text-2xl font-bold mb-2">What we measure</h2>
                <p className="text-center text-ink/60 text-xs sm:text-sm mb-8 sm:mb-10 max-w-[480px] mx-auto">
                    Your readiness score is built from three pillars, each scored independently.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {PILLARS.map((p) => {
                        const Icon = p.icon;
                        return (
                            <div
                                key={p.key}
                                className="bg-[var(--color-card)] border border-black/[0.08] rounded-lg px-5 py-6 shadow-sm text-center"
                            >
                                <div className={`inline-flex items-center justify-center h-11 w-11 rounded-full ${p.bg} mb-4`}>
                                    <Icon size={20} className={p.color} strokeWidth={2.25} />
                                </div>
                                <h3 className="font-bold text-sm mb-2">{p.label}</h3>
                                <p className="text-ink/60 text-xs leading-relaxed">{p.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* How it works */}
            <section className="w-full max-w-[1100px] mx-auto px-4 py-10 sm:py-14">
                <h2 className="text-center font-serif text-xl sm:text-2xl font-bold mb-8 sm:mb-10">How it works</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                    {STEPS.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.title} className="text-center">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--color-ink)] text-[var(--color-parchment)] mx-auto mb-4 font-serif font-bold text-sm">
                                    {i + 1}
                                </div>
                                <Icon size={18} className="mx-auto mb-2.5 text-[var(--color-ochre-dark)]" strokeWidth={2.25} />
                                <h3 className="font-bold text-sm mb-1.5">{s.title}</h3>
                                <p className="text-ink/60 text-xs leading-relaxed max-w-[240px] mx-auto">{s.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Closing CTA */}
            <section className="w-full max-w-[700px] mx-auto px-4 py-12 sm:py-16 text-center">
                <h2 className="font-serif text-xl sm:text-2xl font-bold mb-3">Ready to see where you stand?</h2>
                <p className="text-ink/60 text-xs sm:text-sm mb-6">Takes about a minute. No account required.</p>
                <Link
                    to="/predict"
                    className="inline-flex items-center gap-2 rounded-md bg-[var(--color-ink)] text-[var(--color-parchment)] px-6 py-3 text-sm font-bold tracking-wide shadow-sm hover:bg-[var(--color-ochre-dark)] transition-all duration-200"
                >
                    Start the assessment <ArrowRight size={16} />
                </Link>
            </section>
        </div>
    );
}
