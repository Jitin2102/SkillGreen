import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, Loader2, ArrowRight, Target } from "lucide-react";
import { uploadResume, listResumes, getResume, getSkillGap } from "../lib/api";

const MAX_MB = 5;
const ALLOWED = [".pdf", ".docx"];

const CHIP = "inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full";

// "esg reporting" -> "ESG Reporting", "diversity & inclusion" -> "Diversity & Inclusion"
const prettySkill = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bEsg\b/g, "ESG");

// The list endpoint may return a bare array or wrap it; handle both.
function toList(data) {
    const list = Array.isArray(data) ? data : data?.resumes ?? data?.items ?? [];
    return [...list].sort((a, b) => b.id - a.id); // newest first
}

const fileName = (r) => r.original_filename ?? r.filename ?? `Resume #${r.id}`;
const uploadedOn = (r) => r.uploaded_at ?? r.created_at;
const skillsOf = (r) => r?.extracted_skills ?? r?.skills ?? [];

function SkillGapCard({ gap, gapError, hasResume }) {
    if (!hasResume) return null;

    if (gapError) {
        return (
            <p className="text-xs text-ink/60 bg-black/[0.04] rounded-md px-3 py-2.5 leading-relaxed">
                {gapError}
            </p>
        );
    }
    if (!gap) return null;

    const matched = gap.matched ?? [];
    const missing = gap.missing ?? [];
    const extra = gap.extra ?? [];
    const total = matched.length + missing.length;
    const pct = total === 0 ? 0 : Math.round((matched.length / total) * 100);

    return (
        <div>
            <p className="text-[11px] sm:text-xs text-ink/60 mb-3 leading-relaxed">
                {gap.current_category && (
                    <>
                        You are currently <span className="font-semibold text-ink">{gap.current_category}</span>.{" "}
                    </>
                )}
                Skills expected for <span className="font-semibold text-ink">{gap.target_category}</span> readiness:
            </p>

            <div className="mb-4">
                <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-[11px] sm:text-xs font-medium text-ink">Target skills covered</span>
                    <span className="text-[11px] sm:text-xs font-semibold tabular-nums text-ink/80">
                        {matched.length} / {total}
                    </span>
                </div>
                <div className="h-1.5 w-full bg-black/[0.07] overflow-hidden rounded-full">
                    <div
                        className="h-full bg-[var(--color-environmental)] transition-all duration-700 ease-out"
                        style={{ width: `${Math.max(pct, total ? 4 : 0)}%` }}
                    />
                </div>
            </div>

            <SkillGroup
                title="Matched"
                skills={matched}
                empty="None of the target skills were detected."
                className="bg-[var(--color-environmental-light)] text-[var(--color-environmental)]"
            />
            <SkillGroup
                title="Missing"
                skills={missing}
                empty="Nothing missing. You cover every target skill."
                className="bg-[var(--color-ochre-light)] text-[var(--color-ochre-dark)]"
            />
            {extra.length > 0 && (
                <SkillGroup title="Other skills you have" skills={extra} className="bg-black/[0.06] text-ink/70" />
            )}
        </div>
    );
}

function SkillGroup({ title, skills, empty, className }) {
    return (
        <div className="mb-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink/70 mb-1.5">{title}</p>
            {skills.length === 0 ? (
                <p className="text-xs text-ink/50">{empty}</p>
            ) : (
                <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                        <span key={s} className={`${CHIP} ${className}`}>
                            {prettySkill(s)}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ResumePanel() {
    const navigate = useNavigate();
    const fileInput = useRef(null);
    const requestId = useRef(0); // ignore stale responses when the selection changes quickly

    const [resumes, setResumes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [gap, setGap] = useState(null);
    const [gapError, setGapError] = useState(null);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    async function selectResume(id) {
        const myRequest = ++requestId.current;
        setSelectedId(id);
        setDetailLoading(true);
        setGap(null);
        setGapError(null);
        try {
            const [resume, gapResult] = await Promise.all([
                getResume(id),
                getSkillGap(id).then(
                    (g) => ({ g }),
                    (e) => ({ e })
                ),
            ]);
            if (myRequest !== requestId.current) return;
            setDetail(resume);
            if (gapResult.g) setGap(gapResult.g);
            else setGapError(gapResult.e?.message || "Could not compute the skill gap.");
        } catch (err) {
            if (myRequest !== requestId.current) return;
            setDetail(null);
            setError(err.message || "Could not load this resume.");
        } finally {
            if (myRequest === requestId.current) setDetailLoading(false);
        }
    }

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const list = toList(await listResumes());
                if (cancelled) return;
                setResumes(list);
                if (list.length > 0) await selectResume(list[0].id);
            } catch (err) {
                if (!cancelled) setError(err.message || "Could not load your resumes.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleFile(e) {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-selecting the same file
        if (!file) return;

        const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
        if (!ALLOWED.includes(ext)) {
            setError("Only PDF and DOCX files are supported.");
            return;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
            setError(`File is too large. The limit is ${MAX_MB} MB.`);
            return;
        }

        setError(null);
        setUploading(true);
        try {
            const uploaded = await uploadResume(file);
            const list = toList(await listResumes());
            setResumes(list);
            await selectResume(uploaded.id);
        } catch (err) {
            setError(err.message || "Upload failed.");
        } finally {
            setUploading(false);
        }
    }

    const skills = skillsOf(detail);
    const hasSelection = selectedId !== null;

    return (
        <div className="bg-[var(--color-card)] border border-black/[0.08] rounded-lg px-4 sm:px-6 py-5 sm:py-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-ink/70">
                    <FileText size={13} strokeWidth={2.25} />
                    Resume and skills
                </h3>

                <input
                    ref={fileInput}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFile}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-md bg-[var(--color-ink)] text-[var(--color-parchment)] px-3.5 py-2 text-xs font-bold tracking-wide shadow-sm hover:bg-[var(--color-ochre-dark)] transition-all duration-200 disabled:opacity-50"
                >
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploading ? "Uploading" : "Upload resume"}
                </button>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-4 text-xs font-medium text-[var(--color-ochre-dark)] bg-[var(--color-ochre-light)] rounded-md px-3 py-2 break-words"
                >
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center gap-2 text-ink/60 text-sm py-6">
                    <Loader2 size={16} className="animate-spin" />
                    Loading your resumes…
                </div>
            ) : resumes.length === 0 ? (
                <div className="text-center py-8 text-ink/50">
                    <FileText size={28} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No resume uploaded yet.</p>
                    <p className="text-xs mt-1">Upload a PDF or DOCX (up to {MAX_MB} MB) to see which ESG skills we detect.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Left: resumes + detected skills */}
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink/70 mb-1.5">Your resumes</p>
                        <ul className="mb-5 max-h-40 overflow-y-auto -mx-1 px-1">
                            {resumes.map((r) => {
                                const active = r.id === selectedId;
                                return (
                                    <li key={r.id}>
                                        <button
                                            type="button"
                                            onClick={() => !active && selectResume(r.id)}
                                            className={`w-full flex items-center justify-between gap-3 text-left rounded-md px-2.5 py-2 text-xs transition-colors ${
                                                active
                                                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold"
                                                    : "text-ink/70 hover:bg-black/[0.04]"
                                            }`}
                                        >
                                            <span className="truncate">{fileName(r)}</span>
                                            {uploadedOn(r) && (
                                                <span className="shrink-0 text-[10px] text-ink/50 font-normal">
                                                    {new Date(uploadedOn(r)).toLocaleDateString(undefined, {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>

                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink/70 mb-1.5">
                            Skills detected in this resume
                        </p>
                        {detailLoading ? (
                            <div className="flex items-center gap-2 text-ink/60 text-xs py-2">
                                <Loader2 size={14} className="animate-spin" />
                                Reading resume…
                            </div>
                        ) : skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {skills.map((s) => (
                                    <span
                                        key={s}
                                        className={`${CHIP} bg-[var(--color-primary-light)] text-[var(--color-primary)]`}
                                    >
                                        {prettySkill(s)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-ink/60 leading-relaxed">
                                No ESG skills were recognised. Detection matches known phrases such as "carbon accounting"
                                or "ESG reporting", so it can miss experience worded differently. Scanned PDFs may also
                                have no readable text.
                            </p>
                        )}

                        {hasSelection && !detailLoading && (
                            <button
                                type="button"
                                onClick={() => navigate("/predict", { state: { resumeId: selectedId } })}
                                className="mt-5 inline-flex items-center gap-2 rounded-md border border-black/12 px-3.5 py-2 text-xs font-semibold text-ink/80 hover:bg-black/[0.04] transition-colors"
                            >
                                Use in assessment
                                <ArrowRight size={14} />
                            </button>
                        )}
                    </div>

                    {/* Right: skill gap */}
                    <div className="min-w-0 md:border-l md:border-black/[0.08] md:pl-8">
                        <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink/70 mb-3">
                            <Target size={13} strokeWidth={2.25} />
                            Skill gap
                        </h4>
                        {detailLoading ? (
                            <div className="flex items-center gap-2 text-ink/60 text-xs py-2">
                                <Loader2 size={14} className="animate-spin" />
                                Comparing skills…
                            </div>
                        ) : (
                            <SkillGapCard gap={gap} gapError={gapError} hasResume={hasSelection} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
