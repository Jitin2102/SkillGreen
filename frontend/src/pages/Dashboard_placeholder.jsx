import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const { email } = useAuth();
    return (
        <div className="min-h-screen text-ink relative font-sans overflow-x-hidden">
            <div className="bg-aurora">
                <div className="blob-3" />
            </div>
            <Header />
            <div className="w-full max-w-[1440px] mx-auto px-4 pt-10">
                <h2 className="font-serif text-2xl font-bold">Dashboard placeholder</h2>
                <p className="text-ink/60 mt-2">Logged in as {email}. Full dashboard coming next.</p>
            </div>
        </div>
    );
}
