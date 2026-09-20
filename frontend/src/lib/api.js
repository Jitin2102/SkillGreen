export const API_BASE = import.meta.env.VITE_API_BASE || "https://skillgreen.onrender.com";

const TOKEN_KEY = "skillgreen_token";

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    let data = null;
    try {
        data = await res.json();
    } catch {
        // some endpoints may return no body; that's fine
    }

    if (!res.ok) {
        const message =
            (data && (data.detail || data.error)) || `Request failed (${res.status})`;
        throw new Error(
            typeof message === "string" ? message : JSON.stringify(message)
        );
    }

    return data;
}

// --- Auth ---
export function registerUser(email, password) {
    return apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export function loginUser(email, password) {
    return apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

// --- Profile ---
export function getProfile() {
    return apiFetch("/profile");
}

export function updateProfile(payload) {
    return apiFetch("/profile", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

// --- Assessments ---
export function getAssessments() {
    return apiFetch("/assessments");
}

// --- Prediction (works with or without auth; apiFetch attaches token if present) ---
export function predictReadiness(payload) {
    return apiFetch("/predict", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function getOptions() {
    return apiFetch("/options");
}
