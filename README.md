# SkillGreen

**ESG Career Readiness Assessment Platform**

An end-to-end machine learning application for assessing professional ESG career readiness across Environmental, Social, and Governance dimensions.

SkillGreen evaluates structured professional profiles and generates an ESG readiness assessment using machine learning, feature engineering, and an API-driven full-stack architecture.

**Live Demo:** [skill-green.vercel.app](https://skill-green.vercel.app)
**API:** [skillgreen.onrender.com](https://skillgreen.onrender.com) · [Interactive docs](https://skillgreen.onrender.com/docs)

> The backend runs on a free-tier instance and may take up to 50 seconds to respond on the first request after a period of inactivity.

---

## Overview

SkillGreen is an end-to-end machine learning application designed to assess how prepared a professional may be for ESG and sustainability-oriented career opportunities.

Instead of relying exclusively on resume keyword matching, the system analyzes structured professional attributes including industry, education, professional experience, and exposure to Environmental, Social, and Governance work.

These attributes are transformed into an ESG profile containing:

| Output | Description |
|---|---|
| ESG Readiness | Low / Medium / High |
| Confidence | Model confidence for the prediction |
| Environmental Score | Environmental capability indicator |
| Social Score | Social capability indicator |
| Governance Score | Governance capability indicator |
| Weakest Pillar | The single ESG dimension to prioritize next |

The project combines synthetic data generation, exploratory data analysis, feature engineering, supervised machine learning, FastAPI, Pydantic, React, and automated testing into a complete ML application.

---

## Problem Statement

The growing adoption of ESG practices is creating demand for professionals with sustainability-related capabilities. However, professionals often lack a structured way to determine how their existing experience translates to ESG-oriented roles, which ESG dimension represents their strongest capability, where their primary skill gaps exist, and how prepared they are for a career transition.

Recruiters face a related challenge. Traditional resume screening frequently relies on keyword matching, which can overlook relevant ESG capabilities developed through adjacent industries and professional responsibilities.

For example, a manufacturing professional may have experience in environmental compliance, operational processes, workplace safety, or governance without explicitly using ESG terminology in their resume.

SkillGreen explores a structured approach to identifying and quantifying these transferable capabilities.

---

## Approach

```text
Professional Profile
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
└─────────────────────┘
```

The system converts structured professional information into ESG pillar scores and uses these engineered features to classify overall ESG career readiness.

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

**Class distribution.** The Low readiness category represents approximately 15% of the dataset. Class-aware modelling considerations were used during training to reduce potential bias toward majority classes.

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
| Test Accuracy | **94.75%** |
| Test F1-Macro | **0.935** |
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
│          Vite           │
└────────────┬────────────┘
             │ HTTPS
             ▼
┌─────────────────────────┐
│     FastAPI Backend     │
│          CORS           │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Pydantic Validation &   │
│ Feature Engineering     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│    ML Prediction        │
│   Gradient Boosting     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│    Prediction Response  │
│ E / S / G + Confidence  │
└─────────────────────────┘
```

**Deployment:** FastAPI backend on Render · React frontend on Vercel.

---

## Technology Stack

**Backend** — Python, FastAPI, Pydantic, pytest

**Data Science & Machine Learning** — NumPy, pandas, scikit-learn, synthetic data generation, exploratory data analysis, feature engineering, cross-validation, model evaluation

**Frontend** — React, Vite, lucide-react, CSS

---

## Project Structure

```text
SkillGreen/
├── README.md
├── requirements.txt
├── .gitignore
├── pytest.ini
├── app.py
│
├── config/
│   ├── __init__.py
│   └── constants.py
│
├── data/
│   ├── data_generator.py
│   └── skillgreen.csv
│
├── model/
│   ├── __init__.py
│   ├── model.ipynb
│   ├── model.pkl
│   └── predict.py
│
├── schema/
│   ├── __init__.py
│   ├── user_input.py
│   └── response_model.py
│
├── tests/
│   └── test_app.py
│
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── index.css
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
python -m venv .venv
.venv\Scripts\activate
```

Linux / macOS:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Install dependencies**

```bash
pip install -r requirements.txt
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

Vite will print the local development URL. The frontend communicates with the FastAPI backend over HTTP — update `API_BASE` in `frontend/src/App.jsx` if you're pointing at a different backend location.

---

## Testing

```bash
pytest
```

The test suite contains 11 automated tests covering valid API requests, invalid input handling, Pydantic validation, prediction responses, and model integration.

**Current status: 11 / 11 tests passing.**

---

## End-to-End Workflow

1. **Profile input** — industry, education, years of experience, ESG certification, and Environmental / Social / Governance exposure
2. **Input validation** — Pydantic rejects invalid or out-of-range values before anything else runs
3. **Feature engineering** — Environmental, Social, and Governance scores are computed via `computed_field`
4. **Model inference** — the trained Gradient Boosting pipeline scores the processed features
5. **Classification** — the model returns Low, Medium, or High
6. **Response** — the frontend presents the full readiness profile: category, confidence, pillar breakdown, and weakest pillar

---

## Example API Response

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

Response schema defined in `schema/response_model.py`.

---

## Validation

| Layer | Validation |
|---|---|
| Data | 8,000 profiles generated and inspected |
| ML | 4 classification models compared via cross-validation |
| Model | Gradient Boosting selected on F1-macro |
| Backend | FastAPI and Pydantic tested end-to-end |
| Integration | ML model integrated with API, verified with real inputs |
| Frontend | React + Vite interface implemented and tested live |
| Testing | 11 / 11 automated tests passing |
| Deployment | Backend live on Render, frontend live on Vercel |

---

## Intended Use Cases

**Professionals** can use SkillGreen to understand their current ESG readiness, identify their strongest ESG dimension, spot potential skill gaps, and assess how their existing experience might transfer toward ESG-oriented roles.

**Recruiters and hiring teams** can use it for initial candidate screening, structured candidate comparison, and identifying transferable ESG capabilities beyond simple keyword matching.

> SkillGreen is intended as a decision-support system, not an automated employment decision-maker.

---

## Limitations

The current system has an important methodological limitation: **the training data is synthetic**. The model does not currently learn from actual hiring outcomes or professionally validated ESG assessments.

Consequently:

- The 94.75% accuracy should not be interpreted as real-world hiring accuracy
- Labels reflect the project's defined ESG scoring framework, not observed outcomes
- Synthetic data cannot fully represent the complexity of real professional careers
- The system has not been validated against real career-transition outcomes
- Predictions should not be used as the sole basis for recruitment or employment decisions

These limitations are documented explicitly to maintain transparency around the current scope of the system.

---

## Future Development

**Real-world data** — ESG job descriptions, skill requirements, professional career profiles, certifications, career-transition outcomes, and expert-labelled assessments to replace synthetic labels.

**Explainability** — feature importance, SHAP-based explanations, personalized skill-gap recommendations, and suggested ESG career pathways.

**ESG job matching** — extending from `Profile → ESG Readiness` to `Profile → ESG Readiness → Skill Gap Analysis → Recommended Skills → Relevant ESG Roles`.

**Outcome-based learning** — incorporating validated career outcomes over time to progressively reduce dependence on synthetic scoring rules.

---

## Learning Journey

SkillGreen provided practical experience across data science, machine learning, backend engineering, frontend development, and software engineering — moving from Pydantic fundamentals and single-model validation through nested models, computed fields, a full CRUD API, and finally a complete applied ML system with a trained model, tested backend, deployed frontend, and automated test suite.

The most significant shift wasn't technical knowledge alone, but a change in working process: moving from "does it run once" to "can I prove it works" — writing and running tests instead of eyeballing output, executing notebooks to completion rather than assuming correctness, and documenting honestly what's genuinely validated versus what remains a planned next step.

---

## Key Takeaway

SkillGreen demonstrates the complete development lifecycle of an applied machine learning system: problem definition, data strategy, synthetic data generation, exploratory analysis, feature engineering, model comparison and training, API development, frontend integration, automated testing, and deployment.

The current prototype demonstrates a functional technical pipeline for structured ESG career-readiness assessment. The next major step is validation against real-world ESG career requirements and outcomes.

> The objective is to develop an ESG readiness signal that is not only technically measurable, but also meaningful in real-world career contexts.

---

## Project Status

| Attribute | Status |
|---|---|
| Project Status | Working prototype, deployed |
| Dataset | 8,000 synthetic profiles |
| Selected Model | Gradient Boosting |
| Test Accuracy | 94.75% |
| Test F1-Macro | 0.935 |
| Automated Tests | 11 / 11 passing |
| Backend | FastAPI, live on Render |
| Frontend | React + Vite, live on Vercel |
| Current Focus | Real-world validation |

---

## License

MIT License

---

## Contributing

Contributions, suggestions, and improvements are welcome. If you find SkillGreen useful, consider starring the repository and sharing feedback.
