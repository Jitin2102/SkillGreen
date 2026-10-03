export const API_BASE = (import.meta.env.VITE_API_BASE || "https://skillgreen.onrender.com").replace(/\/$/, "");
export const PREDICT_PATH = "/predict";
export const OPTIONS_PATH = "/options"; // returns { industries, education_levels }
export const REQUEST_TIMEOUT_MS = 60000; // Render free tier cold start

export const INITIAL_FORM = {
  current_industry: "",
  education_level: "",
  years_experience: 3,
  relevant_skills_count: 0,
  has_esg_certification: false,
  environmental_project_exposure: false,
  social_impact_exposure: false,
  governance_exposure: false,
};

export const toPayload = (f) => ({
  current_industry: f.current_industry,
  education_level: f.education_level,
  years_experience: Number(f.years_experience),
  relevant_skills_count: Number(f.relevant_skills_count),
  has_esg_certification: f.has_esg_certification,
  environmental_project_exposure: f.environmental_project_exposure,
  social_impact_exposure: f.social_impact_exposure,
  governance_exposure: f.governance_exposure,
});

// Response -> view model (keys from schema/response_model.py)
export const fromResponse = (r) => ({
  category: r.predicted_category,
  confidence: r.confidence,
  pillars: r.pillar_breakdown,
  weakest: r.weakest_pillar,
});

export const LIMITS = { years: { min: 0, max: 50 }, skills: { min: 0, max: 30 } };

export const PILLARS = [
  { key: "environmental", label: "Environmental", cssVar: "--pillar-e", max: LIMITS.skills.max * 3 + 6 },
  { key: "social", label: "Social", cssVar: "--pillar-s", max: 6 },
  { key: "governance", label: "Governance", cssVar: "--pillar-g", max: 6 },
];

export const LEVEL_VAR = { Low: "--level-low", Medium: "--level-mid", High: "--level-high" };

export const NAV = [
  { id: "assess", label: "Assess" },
  { id: "method", label: "How it works" },
  { id: "about", label: "About" },
];
export const EXPLAIN_PATH = "/predict/explain";
export const THRESHOLDS = { low: 20, medium: 45 }; // LOW_THRESHOLD / MEDIUM_THRESHOLD in config/constants.py
// Keys from model/explain.py -> display names
export const FACTOR_LABELS = {
  years_experience: "Years of experience",
  relevant_skills_count: "ESG skills",
  environmental_project_exposure: "Environmental project work",
  social_impact_exposure: "Social impact work",
  governance_exposure: "Governance work",
  has_esg_certification: "ESG certification",
};
