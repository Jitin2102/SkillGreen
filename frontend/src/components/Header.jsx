import { Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
    const { isAuthenticated, email, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header className="border-b border-black/[0.09]">
            <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-5 flex flex-wrap items-center justify-between gap-3">
                <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 bg-[var(--color-ink)] flex items-center justify-center rounded-sm shrink-0">
                        <span className="font-serif text-[var(--color-parchment)] text-sm sm:text-base font-bold">S</span>
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-[13px] sm:text-base font-bold tracking-tight leading-none truncate">SkillGreen</h1>
                        <p className="text-[9px] sm:text-xs text-ink/60 mt-0.5 sm:mt-1 tracking-widest uppercase font-medium truncate">ESG Readiness Index</p>
                    </div>
                </Link>

                <nav className="flex items-center gap-2 sm:gap-3">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-ink/70 hover:text-ink px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-black/[0.04] transition-colors"
                            >
                                <LayoutDashboard size={14} strokeWidth={2.25} />
                                Dashboard
                            </Link>
                            <span className="hidden sm:inline text-xs text-ink/50 max-w-[16ch] truncate">{email}</span>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-ink/70 hover:text-ink border border-black/12 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-black/[0.04] transition-colors"
                            >
                                <LogOut size={14} strokeWidth={2.25} />
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-ink/70 hover:text-ink px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-black/[0.04] transition-colors"
                            >
                                <LogIn size={14} strokeWidth={2.25} />
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[var(--color-parchment)] bg-[var(--color-ink)] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-md hover:bg-[var(--color-ochre-dark)] transition-colors"
                            >
                                <UserPlus size={14} strokeWidth={2.25} />
                                Sign up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
