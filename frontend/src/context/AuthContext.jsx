import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, clearToken, loginUser, registerUser, requestOtp, verifyOtp } from "../lib/api";

const AuthContext = createContext(null);

function decodeEmailFromToken(token) {
    // JWTs are base64url header.payload.signature — we only need the
    // payload to read the "sub" claim (the user's email), no verification
    // needed here since the backend verifies every real request anyway.
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
