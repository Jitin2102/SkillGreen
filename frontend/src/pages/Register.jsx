import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, ArrowRight, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import OtpLogin from "../components/OtpLogin";

const inputClasses =
    "w-full rounded-md border border-black/12 bg-white px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base shadow-sm " +
    "transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--color-ochre)]/40 focus:border-[var(--color-ochre)]";

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

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("password"); // "password" | "otp"
    const { register } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }
        if (password.length < 6) {
            setError("Password should be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            await register(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Registration failed. Try a different email.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen text-ink relative font-sans overflow-x-hidden">
            <div className="bg-aurora">
                <div className="blob-3" />
            </div>
            <Header />

            <div className="w-full max-w-[480px] mx-auto px-4 pt-10 sm:pt-16 pb-10">
                <p className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-ochre-dark)] mb-2 sm:mb-3">
                    Get started
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-1.5">Create your account</h2>
                <p className="text-ink/60 text-xs sm:text-sm mb-6 sm:mb-8">
                    Save your profile and track ESG readiness over time.
                </p>

                {mode === "password" && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-[var(--color-card)] border border-black/[0.08] rounded-lg px-4 sm:px-6 py-5 sm:py-7 shadow-sm"
                    >
                        <FormField label="Email" icon={Mail}>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClasses}
                                placeholder="you@example.com"
                            />
                        </FormField>

                        <FormField label="Password" icon={Lock}>
                            <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClasses}
                                placeholder="At least 6 characters"
                            />
                        </FormField>

                        <FormField label="Confirm password" icon={Lock}>
                            <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={inputClasses}
                                placeholder="••••••••"
                            />
                        </FormField>

                        {error && (
                            <div className="mb-4 text-xs sm:text-sm font-medium text-[var(--color-ochre-dark)] bg-[var(--color-ochre-light)] rounded-md px-3 py-2 sm:px-4 sm:py-3 break-words">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-[var(--color-ink)] text-[var(--color-parchment)] py-2.5 sm:py-3.5 text-xs sm:text-base font-bold tracking-wide shadow-sm hover:bg-[var(--color-ochre-dark)] hover:shadow-md active:scale-[0.99] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    Create account <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {mode === "otp" && (
                    <div className="bg-[var(--color-card)] border border-black/[0.08] rounded-lg px-4 sm:px-6 py-5 sm:py-7 shadow-sm">
                        <OtpLogin onSuccess={() => navigate("/dashboard")} />
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => { setMode(mode === "password" ? "otp" : "password"); setError(null); }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-ink/60 hover:text-ink mt-4"
                >
                    <KeyRound size={13} strokeWidth={2.25} />
                    {mode === "password" ? "Sign up with an emailed code instead" : "Sign up with a password instead"}
                </button>

                <p className="text-center text-xs sm:text-sm text-ink/60 mt-5">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-[var(--color-ochre-dark)] hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
