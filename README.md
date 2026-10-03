# SkillGreen

**ESG Career Readiness Platform**

A full-stack application for assessing and tracking professional ESG career readiness across Environmental, Social, and Governance dimensions — combining a trained ML model, user accounts, resume-based skill analysis, and a persistent dashboard.

**Live Demo:** [skill-green.vercel.app](https://skill-green.vercel.app)
**API:** [skillgreen.onrender.com](https://skillgreen.onrender.com) · [Interactive docs](https://skillgreen.onrender.com/docs)

> The backend runs on a free-tier instance and may take up to 50 seconds to respond on the first request after a period of inactivity.

---

## Overview

SkillGreen started as a single-prediction ML demo and has grown into a full platform: people create an account, build a profile, run ESG readiness assessments, upload a resume for automated skill extraction, see a skill-gap analysis toward the next readiness tier, and track their progress over time on a dashboard.

Instead of relying exclusively on resume keyword matching for the whole assessment, the system analyzes structured professional attributes — industry, education, experience, and ESG exposure — and (optionally) a resume, which is parsed deterministically to extract relevant skills and pre-fill the assessment.

Each assessment produces:

| Output | Description |
|---|---|
| ESG Readiness | Low / Medium / High |
| Confidence | Model confidence for the prediction |
| Environmental Score | Environmental capability indicator |
| Social Score | Social capability indicator |
| Governance Score | Governance capability indicator |
| Weakest Pillar | The single ESG dimension to prioritize next |
| Score Explanation | Exact factor-by-factor breakdown of the scoring formula |

The project combines synthetic data generation, exploratory data analysis, feature engineering, supervised machine learning, authentication, a relational database, deterministic resume parsing, FastAPI, React, and automated CI into one applied system.

---

## Platform Features

Beyond the core ML prediction, SkillGreen is a real product with:

- **Authentication** — email/password, plus a passwordless emailed one-time-code option
- **Persistent accounts** — PostgreSQL-backed, with version-controlled schema migrations (Alembic)
- **User profiles** — industry, experience, education, and certification, saved once and reused
- **Assessment history & dashboard** — every assessment is logged; the dashboard shows the latest readiness, a trend over time, and full history
- **Resume upload & parsing** — PDF/DOCX upload, deterministic text extraction (no LLM call)
- **Skill extraction** — taxonomy-based keyword matching against a curated ESG skill list
- **Skill-gap analysis** — structured comparison between a person's extracted skills and what's expected at the next readiness tier
- **Score explainability** — an exact, formula-level breakdown of how each input contributes to the readiness score (explicitly distinguished from explaining the trained model's internal behavior — see [Limitations](#limitations))
- **CI** — every push runs the full test suite against a fresh, disposable Postgres container
- **Containerized** — backend, frontend, and database all run together via Docker Compose

A deliberate design principle throughout: **don't add AI just because AI is available**. Resume parsing, skill extraction, and skill-gap comparison are all deterministic — the one trained ML model is reserved for the one job that's actually a classification problem (ESG readiness scoring).

---

## Problem Statement

The growing adoption of ESG practices is creating demand for professionals with sustainability-related capabilities. However, professionals often lack a structured way to determine how their existing experience translates to ESG-oriented roles, which ESG dimension represents their strongest capability, where their primary skill gaps exist, and how prepared they are for a career transition.

Recruiters face a related challenge. Traditional resume screening frequently relies on keyword matching, which can overlook relevant ESG capabilities developed through adjacent industries and professional responsibilities.

For example, a manufacturing professional may have experience in environmental compliance, operational processes, workplace safety, or governance without explicitly using ESG terminology in their resume.

SkillGreen explores a structured approach to identifying and quantifying these transferable capabilities — and, as of this version, tracking how they change over time.

---

## Approach

```text
Professional Profile (+ optional Resume)
           │
           ▼
┌─────────────────────┐
│   Input Validation  │
│       Pydantic      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Feature Engineering │
│                     │
│ Environmental       │
│ Social              │
│ Governance          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   ML Prediction     │
│  Gradient Boosting  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   ESG Readiness     │
│                     │
│ Low / Medium / High │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Explainable Profile │
│                     │
│ E / S / G Scores    │
│ Confidence          │
│ Formula Breakdown   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Saved to Postgres  │
│  (if logged in)     │
└─────────────────────┘
```

---

## Data Strategy

A suitable public dataset containing individual-level ESG career-readiness outcomes was not available for this project. SkillGreen therefore uses a transparent synthetic-data generation methodology, based on documented scoring rules and controlled randomness, grounded in the standard Environmental / Social / Governance framework.

**Dataset characteristics:**

- 8,000 synthetic professional profiles
- Multiple education levels and industries
- Varied experience levels
- ESG certification status
- Environmental, Social, and Governance exposure flags
- ESG readiness labels

The generated data intentionally incorporates non-uniform distributions to represent heterogeneous professional profiles — for example, Bachelor's degrees are more common than PhDs, ESG certifications are relatively uncommon, and ESG exposure varies across industries and experience levels.

---

## Exploratory Data Analysis

**Class distribution.** The Low readiness category represents roughly 10-15% of the dataset depending on the generation seed. Class-aware modelling considerations were used during training to reduce potential bias toward majority classes.

**ESG dimensions.** The engineered Environmental, Social, and Governance scores provide stronger separation between readiness categories than any individual raw attribute — supporting the underlying design assumption that ESG career readiness is a multidimensional capability rather than a single raw attribute.

**Controlled label noise.** Approximately 5% controlled label noise was introduced during dataset generation. Without noise, the model could learn the deterministic scoring formula directly rather than solving a meaningful classification problem.

---

## Machine Learning Methodology

SkillGreen evaluates multiple classification algorithms rather than selecting a model arbitrarily.

| Model | Role |
|---|---|
| Logistic Regression | Linear baseline |
| Decision Tree | Interpretable nonlinear baseline |
| Random Forest | Ensemble baseline |
| Gradient Boosting | Nonlinear ensemble model |

Models were evaluated using 5-fold cross-validation with F1-macro as the primary comparison metric, selected because it provides balanced evaluation across classes in the presence of class imbalance.

### Selected Model & Results

**Gradient Boosting** achieved the strongest overall performance and was selected for the final prediction pipeline.

| Metric | Result |
|---|---:|
| Test Accuracy | **94.81%** |
| Test F1-Macro | **0.926** |
| Cross-Validation | 5-fold |
| Dataset | Synthetic |

> **Important:** these metrics measure performance against synthetically generated labels based on the project's scoring framework. They should not be interpreted as real-world hiring prediction accuracy.

---

## Feature Engineering

Rather than passing only raw professional attributes to the model, the application derives structured ESG features representing the three ESG dimensions. This logic is implemented using Pydantic's `computed_field`, so the exact same feature calculation runs both at training time and on live API requests — eliminating the risk of drift between how the model was trained and how it's actually used.

```text
  Professional Attributes
             │
             ▼
┌────────────────────────┐
│ ESG Feature Engineering│
└────────────┬───────────┘
             │
       ┌─────┼─────┐
       ▼     ▼     ▼
       E     S     G
       │     │     │
       └─────┼─────┘
             ▼
      Readiness Features
             │
             ▼
       ML Classification
```

---

## System Architecture

```text
┌─────────────────────────┐
│      React Frontend     │
│    Vite · React Router  │
└────────────┬────────────┘
             │ HTTPS
             ▼
┌─────────────────────────┐
│     FastAPI Backend     │
│   CORS · JWT Auth       │
└────────────┬────────────┘
             │
      ┌──────┼───────────────┐
      ▼                      ▼
┌───────────────┐   ┌─────────────────────┐
│  PostgreSQL   │   │ Pydantic Validation │
│ users/profiles│   │ & Feature Eng.      │
│ assessments   │   └──────────┬──────────┘
│ otp_codes     │              ▼
│ resumes       │   ┌─────────────────────┐
└───────────────┘   │    ML Prediction    │
                     │   Gradient Boosting │
                     └──────────┬──────────┘
                                ▼
                     ┌─────────────────────┐
                     │ Prediction Response │
                     │ E/S/G + Confidence  │
                     │ + Formula Breakdown │
                     └─────────────────────┘
```

**Deployment:** FastAPI backend on Render · PostgreSQL on Render · React frontend on Vercel · CI on GitHub Actions.

---

## Technology Stack

**Backend** — Python, FastAPI, Pydantic, Uvicorn

**Database & ORM** — PostgreSQL, SQLAlchemy, Alembic (migrations)

**Authentication** — Passlib + bcrypt (password hashing), python-jose (JWT), email-based one-time codes

**Resume Processing** — pdfplumber (PDF text extraction), python-docx (DOCX text extraction), a deterministic skill taxonomy (no LLM)

**Data Science & Machine Learning** — NumPy, pandas, scikit-learn, synthetic data generation, exploratory data analysis, feature engineering, cross-validation, model evaluation

**Frontend** — React, React Router, Vite, lucide-react, Tailwind CSS

**Testing & CI** — pytest, httpx, GitHub Actions (runs against a disposable Postgres service container on every push)

**Infrastructure** — Docker, Docker Compose, nginx, Render (backend + database), Vercel (frontend)

---

## Project Structure

```text
SkillGreen/
├── README.md
├── requirements.txt
├── requirements-dev.txt       # runtime deps + pytest/httpx, used by CI
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── pytest.ini
├── alembic.ini
├── app.py
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── alembic/
│   └── versions/               # schema migrations
│
├── auth/
│   ├── __init__.py
│   ├── routes.py                # register / login / OTP request+verify
│   ├── security.py              # hashing, JWT, OTP generation & email
│   └── dependencies.py          # get_current_user, get_current_user_optional
│
├── db/
│   ├── __init__.py
│   ├── database.py              # engine, session, env-driven config
│   └── models.py                # User, Profile, Assessment, OtpCode, Resume
│
├── routes/
│   ├── __init__.py
│   ├── profile.py                # GET/POST /profile, GET /assessments
│   └── resume.py                 # upload, parse, skill-gap, inferred fields
│
├── resume/
│   ├── __init__.py
│   ├── parser.py                 # PDF/DOCX → raw text
│   ├── skills.py                  # raw text → extracted skills
│   ├── skill_gap.py               # extracted skills vs target tier
│   └── infer_fields.py            # extracted skills → predict() inputs
│
├── config/
│   ├── __init__.py
│   ├── constants.py
│   ├── skills_taxonomy.py         # canonical skills + synonyms
│   └── skill_requirements.py      # target skills per readiness tier
│
├── model/
│   ├── __init__.py
│   ├── skillgreen_model.ipynb
│   ├── model.pkl
│   ├── predict.py
│   └── explain.py                 # exact scoring-formula breakdown
│
├── schema/
│   ├── __init__.py
│   ├── user_input.py
│   ├── response_model.py
│   ├── auth.py
│   └── profile.py
│
├── data/
│   └── data_generator.py          # CSV is generated, not committed
│
├── tests/
│   ├── test_app.py
│   └── test_auth.py
│
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx                    # route definitions
        ├── index.css                  # shared design tokens
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Predictor.jsx
        │   └── Dashboard.jsx
        ├── components/
        │   ├── Header.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── OtpLogin.jsx
        │   └── ResumePanel.jsx
        ├── context/
        │   └── AuthContext.jsx
        └── lib/
            ├── api.js
            └── designConstants.js
```

---

## Installation

**Clone the repository**

```bash
git clone https://github.com/Jitin2102/SkillGreen.git
cd SkillGreen
```

**Create a virtual environment**

Windows:
```bash
python -m venv myenv
myenv\Scripts\Activate.ps1
```

Linux / macOS:
```bash
python3 -m venv myenv
source myenv/bin/activate
```

**Install dependencies**

```bash
python -m pip install -r requirements-dev.txt
```
(`requirements.txt` alone — no dev/test tooling — is what the Docker image and production deploy use.)

**Set up environment variables**

Create a `.env` file at the project root (see `.env.example` for the full list):

```
DATABASE_URL=postgresql://postgres:devpass@localhost:5432/skillgreen
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
```

Optional, for real OTP emails instead of console-only output in dev:
```
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
```

**Start PostgreSQL** (via Docker, if you don't have it running already)

```bash
docker run --name skillgreen-db -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=skillgreen -p 5432:5432 -d postgres:16
```

**Run migrations**

```bash
alembic upgrade head
```

---

## Running Locally

**Start the backend**

```bash
uvicorn app:app --reload
```

API available at `http://127.0.0.1:8000`, interactive docs at `http://127.0.0.1:8000/docs`.

**Start the frontend** (in a separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local` (gitignored, not committed) with `VITE_API_BASE=http://127.0.0.1:8000` to point the frontend at your local backend instead of production.

---

## Running with Docker

The full stack — backend, frontend, and Postgres — runs together via Compose:

```bash
docker compose up --build
```

Then run migrations inside the running backend container (a fresh Postgres container has no tables yet):

```bash
docker compose exec backend alembic upgrade head
```

- Backend: `http://localhost:8000` (docs at `/docs`)
- Frontend: `http://localhost:5173`
- Postgres: `localhost:5432` (persisted in a named volume)

> `VITE_API_BASE` is a Vite build-time variable — if it's unset, the frontend falls back to the deployed production API URL, even in a local container. Keep a `frontend/.env.local` (never committed) if you need the local container to talk to a local backend instead.

---

## Testing

```bash
pytest tests/ -v
```

The test suite covers the core prediction API (valid/invalid inputs, Pydantic validation, boundary values) and the full authentication flow (register, login, duplicate-email rejection, wrong-password rejection, protected-route access with and without a valid token).

**Current status: 19 / 19 tests passing.**

CI runs this same suite on every push and pull request, against a fresh, disposable Postgres service container — not against any locally-running database — so a passing CI run is a genuine from-scratch verification, not just "works on my machine."

---

## End-to-End Workflow

1. **Account** — register with email/password, or request an emailed one-time code (OTP) — no password needed for that path
2. **Profile** — industry, education, years of experience, ESG certification, saved once and reused
3. **Resume (optional)** — upload a PDF/DOCX; text is extracted deterministically and matched against a skill taxonomy
4. **Assessment input** — manual entry, optionally pre-filled from resume-derived signals (always shown for review, never auto-submitted)
5. **Model inference** — the trained Gradient Boosting pipeline scores the processed features
6. **Classification & explanation** — Low/Medium/High, plus an exact breakdown of how each input contributed to the score
7. **Skill gap** — if a resume was uploaded, a comparison against the skills expected at the next readiness tier
8. **Persistence** — logged-in users have the assessment saved to their history automatically
9. **Dashboard** — readiness trend over time, full assessment history, profile management

---

## Example API Responses

**`POST /predict`**
```json
{
  "predicted_category": "High",
  "confidence": 0.961,
  "pillar_breakdown": {
    "environmental": 22,
    "social": 0,
    "governance": 10
  },
  "weakest_pillar": "social"
}
```

**`POST /predict/explain`**
```json
{
  "contributions": {
    "years_experience": 12.0,
    "relevant_skills_count": 9.0,
    "has_esg_certification": 6,
    "environmental_project_exposure": 6,
    "governance_exposure": 0,
    "social_impact_exposure": 0
  },
  "total_from_these_factors": 33.0,
  "explains": "scoring_formula"
}
```

**`GET /resume/{id}/skill-gap`**
```json
{
  "target_category": "High",
  "matched": ["esg reporting", "regulatory compliance"],
  "missing": ["carbon accounting", "corporate governance", "risk management"],
  "extra": ["project management"],
  "current_category": "Medium"
}
```

Schemas defined in `schema/response_model.py`, `schema/auth.py`, and `schema/profile.py`.

---

## Validation

| Layer | Validation |
|---|---|
| Data | 8,000 profiles generated and inspected |
| ML | 4 classification models compared via cross-validation |
| Model | Gradient Boosting selected on F1-macro |
| Backend | FastAPI and Pydantic tested end-to-end |
| Auth | Register/login/OTP flows tested, including failure cases |
| Integration | ML model integrated with API, verified with real inputs |
| Frontend | React + Router interface implemented and tested live |
| Testing | 19 / 19 automated tests passing |
| Input hardening | Adversarial inputs tested (unbounded values, typo'd fields); confirmed rejected |
| Containerization | Backend, frontend, and Postgres run together via Compose, verified end-to-end |
| CI | Full suite runs against a disposable Postgres container on every push |
| Deployment | Backend + Postgres live on Render, frontend live on Vercel |

---

## Intended Use Cases

**Professionals** can use SkillGreen to understand their current ESG readiness, identify their strongest ESG dimension, spot potential skill gaps from an uploaded resume, and track how their readiness changes as they build relevant experience.

**Recruiters and hiring teams** can use it for initial candidate screening, structured candidate comparison, and identifying transferable ESG capabilities beyond simple keyword matching.

> SkillGreen is intended as a decision-support system, not an automated employment decision-maker.

---

## Limitations

The current system has an important methodological limitation: **the training data is synthetic**. The model does not currently learn from actual hiring outcomes or professionally validated ESG assessments.

Consequently:

- The 94.81% accuracy should not be interpreted as real-world hiring accuracy
- Labels reflect the project's defined ESG scoring framework, not observed outcomes
- Synthetic data cannot fully represent the complexity of real professional careers
- The system has not been validated against real career-transition outcomes
- Predictions should not be used as the sole basis for recruitment or employment decisions

**On explainability specifically:** `/predict/explain` returns an exact breakdown of the *scoring formula* the synthetic training data was generated from — not an analysis of the *trained model's* actual learned behavior, which could diverge since the model was trained on that formula plus 5% label noise. The response is explicitly labeled `"explains": "scoring_formula"` to keep this distinction visible rather than implying the breakdown describes the model's internal reasoning.

**On resume-derived fields specifically:** skill extraction is deterministic keyword/phrase matching against a curated taxonomy, not NLP. It can both miss real experience phrased differently than the taxonomy expects, and occasionally over-match. Inferred fields are always presented for the user to review before an assessment is submitted, never submitted automatically on their behalf.

These limitations are documented explicitly to maintain transparency around the current scope of the system.

---

## Model Iteration & Hardening

After the initial version shipped, testing with real-world-style inputs surfaced two categories of issues, both investigated and fixed rather than patched superficially.

**Scoring formula rebalanced.** The original weights let boolean flags (certification, exposure checkboxes) dominate over years of experience and skills count — a profile with 0 years of experience and 0 skills could reach "Medium" readiness purely from two checkboxes and a certification. Weights were rebalanced so experience and skill depth carry meaningfully more influence than flat flags:

| Parameter | Before | After |
|---|---:|---:|
| Years of experience weight | 0.3 / year | 1.0 / year |
| Skills count weight | 2 / skill | 3 / skill |
| Each exposure/certification bonus | 10 | 6 |
| Low / Medium thresholds | 15 / 30 | 20 / 45 |

The full 8,000-row dataset was regenerated with the new weights and the model retrained from scratch, comparing all four candidate algorithms again rather than assuming the previous winner still held. Gradient Boosting won again, with comparable accuracy (94.81% vs. 94.75%) — confirming the rebalance fixed the edge-case behavior without degrading overall performance.

**Input validation hardened.** Testing the API against unusual and adversarial inputs found two real gaps:

- `relevant_skills_count` had no upper bound. A value like 999,999,999 passed validation and produced an esg_readiness_score in the billions. Fixed with an upper bound (`le=30`).
- Unexpected or typo'd fields (e.g. `yeras_experience`) were silently ignored by default rather than rejected, which could mask client-side bugs. Fixed by setting `extra="forbid"` on the input schema.

Separately, the `/predict` endpoint's error handler previously returned raw exception text to the client, which could leak internal details (file paths, library internals) on failure. It now logs full detail server-side and returns only a generic message to the client.

All fixes were verified with actual adversarial test inputs run against the live schema and API — not just reasoned about — confirming each attack is now rejected while legitimate requests, including exact boundary values, still succeed correctly.

---

## Future Development

**Real-world data** — ESG job descriptions, skill requirements, professional career profiles, certifications, career-transition outcomes, and expert-labelled assessments to replace synthetic labels.

**Model-level explainability** — the current `/predict/explain` describes the scoring formula; a further step would compute SHAP values against the actual trained model to explain its real learned behavior, which can diverge from the formula near category boundaries.

**ESG job matching** — extending from `Profile → ESG Readiness → Skill Gap` (now built) to `→ Recommended Learning Resources → Relevant ESG Roles`.

**Richer skill taxonomy** — the current taxonomy is a starting point; expanding it against real resume data, and potentially supporting fuzzy/synonym matching beyond exact phrase matching.

**Outcome-based learning** — incorporating validated career outcomes over time to progressively reduce dependence on synthetic scoring rules.

---

## Learning Journey

SkillGreen provided practical experience across data science, machine learning, backend engineering, frontend development, and software engineering — moving from Pydantic fundamentals and single-model validation through nested models, computed fields, a full CRUD API, authentication, a relational database, deterministic document parsing, and finally a complete applied system with a trained model, persistent accounts, a tested backend, a deployed frontend, and CI.

The most significant shift wasn't technical knowledge alone, but a change in working process: moving from "does it run once" to "can I prove it works" — writing and running tests instead of eyeballing output, running the full suite against a disposable database in CI rather than trusting a local environment, and documenting honestly what's genuinely validated versus what remains a planned next step (including being explicit about what the explainability feature does and doesn't actually explain).

---

## Key Takeaway

SkillGreen demonstrates the complete development lifecycle of an applied machine learning system: problem definition, data strategy, synthetic data generation, exploratory analysis, feature engineering, model comparison and training, authentication, persistent storage, document processing, API development, frontend integration, automated testing, CI, and deployment.

The current version demonstrates a functional technical pipeline for structured ESG career-readiness assessment and tracking. The next major step is validation against real-world ESG career requirements and outcomes.

> The objective is to develop an ESG readiness signal that is not only technically measurable, but also meaningful in real-world career contexts.

---

## Project Status

| Attribute | Status |
|---|---|
| Project Status | Working platform, deployed |
| Dataset | 8,000 synthetic profiles |
| Selected Model | Gradient Boosting |
| Test Accuracy | 94.81% |
| Test F1-Macro | 0.926 |
| Automated Tests | 19 / 19 passing |
| CI | GitHub Actions, runs against a disposable Postgres container |
| Backend | FastAPI, live on Render |
| Database | PostgreSQL, live on Render |
| Frontend | React + Vite, live on Vercel |
| Auth | Password + emailed one-time code |
| Resume Processing | PDF/DOCX parsing, deterministic skill extraction, skill-gap analysis |
| Current Focus | Real-world validation; model-level (not just formula-level) explainability |

---

## License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

---

## Contributing

Contributions, suggestions, and improvements are welcome. If you find SkillGreen useful, consider starring the repository and sharing feedback.
