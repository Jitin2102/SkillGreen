# SkillGreen — ESG Career Readiness Assessment

> An AI-powered application that evaluates professional experience across Environmental, Social, and Governance (ESG) dimensions and generates an actionable career-readiness profile.

## Overview

**SkillGreen** is an end-to-end machine learning application designed to assess how prepared a professional may be for ESG and sustainability-oriented career opportunities.

Rather than relying exclusively on resume keywords, SkillGreen evaluates structured professional attributes such as:

* Industry
* Education
* Professional experience
* ESG certifications
* Environmental exposure
* Social exposure
* Governance exposure

The system transforms these inputs into an explainable ESG readiness profile containing:

* **ESG Readiness Category:** Low / Medium / High
* **Confidence Score**
* **Environmental Score**
* **Social Score**
* **Governance Score**
* **Actionable areas for improvement**

The project integrates **synthetic data generation, exploratory data analysis, feature engineering, machine learning, FastAPI, Pydantic, React, automated testing, and API integration** into a complete ML application.

---

## Problem Statement

As organizations increasingly incorporate sustainability and ESG practices into their operations, professionals need a clearer way to understand how their existing experience translates into ESG-oriented roles.

However, individuals often lack a structured method to determine:

* How transferable their existing professional experience is to ESG roles
* Which ESG dimension represents their strongest capability
* Where their primary ESG skill gaps exist
* How prepared they are for an ESG-focused career transition

Recruiters face a related challenge. Traditional resume screening frequently depends on keyword matching, which can overlook relevant capabilities developed through adjacent industries and roles.

### Example

A professional with several years of manufacturing experience may possess valuable knowledge related to environmental compliance, operational efficiency, worker safety, and governance processes. A conventional keyword-based screening system may fail to recognize these transferable ESG capabilities.

**SkillGreen explores a structured readiness signal that quantifies career alignment across the Environmental, Social, and Governance dimensions.**

---

## Solution

SkillGreen converts structured professional information into ESG pillar scores and uses these features to classify overall ESG career readiness.

```text
Professional Profile
        │
        ▼
┌─────────────────────┐
│   Input Validation   │
│       Pydantic       │
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

---

## Research & Data Strategy

A major challenge in developing SkillGreen was the lack of a suitable public dataset containing individual-level ESG career-readiness outcomes.

Instead of adapting an unrelated dataset, the project uses a **transparent synthetic-data generation approach**.

The framework is organized around the three standard ESG dimensions:

* **Environmental (E)**
* **Social (S)**
* **Governance (G)**

A synthetic dataset was generated using documented scoring rules and controlled randomness.

### Dataset

The dataset contains **8,000 synthetic professional profiles** covering:

* Multiple education levels
* Multiple industries
* Different experience levels
* ESG certifications
* Environmental exposure
* Social exposure
* Governance exposure
* ESG readiness labels

The dataset was designed to contain realistic distributions rather than perfectly balanced artificial profiles.

For example:

* Bachelor's degrees are more common than PhDs
* Most professionals do not already hold ESG certifications
* ESG exposure varies across industries and experience levels

---

## Exploratory Data Analysis

EDA was used to understand the generated dataset and identify characteristics that could affect model training.

### Class Imbalance

The **Low readiness** category represents approximately 15% of the dataset.

Class-aware modelling considerations were therefore incorporated to reduce potential bias toward majority classes.

### Multi-dimensional Scoring

The engineered Environmental, Social, and Governance scores provide stronger separation between readiness categories than individual raw inputs.

This supports an important design principle:

> **ESG career readiness is multidimensional and should not be reduced to a single raw feature.**

### Controlled Label Noise

Approximately **5% label noise** was deliberately introduced.

Without noise, the model could potentially learn the underlying scoring formula almost perfectly, effectively reducing the ML problem to formula inversion.

Controlled noise makes the classification task more representative of imperfect real-world data.

---

## Machine Learning Pipeline

SkillGreen evaluates multiple classification algorithms rather than selecting a model arbitrarily.

### Models Evaluated

| Model               | Purpose                       |
| ------------------- | ----------------------------- |
| Logistic Regression | Linear baseline               |
| Decision Tree       | Interpretable nonlinear model |
| Random Forest       | Ensemble baseline             |
| Gradient Boosting   | Strong nonlinear ensemble     |

Models were evaluated using **5-fold cross-validation** with **F1-macro** as the primary evaluation metric.

F1-macro was selected because it provides a more informative evaluation when class distributions are imbalanced.

### Model Selection

**Gradient Boosting** achieved the strongest overall performance and was selected for the final prediction pipeline.

### Final Performance

| Metric           |                Result |
| ---------------- | --------------------: |
| Test Accuracy    |            **94.75%** |
| Test F1-Macro    |             **0.935** |
| Cross-Validation |            **5-fold** |
| Training Dataset |             Synthetic |
| Selected Model   | **Gradient Boosting** |

> **Important:** These metrics measure performance against synthetic labels generated using the project's scoring framework. They should not be interpreted as real-world hiring prediction accuracy.

---

## Feature Engineering

A core component of SkillGreen is its ESG pillar scoring system.

Instead of passing only raw professional attributes to the model, the application derives structured ESG features from validated user information.

```text
Professional Inputs
        │
        ├── Industry
        ├── Education
        ├── Experience
        ├── Certifications
        └── ESG Exposure
                │
                ▼
     ┌──────────────────────┐
     │ ESG Feature          │
     │ Engineering          │
     └──────────┬───────────┘
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
          ML Prediction
```

The feature-engineering logic is implemented using **Pydantic `computed_field`**, allowing ESG pillar scores to be calculated directly from validated user inputs.

---

## System Architecture

SkillGreen follows a full-stack machine learning architecture.

```text
┌─────────────────────┐
│   React Frontend    │
│      + Vite         │
└──────────┬──────────┘
           │ HTTP
           ▼
┌─────────────────────┐
│   FastAPI Backend   │
│       + CORS        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Pydantic Validation │
│ + Feature Engineering│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Trained ML Pipeline │
│  Gradient Boosting  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Prediction Response │
│   E / S / G Scores  │
│    + Confidence     │
└─────────────────────┘
```

---

## Technology Stack

### Backend & Data Science

* **Python**
* **FastAPI**
* **Pydantic**
* **scikit-learn**
* **pandas**
* **NumPy**
* **pytest**

### Frontend

* **React**
* **Vite**
* **lucide-react**
* **CSS**

### Machine Learning

* Synthetic data generation
* Data preprocessing
* Exploratory data analysis
* Feature engineering
* Classification
* Cross-validation
* Gradient Boosting
* Model evaluation

---

## Project Structure

```text
SkillGreen/
│
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
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── index.css
```

---

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd SkillGreen
```

### 2. Create a Virtual Environment

#### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

#### Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Running the Backend

Start the FastAPI server:

```bash
uvicorn app:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Running the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will provide the frontend development URL in the terminal.

The React frontend communicates with the FastAPI backend through HTTP requests.

---

## Testing

SkillGreen includes automated backend tests using `pytest`.

Run:

```bash
pytest
```

The current test suite contains **11 automated tests** covering:

* Valid API requests
* Invalid input handling
* Input validation
* Prediction responses
* API behaviour
* Model integration

**Current status: 11/11 tests passing.**

---

## End-to-End Workflow

A typical prediction request follows this pipeline:

### 1. User Profile

The user provides:

```text
Industry
Education
Years of Experience
ESG Certification
Environmental Exposure
Social Exposure
Governance Exposure
```

### 2. Input Validation

Pydantic validates the request and rejects invalid or out-of-range values.

### 3. ESG Feature Calculation

Environmental, Social, and Governance scores are calculated from the validated profile.

### 4. ML Inference

The processed features are passed to the trained Gradient Boosting pipeline.

### 5. Readiness Classification

The model predicts one of three readiness categories:

```text
Low
Medium
High
```

### 6. Explainable Output

The frontend presents:

```text
ESG Readiness
      │
      ├── Environmental
      ├── Social
      ├── Governance
      └── Confidence
```

This provides more context than returning a classification label alone.

---

## Example Response

A conceptual API response may look like:

```json
{
  "readiness_category": "High",
  "confidence": 0.94,
  "environmental_score": 82,
  "social_score": 76,
  "governance_score": 88
}
```

The response schema is defined in:

```text
schema/response_model.py
```

---

## Prototype Validation

The complete application was validated across multiple layers.

### Data

* Synthetic dataset successfully generated
* 8,000 professional profiles produced
* Data distributions inspected

### Machine Learning

* Four classification models compared
* 5-fold cross-validation performed
* Gradient Boosting selected
* 94.75% held-out test accuracy
* 0.935 F1-macro

### Backend

* FastAPI application tested
* Pydantic validation tested
* Invalid inputs rejected
* ML model integration tested

### Frontend

* React + Vite interface implemented
* Backend communication verified
* CORS configured
* End-to-end prediction flow tested

---

## Target Users

### Professionals

SkillGreen can help professionals understand:

* Their current ESG readiness
* Their strongest ESG pillar
* Their weakest ESG pillar
* Potential areas for upskilling
* How existing experience may transfer toward ESG-oriented roles

### Recruiters and Hiring Teams

Potential applications include:

* First-pass candidate screening
* Structured candidate comparison
* Identifying ESG-relevant transferable experience
* Reducing dependence on simple resume keyword matching

> SkillGreen is intended as a **decision-support tool**, not an automated hiring decision-maker.

---

## Potential Impact

SkillGreen explores how applied AI can support the transition toward a more sustainability-oriented workforce.

Instead of asking only:

> **"Does this resume contain ESG keywords?"**

SkillGreen asks:

> **"How does this professional's existing experience translate across the Environmental, Social, and Governance dimensions?"**

This shift from keyword matching toward structured capability assessment could become increasingly valuable as ESG responsibilities expand across traditionally non-ESG industries.

---

## Limitations

The most important limitation of the current system is its training data.

The model was trained using **synthetically generated professional profiles and labels based on a transparent scoring framework**.

Therefore:

* The model does not currently learn from actual hiring outcomes.
* 94.75% test accuracy does not represent 94.75% real-world hiring accuracy.
* The current prediction represents alignment with the project's defined ESG readiness framework.
* Synthetic data cannot fully capture the complexity of real professional careers.
* The system should not be used as the sole basis for recruitment or employment decisions.

This limitation is explicitly documented as part of the project's responsible ML approach.

---

## Future Roadmap

The next objective is to transition SkillGreen from a proof-of-concept toward real-world validation.

### Phase 1 — Real-World Data

Replace synthetic labels with data such as:

* ESG job descriptions
* ESG skill requirements
* Professional career profiles
* Relevant certifications
* Career transition outcomes
* Expert-labelled readiness assessments

### Phase 2 — Explainability

Introduce:

* Feature importance
* SHAP explanations
* Personalized skill-gap recommendations
* Recommended certifications
* ESG career pathways

### Phase 3 — ESG Job Matching

Extend the system from:

```text
Profile
   ↓
ESG Readiness
```

to:

```text
Profile
   ↓
ESG Readiness
   ↓
Skill Gap Analysis
   ↓
Recommended Skills
   ↓
Relevant ESG Roles
```

### Phase 4 — Continuous Learning

Eventually, the system could incorporate validated career outcomes to reduce dependence on synthetic scoring rules and improve real-world relevance.

---

## Learning Journey

SkillGreen was developed as a practical application of concepts across **data science, machine learning, backend engineering, frontend development, and software engineering**.

### Data Science

* Synthetic data generation
* Data preprocessing
* Exploratory data analysis
* Feature engineering
* Class imbalance

### Machine Learning

* Classification
* Logistic Regression
* Decision Trees
* Random Forest
* Gradient Boosting
* Cross-validation
* F1-macro evaluation
* Model selection

### Backend Engineering

* FastAPI
* REST APIs
* Pydantic
* Request validation
* CORS
* ML model serving

### Frontend Engineering

* React
* Vite
* API integration
* Responsive UI
* Data visualization
* Component-based design

### Software Engineering

* Modular project structure
* Automated testing
* Configuration management
* Environment management
* Git/GitHub workflow

---

## Key Takeaway

SkillGreen demonstrates the complete development lifecycle of an applied machine learning system:

```text
Problem Definition
       ↓
Research
       ↓
Synthetic Data Generation
       ↓
Exploratory Data Analysis
       ↓
Feature Engineering
       ↓
Model Comparison
       ↓
Model Training
       ↓
API Development
       ↓
React Frontend
       ↓
Automated Testing
       ↓
End-to-End ML Application
```

The current prototype demonstrates that the technical pipeline is functional.

The next major challenge is **validating the ESG readiness signal against real-world career outcomes**.

> **The objective is not simply to build a model that performs well on synthetic data. The objective is to develop a readiness signal that is meaningful and useful in real-world ESG career contexts.**

---

## Project Status

| Component       | Status                       |
| --------------- | ---------------------------- |
| Project         | **Working Prototype**        |
| Dataset         | **8,000 synthetic profiles** |
| Best Model      | **Gradient Boosting**        |
| Test Accuracy   | **94.75%**                   |
| Test F1-Macro   | **0.935**                    |
| Automated Tests | **11 / 11 passing**          |
| Backend         | **FastAPI**                  |
| Frontend        | **React + Vite**             |
| Current Focus   | **Real-world validation**    |

---

## License

This project is currently intended to use the **MIT License**.

```text
MIT License
```

---

## Contributing

Contributions, ideas, and improvements are welcome.

If you find the project useful, consider starring the repository and sharing feedback.
