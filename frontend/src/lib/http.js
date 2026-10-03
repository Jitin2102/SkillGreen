import { API_BASE, REQUEST_TIMEOUT_MS } from "../config.js";

// Turns FastAPI error bodies (422 list, {detail}, {error}) into one readable message.
function message(d) {
  if (Array.isArray(d.detail)) return d.detail.map((x) => `${x.loc?.slice(-1)}: ${x.msg}`).join("; ");
  return d.detail || d.error;
}

export async function api(path, { method = "GET", body, form, token } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(API_BASE + path, {
      method,
      signal: ctrl.signal,
      headers: { ...(body && { "Content-Type": "application/json" }), ...(token && { Authorization: `Bearer ${token}` }) },
      body: form || (body ? JSON.stringify(body) : undefined), // FormData sets its own content type
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(message(data) || `Server returned ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === "AbortError") throw new Error("The server took too long to respond. Try again in a moment.");
    if (err instanceof TypeError) throw new Error("Could not reach the server.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
