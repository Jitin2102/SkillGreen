import { useState } from "react";
import { Mail, KeyRound, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const inputClasses =
    "w-full rounded-md border border-black/12 bg-white px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm shadow-sm " +
    "transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--color-ochre)]/40 focus:border-[var(--color-ochre)]";

export default function OtpLogin({ onSuccess }) {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState("request"); // "request" | "verify"
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);
    const { sendOtp, loginWithOtp } = useAuth();

    async function handleRequest(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await sendOtp(email);
            setInfo("If that email is valid, a code has been sent. Check your inbox (or the server console in local dev).");
            setStep("verify");
        } catch (err) {
            setError(err.message || "Could not send code.");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerify(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await loginWithOtp(email, code);
            onSuccess?.();
        } catch (err) {
            setError(err.message || "Invalid or expired code.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {step === "request" ? (
                <form onSubmit={handleRequest}>
                    <label className="block mb-3 w-full">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1.5 text-ink/70">
                            <Mail size={12} strokeWidth={2.25} />
                            Email
                        </span>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClasses}
                            placeholder="you@example.com"
                        />
                    </label>

                    {error && (
                        <div className="mb-3 text-xs font-medium text-[var(--color-ochre-dark)] bg-[var(--color-ochre-light)] rounded-md px-3 py-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md border border-black/15 py-2.5 text-xs font-bold tracking-wide hover:bg-black/[0.04] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                        Send me a code
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerify}>
                    {info && (
                        <div className="mb-3 text-xs font-medium text-ink/70 bg-black/[0.04] rounded-md px-3 py-2">
                            {info}
                        </div>
                    )}
                    <label className="block mb-3 w-full">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1.5 text-ink/70">
                            <KeyRound size={12} strokeWidth={2.25} />
                            6-digit code
                        </span>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                            className={`${inputClasses} tracking-[0.4em] text-center font-semibold`}
                            placeholder="000000"
                        />
                    </label>

                    {error && (
                        <div className="mb-3 text-xs font-medium text-[var(--color-ochre-dark)] bg-[var(--color-ochre-light)] rounded-md px-3 py-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full rounded-md bg-[var(--color-ink)] text-[var(--color-parchment)] py-2.5 text-xs font-bold tracking-wide shadow-sm hover:bg-[var(--color-ochre-dark)] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                        Verify & continue
                    </button>

                    <button
                        type="button"
                        onClick={() => { setStep("request"); setCode(""); setError(null); }}
                        className="w-full text-center text-[11px] text-ink/50 hover:text-ink/80 mt-2.5"
                    >
                        Use a different email
                    </button>
                </form>
            )}
        </div>
    );
}
