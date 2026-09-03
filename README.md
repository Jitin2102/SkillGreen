# SkillGreen

### ESG Career Readiness Assessment Platform

> An end-to-end machine learning application for assessing professional ESG career readiness across Environmental, Social, and Governance dimensions.

SkillGreen evaluates structured professional profiles and generates an ESG readiness assessment using machine learning, feature engineering, and an API-driven full-stack architecture.

---

## Overview

SkillGreen is an end-to-end machine learning application designed to assess how prepared a professional may be for ESG and sustainability-oriented career opportunities.

Instead of relying exclusively on resume keyword matching, the system analyzes structured professional attributes including:

* Industry
* Education
* Professional experience
* ESG certifications
* Environmental exposure
* Social exposure
* Governance exposure

These attributes are transformed into an ESG profile containing:

| Output              | Description                             |
| ------------------- | --------------------------------------- |
| ESG Readiness       | Low / Medium / High                     |
| Confidence          | Model confidence for the prediction     |
| Environmental Score | Environmental capability indicator      |
| Social Score        | Social capability indicator             |
| Governance Score    | Governance capability indicator         |
| Improvement Areas   | Potential areas for further development |

The project combines **synthetic data generation, exploratory data analysis, feature engineering, supervised machine learning, FastAPI, Pydantic, React, and automated testing** into a complete ML application.

---

## Problem Statement

The growing adoption of ESG practices is creating demand for professionals with sustainability-related capabilities.

However, professionals often lack a structured way to determine:

* How their existing experience translates to ESG-oriented roles
* Which ESG dimension represents their strongest capability
* Where their primary ESG skill gaps exist
* How prepared they are for an ESG career transition

Recruiters face a related challenge. Traditional resume screening frequently relies on keyword matching, which can overlook relevant ESG capabilities developed through adjacent industries and professional responsibilities.

For example, a manufacturing professional may have experience in environmental compliance, operational processes, workplace safety, or governance without explicitly using ESG terminology in their resume.

SkillGreen explores a structured approach to identifying and quantifying these transferable capabilities.

---

## Proposed Approach

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

A suitable public dataset containing individual-level ESG career-readiness outcomes was not available for this project.

Therefore, SkillGreen uses a **transparent synthetic-data generation methodology** based on documented scoring rules and controlled randomness.

The dataset represents professional profiles across:

* **Environmental**
* **Social**
* **Governance**

### Dataset Characteristics

* **8,000 synthetic professional profiles**
* Multiple education levels
* Multiple industries
* Different experience levels
* ESG certifications
* Environmental exposure
* Social exposure
* Governance exposure
* ESG readiness labels

The generated data intentionally incorporates non-uniform distributions to represent heterogeneous professional profiles.

Examples include:

* Bachelor's degrees being more common than PhDs
* ESG certifications being relatively uncommon
* ESG exposure varying across industries and experience levels

---

## Exploratory Data Analysis

EDA was performed to understand the generated dataset and identify characteristics relevant to model development.

### Class Distribution

The **Low readiness** category represents approximately 15% of the dataset.

Class-aware modelling considerations were therefore used to reduce potential bias toward majority classes.

### ESG Dimensions

The engineered Environmental, Social, and Governance scores provide stronger separation between readiness categories than individual raw attributes.

This supports the underlying design assumption:

> **ESG career readiness is a multidimensional capability rather than a single raw attribute.**

### Controlled Label Noise

Approximately **5% controlled label noise** was introduced during dataset generation.

Without noise, the model could potentially learn the deterministic scoring mechanism rather than solving a meaningful classification problem.

---

## Machine Learning Methodology

SkillGreen evaluates multiple classification algorithms rather than selecting a model arbitrarily.

### Models Evaluated

| Model               | Role                             |
| ------------------- | -------------------------------- |
| Logistic Regression | Linear baseline                  |
| Decision Tree       | Interpretable nonlinear baseline |
| Random Forest       | Ensemble baseline                |
| Gradient Boosting   | Nonlinear ensemble model         |

The models were evaluated using **5-fold cross-validation** with **F1-macro** as the primary comparison metric.

F1-macro was selected because it provides balanced evaluation across classes in the presence of class imbalance.

---

## Model Selection & Results

Gradient Boosting achieved the strongest overall performance and was selected for the final prediction pipeline.

### Evaluation Results

| Metric           |                Result |
| ---------------- | --------------------: |
| Test Accuracy    |            **94.75%** |
| Test F1-Macro    |             **0.935** |
| Cross-Validation |            **5-fold** |
| Selected Model   | **Gradient Boosting** |
| Dataset          |         **Synthetic** |

> **Important:** These metrics measure performance against synthetically generated labels based on the project's scoring framework. They should not be interpreted as real-world hiring prediction accuracy.

---

## Feature Engineering

Feature engineering is a central component of SkillGreen.

Rather than passing only raw professional attributes to the model, the application derives structured ESG features representing the three ESG dimensions.

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

The feature-engineering logic uses Pydantic `computed_field` to calculate the pillar-level scores from validated user inputs.

---

## System Architecture

SkillGreen follows a modular full-stack machine learning architecture.

```text
┌─────────────────────────┐
│      React Frontend     │
│          Vite           │
└────────────┬────────────┘
             │ HTTP
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

---

## Technology Stack

### Backend

* Python
* FastAPI
* Pydantic
* pytest

### Data Science & Machine Learning

* NumPy
* pandas
* scikit-learn
* Synthetic data generation
* Exploratory data analysis
* Feature engineering
* Classification
* Cross-validation
* Model evaluation

### Frontend

* React
* Vite
* lucide-react
* CSS

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

### Clone the Repository

```bash
git clone <your-repository-url>
cd SkillGreen
```

### Create a Virtual Environment

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

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Running the Application

### Start the Backend

```bash
uvicorn app:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### Start the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will provide the frontend URL.

The frontend communicates with the FastAPI backend through HTTP requests.

---

## Testing

SkillGreen includes automated backend testing using `pytest`.

Run:

```bash
pytest
```

The current test suite contains **11 automated tests** covering:

* Valid API requests
* Invalid input handling
* Pydantic validation
* Prediction responses
* API behaviour
* ML model integration

**Current status: 11 / 11 tests passing.**

---

## End-to-End Workflow

A prediction request follows this sequence:

### Profile Input

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

### Input Validation

Pydantic validates the request and rejects invalid or out-of-range values.

### Feature Engineering

Environmental, Social, and Governance features are calculated.

### Model Inference

The processed features are passed to the trained Gradient Boosting model.

### Classification

The model returns one of three readiness categories:

```text
Low
Medium
High
```

### Response

The frontend presents the resulting ESG readiness profile:

```text
ESG Readiness
├── Environmental Score
├── Social Score
├── Governance Score
└── Confidence
```

---

## Example API Response

```json
{
  "readiness_category": "High",
  "confidence": 0.94,
  "environmental_score": 82,
  "social_score": 76,
  "governance_score": 88
}
```

The response model is defined in:

```text
schema/response_model.py
```

---

## Validation

The prototype has been validated across the major application layers.

| Layer       | Validation                             |
| ----------- | -------------------------------------- |
| Data        | 8,000 profiles generated and inspected |
| ML          | 4 classification models compared       |
| Evaluation  | 5-fold cross-validation                |
| Model       | Gradient Boosting selected             |
| Backend     | FastAPI and Pydantic tested            |
| Integration | ML model integrated with API           |
| Frontend    | React + Vite interface implemented     |
| API         | Backend communication verified         |
| Testing     | 11 / 11 automated tests passing        |

---

## Intended Use Cases

### Professionals

SkillGreen can provide structured insight into:

* Current ESG readiness
* Strongest ESG dimension
* Potential skill gaps
* Upskilling opportunities
* Transferability of existing professional experience

### Recruiters and Hiring Teams

Potential applications include:

* Initial candidate screening
* Structured candidate comparison
* Identifying transferable ESG capabilities
* Reducing dependence on simple keyword matching

> SkillGreen is intended as a **decision-support system**, not an automated employment decision-maker.

---

## Limitations

The current system has an important methodological limitation: **the training data is synthetic**.

The model does not currently learn from actual hiring outcomes or professionally validated ESG assessments.

Consequently:

* The 94.75% accuracy should not be interpreted as real-world hiring accuracy.
* The labels reflect the project's defined ESG scoring framework.
* Synthetic data cannot fully represent the complexity of real professional careers.
* The current system has not been validated against real career-transition outcomes.
* Predictions should not be used as the sole basis for recruitment or employment decisions.

These limitations are explicitly documented to maintain transparency around the current scope of the system.

---

## Future Development

The primary objective is to transition SkillGreen from a synthetic proof-of-concept toward real-world validation.

### Real-World Data

Potential data sources include:

* ESG job descriptions
* ESG skill requirements
* Professional career profiles
* Relevant certifications
* Career-transition outcomes
* Expert-labelled assessments

### Explainability

Planned improvements include:

* Feature importance
* SHAP-based explanations
* Personalized skill-gap recommendations
* Recommended certifications
* ESG career pathways

### ESG Job Matching

The system can evolve from:

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

### Outcome-Based Learning

A future version could incorporate validated career outcomes to progressively reduce dependence on synthetic scoring rules and improve real-world relevance.

---

## Learning Journey

SkillGreen provided practical experience across data science, machine learning, backend engineering, frontend development, and software engineering.

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
* REST API development
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
* Component-based development

### Software Engineering

* Modular architecture
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
Data Strategy
        ↓
Data Generation
        ↓
EDA
        ↓
Feature Engineering
        ↓
Model Comparison
        ↓
Model Training
        ↓
API Development
        ↓
Frontend Integration
        ↓
Automated Testing
        ↓
End-to-End ML Application
```

The current prototype demonstrates a functional technical pipeline for structured ESG career-readiness assessment.

The next major step is **validation against real-world ESG career requirements and outcomes**.

> **The objective is to develop an ESG readiness signal that is not only technically measurable, but also meaningful in real-world career contexts.**

---

## Project Status

| Attribute       | Current Status               |
| --------------- | ---------------------------- |
| Project Status  | **Working Prototype**        |
| Dataset         | **8,000 synthetic profiles** |
| Selected Model  | **Gradient Boosting**        |
| Test Accuracy   | **94.75%**                   |
| Test F1-Macro   | **0.935**                    |
| Automated Tests | **11 / 11 passing**          |
| Backend         | **FastAPI**                  |
| Frontend        | **React + Vite**             |
| Current Focus   | **Real-world validation**    |

---

## License

MIT License

---

## Contributing

Contributions, suggestions, and improvements are welcome.

If you find SkillGreen useful, consider starring the repository and sharing feedback.
