import { useEffect, useState } from "react";
import { api } from "./http";
import { LIMITS } from "../config";

const FLAG_KEYS = ["environmental_project_exposure", "social_impact_exposure", "governance_exposure"];

function normalise(data) {
    const f = data?.fields ?? data?.inferred_fields ?? data ?? {};
    const out = {};
    for (const k of FLAG_KEYS) if (typeof f[k] === "boolean") out[k] = f[k];
    if (typeof f.relevant_skills_count === "number") {
        out.relevant_skills_count = Math.min(Math.max(f.relevant_skills_count, LIMITS.skills.min), LIMITS.skills.max);
    }
    return out;
}

export function useResumePrefill(token, resumeId) {
    const [detected, setDetected] = useState(null);

    useEffect(() => {
        if (!token) {
            setDetected(null);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                let id = resumeId;
                if (id == null) {
                    const data = await api("/resume/list", { token });
                    const list = Array.isArray(data) ? data : data?.resumes ?? data?.items ?? [];
                    if (list.length === 0) return;
                    id = [...list].sort((a, b) => b.id - a.id)[0].id;
                }
                const fields = normalise(await api(`/resume/${id}/inferred-fields`, { token }));
                if (!cancelled && Object.keys(fields).length > 0) setDetected(fields);
            } catch {
                // Pre-fill is a convenience; the form works without it.
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token, resumeId]);

    return detected;
}
