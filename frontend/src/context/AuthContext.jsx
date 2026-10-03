import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, clearToken, loginUser, registerUser, requestOtp, verifyOtp } from "../lib/api";

const AuthContext = createContext(null);

function decodeEmailFromToken(token) {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return decoded.sub || null;
    } catch {
        return null;
    }
}
function isExpired(token) {
    try {
        const { exp } = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return exp ? exp * 1000 < Date.now() : false;
    } catch {
        return true;
    }
}
export function AuthProvider({ children }) {
    const [token, setTokenState] = useState(() => {
    const t = getToken();
    if (t && isExpired(t)) { clearToken(); return null; }
    return t;
});
    const [email, setEmail] = useState(() => {
        const existing = getToken();
        return existing ? decodeEmailFromToken(existing) : null;
    });

    useEffect(() => {
        if (token) {
            setEmail(decodeEmailFromToken(token));
        } else {
            setEmail(null);
        }
    }, [token]);

    async function login(userEmail, password) {
        const data = await loginUser(userEmail, password);
        setToken(data.access_token);
        setTokenState(data.access_token);
    }

    async function register(userEmail, password) {
        const data = await registerUser(userEmail, password);
        setToken(data.access_token);
        setTokenState(data.access_token);
    }

    async function sendOtp(userEmail) {
        await requestOtp(userEmail);
    }

    async function loginWithOtp(userEmail, code) {
        const data = await verifyOtp(userEmail, code);
        setToken(data.access_token);
        setTokenState(data.access_token);
    }

    function logout() {
        clearToken();
        setTokenState(null);
    }

    const value = {
        token,
        email,
        isAuthenticated: !!token,
        login,
        register,
        sendOtp,
        loginWithOtp,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
