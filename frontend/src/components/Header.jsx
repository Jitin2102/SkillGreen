import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, LogIn, UserPlus, ClipboardList } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/skillgreen-logo.png";

const pill = "inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-2 rounded-full transition-colors";

const navLinkClass = ({ isActive }) =>
    `${pill} ${
        isActive
            ? "bg-[var(--color-primary)] !text-white"
            : "text-ink/70 hover:text-ink hover:bg-black/[0.06]"
    }`;

const anchorClass =
    "text-xs font-semibold text-ink/65 hover:text-ink px-3 py-2 rounded-full hover:bg-black/[0.06] transition-colors";

export default function Header() {
    const { isAuthenticated, email, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const onLanding = pathname === "/";

    const showSignUp = pathname !== "/" && pathname !== "/register";
    const showLogIn = pathname !== "/login";

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header className="sticky top-0 z-50 px-2.5 sm:px-4 pt-2.5 sm:pt-3 pointer-events-none">
            <div
                className={`pointer-events-auto mx-auto max-w-[1180px] h-14 sm:h-16 flex items-center justify-between gap-2 rounded-full border backdrop-blur-xl pl-3.5 sm:pl-5 pr-2 sm:pr-2.5 transition-all duration-300 ${
                    scrolled
                        ? "bg-[var(--color-card)]/90 border-black/[0.10] shadow-[0_12px_32px_-12px_rgba(30,50,40,0.35)]"
                        : "bg-[var(--color-card)]/65 border-black/[0.06] shadow-sm"
                }`}
            >
                <Link to="/" className="flex items-center gap-3 min-w-0" aria-label="SkillGreen home">
                    <img src={logo} alt="SkillGreen" className="h-8 sm:h-10 w-auto object-contain shrink-0" />
                </Link>

                {/* In-page links, only on the landing page */}
                {onLanding && (
                    <div className="hidden lg:flex items-center gap-1">
                        <a href="#pillars" className={anchorClass}>Pillars</a>
                        <a href="#features" className={anchorClass}>Features</a>
                        <a href="#how-it-works" className={anchorClass}>How it works</a>
                    </div>
                )}

                <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Main">
                    <NavLink to="/predict" className={navLinkClass} aria-label="Assessment">
                        <ClipboardList size={15} strokeWidth={2.25} />
                        <span className="hidden sm:inline">Assessment</span>
                    </NavLink>

                    {isAuthenticated ? (
                        <>
                            <NavLink to="/dashboard" className={navLinkClass} aria-label="Dashboard">
                                <LayoutDashboard size={15} strokeWidth={2.25} />
                                <span className="hidden sm:inline">Dashboard</span>
                            </NavLink>

                            <span
                                title={email}
                                className="hidden sm:flex items-center gap-2 pl-2 pr-1 text-xs text-ink/60 max-w-[20ch]"
                            >
                                <span className="h-8 w-8 shrink-0 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center text-xs font-bold">
                                    {email?.[0]?.toUpperCase() ?? "?"}
                                </span>
                                <span className="hidden xl:block truncate">{email}</span>
                            </span>

                            <button
                                type="button"
                                onClick={handleLogout}
                                aria-label="Log out"
                                className={`${pill} text-ink/70 hover:text-ink hover:bg-black/[0.06]`}
                            >
                                <LogOut size={15} strokeWidth={2.25} />
                                <span className="hidden sm:inline">Log out</span>
                            </button>
                        </>
                    ) : (
                        <>
                            {showLogIn && (
                                <NavLink to="/login" className={navLinkClass}>
                                    <LogIn size={15} strokeWidth={2.25} className="hidden sm:block" />
                                    Log in
                                </NavLink>
                            )}
                            {showSignUp && (
                                <Link
                                    to="/register"
                                    className="ml-0.5 inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold !text-white hover:!text-white bg-[var(--color-primary)] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-sm hover:bg-[var(--color-primary-dark)] transition-colors"
                                >
                                    <UserPlus size={15} strokeWidth={2.25} className="hidden sm:block" />
                                    Sign up
                                </Link>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
