import { Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, LogIn, UserPlus, ClipboardList } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/skillgreen-logo.png";

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
                    <img
                        src={logo}
                        alt="SkillGreen"
                        className="h-9 sm:h-11 w-auto object-contain shrink-0"
                    />
                    <span className="text-[9px] sm:text-[11px] text-ink/55 tracking-[0.15em] uppercase font-semibold whitespace-nowrap border-l border-black/15 pl-2.5 sm:pl-3">
                        ESG Readiness Index
                    </span>
                </Link>

                <nav className="flex items-center gap-2 sm:gap-3">
                    <Link
                        to="/predict"
                        className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-ink/70 hover:text-ink px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-black/[0.04] transition-colors"
                    >
                        <ClipboardList size={14} strokeWidth={2.25} />
                        Assessment
                    </Link>
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
                                className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold !text-white hover:!text-white bg-[var(--color-primary)] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-md hover:bg-[var(--color-primary-dark)] transition-colors"
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
