import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, clearToken, loginUser, registerUser } from "../lib/api";

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

export function AuthProvider({ children }) {
    const [token, setTokenState] = useState(getToken());
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
