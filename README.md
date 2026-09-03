# 🌱 SkillGreen — Measuring ESG Career Readiness with Applied AI

> **An AI-powered ESG career readiness assessment that transforms professional experience into an actionable Environmental, Social, and Governance (ESG) readiness profile.**

SkillGreen is an end-to-end machine learning application that evaluates how prepared a professional is for ESG and sustainability-oriented career opportunities.

Instead of relying only on resume keywords, SkillGreen analyzes structured professional information such as **industry, education, experience, certifications, and ESG exposure** to generate:

* 🎯 **ESG Readiness Category** — Low / Medium / High
* 📊 **Confidence Score**
* 🌱 **Environmental Score**
* 👥 **Social Score**
* 🏛️ **Governance Score**
* 💡 **Actionable areas for improvement**

The project combines **synthetic data generation, feature engineering, model comparison, FastAPI, Pydantic, and React** into one complete ML pipeline.

---

## 📌 Problem Statement

As industries increasingly adopt sustainability and ESG practices, organizations need professionals who can work effectively in ESG-relevant roles.

However, there is currently no simple and structured way for an individual to understand:

* How transferable their existing experience is to ESG-oriented roles
* Which ESG pillar they are strongest in
* Which pillar represents their biggest skill gap
* How prepared they are for an ESG career transition

Recruiters face a related problem. Traditional resume screening often relies heavily on **keyword matching**, which can miss candidates whose relevant ESG capabilities come from adjacent experience.

### Real-world example

> A professional with **8 years of manufacturing experience** may have valuable ESG-relevant knowledge, but a conventional resume keyword search may not identify that potential.

SkillGreen explores the idea of an ESG equivalent of a **readiness score** — a lightweight, structured signal that helps quantify career alignment with ESG requirements.

---

# 💡 Solution

SkillGreen converts a professional's background into three ESG pillar scores:

```text
                 Professional Profile
                         │
                         ▼
              ┌─────────────────────┐
              │   Input Validation  │
              │      Pydantic       │
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
              │ Gradient Boosting   │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ ESG Readiness       │
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

# 🔬 Research & Insights

A major challenge was the absence of a suitable public dataset containing **individual-level ESG career readiness outcomes**.

Rather than forcing an unrelated dataset into the problem, SkillGreen uses a **transparent synthetic-data approach**.

The scoring framework is based on the standard:

* **E — Environmental**
* **S — Social**
* **G — Governance**

framework.

A synthetic dataset was then generated using documented scoring rules and controlled randomness.

### Dataset

* **8,000 synthetic professional profiles**
* Multiple education levels
* Multiple industries
* Different experience levels
* ESG certifications
* Environmental exposure
* Social exposure
* Governance exposure
* ESG readiness labels

The dataset intentionally contains realistic distributions rather than perfectly balanced artificial profiles.

For example:

* Bachelor's degrees are more common than PhDs
* Most professionals do not already hold ESG certifications
* ESG exposure varies across industries and experience levels

---

# 📊 Exploratory Data Analysis

The exploratory analysis identified several important characteristics.

### 1. Class imbalance

The **Low readiness** class represented approximately 15% of the dataset.

Instead of simply ignoring the imbalance, the training process used **class-aware modelling considerations** to reduce bias toward the majority classes.

### 2. Multi-dimensional scoring

The engineered Environmental, Social, and Governance scores separated readiness categories significantly better than individual raw inputs.

This supports an important design principle:

> **ESG career readiness is multidimensional and should not be reduced to a single raw feature.**

### 3. Label noise

Approximately **5% label noise** was deliberately introduced.

Without noise, the model could potentially learn the underlying scoring formula almost perfectly, turning the ML task into little more than formula inversion.

Adding controlled noise makes the classification problem more representative of imperfect real-world data.

---

# 🤖 Machine Learning Pipeline

The project compares multiple classification algorithms instead of selecting a model arbitrarily.

### Models evaluated

| Model               | Purpose                       |
| ------------------- | ----------------------------- |
| Logistic Regression | Linear baseline               |
| Decision Tree       | Interpretable nonlinear model |
| Random Forest       | Ensemble baseline             |
| Gradient Boosting   | Strong nonlinear ensemble     |

The models were evaluated using **5-fold cross-validation** with **F1-macro**, which provides a more informative metric when class distribution is imbalanced.

### Selected Model

**Gradient Boosting** achieved the best overall performance and was selected for the final pipeline.

### Final performance

| Metric           |            Result |
| ---------------- | ----------------: |
| Test Accuracy    |        **94.75%** |
| Test F1-Macro    |         **0.935** |
| Cross-validation |        **5-fold** |
| Training samples | Synthetic dataset |
| Model            | Gradient Boosting |

> ⚠️ **Important:** These results measure performance against synthetic labels generated from the project's scoring framework. They should not be interpreted as real-world hiring prediction accuracy.

---

# 🧠 Feature Engineering

One of the central parts of SkillGreen is its ESG pillar scoring.

Instead of sending only raw profile information into the model, the application computes structured ESG features.

Conceptually:

```text
Professional Inputs
       │
       ├── Industry
       ├── Education
       ├── Experience
       ├── Certifications
       ├── ESG Exposure
       │
       ▼
┌─────────────────────────┐
│ ESG Feature Engineering │
└────────────┬────────────┘
             │
       ┌─────┼─────┐
       ▼     ▼     ▼
       E     S     G
       │     │     │
       └─────┼─────┘
             ▼
       Readiness Score
             │
             ▼
        ML Prediction
```

The feature engineering logic is implemented using **Pydantic `computed_field`**, allowing the application to calculate the pillar scores directly from validated user input.

---

# 🏗️ System Architecture

SkillGreen follows a simple full-stack ML architecture:

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
│ + Feature Engineer. │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Trained ML Pipeline │
│ Gradient Boosting   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Prediction Response │
│ E / S / G + Score   │
└─────────────────────┘
```

---

# 🛠️ Technology Stack

## Backend & ML

* **Python**
* **FastAPI**
* **Pydantic**
* **scikit-learn**
* **pandas**
* **NumPy**
* **pytest**

## Frontend

* **React**
* **Vite**
* **lucide-react**
* CSS

## Machine Learning

* Synthetic data generation
* Feature engineering
* Classification
* Cross-validation
* Gradient Boosting
* Model evaluation

---

# 📁 Project Structure

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

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd SkillGreen
```

## 2. Create a virtual environment

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

---

# 🚀 Running the Backend

Start the FastAPI server:

```bash
uvicorn app:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation can be accessed at:

```text
http://127.0.0.1:8000/docs
```

---

# 💻 Running the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will provide the local development URL in the terminal.

The frontend communicates with the FastAPI backend through HTTP requests.

---

# 🧪 Testing

SkillGreen includes automated backend tests using `pytest`.

Run:

```bash
pytest
```

Current test coverage includes **11 automated tests**, covering areas such as:

* Valid API requests
* Invalid input handling
* Input validation
* Prediction responses
* API behaviour
* Model integration

All tests are currently passing.

---

# 🔄 End-to-End Workflow

A typical prediction follows this sequence:

### Step 1 — User enters profile

The user provides information such as:

```text
Industry
Education
Years of Experience
ESG Certification
Environmental Exposure
Social Exposure
Governance Exposure
```

### Step 2 — Pydantic validation

The backend validates the request and rejects invalid or out-of-range values.

### Step 3 — ESG feature calculation

Environmental, Social, and Governance scores are computed.

### Step 4 — ML inference

The trained Gradient Boosting pipeline receives the processed features.

### Step 5 — Prediction

The model returns a readiness category:

```text
Low
Medium
High
```

### Step 6 — Explainable output

The frontend presents the user's:

```text
ESG Readiness
       │
       ├── Environmental
       ├── Social
       ├── Governance
       └── Confidence
```

This makes the result more useful than simply returning a class label.

---

# 📈 Example Output

A prediction can conceptually look like:

```json
{
  "readiness_category": "High",
  "confidence": 0.94,
  "environmental_score": 82,
  "social_score": 76,
  "governance_score": 88
}
```

The actual response structure is defined in:

```text
schema/response_model.py
```

---

# 🧪 Prototype Validation

The complete system was tested across multiple layers.

### Data

✅ Synthetic dataset successfully generated
✅ 8,000 profiles produced
✅ Data distributions inspected

### Machine Learning

✅ Four classification models compared
✅ 5-fold cross-validation performed
✅ Gradient Boosting selected
✅ 94.75% held-out test accuracy
✅ 0.935 F1-macro

### Backend

✅ FastAPI application tested
✅ Pydantic validation tested
✅ Invalid inputs rejected
✅ Model integration tested

### Frontend

✅ React + Vite interface implemented
✅ Backend communication verified
✅ CORS configured
✅ End-to-end prediction flow tested

---

# 🎯 Target Users

## 👨‍💻 Professionals

SkillGreen can help professionals understand:

* Their current ESG readiness
* Their strongest ESG pillar
* Their weakest pillar
* Potential areas for upskilling
* Whether their existing experience may transfer toward ESG-oriented roles

## 🏢 Recruiters & Hiring Teams

Potential applications include:

* First-pass candidate screening
* Structured candidate comparison
* Identifying ESG-relevant transferable experience
* Reducing dependence on simple resume keyword matching

> SkillGreen is intended as a **decision-support tool**, not an automated hiring decision-maker.

---

# 🌍 Potential Impact

SkillGreen explores how applied AI can support the transition toward a more sustainability-oriented workforce.

Instead of asking only:

> **"Does this resume contain ESG keywords?"**

SkillGreen asks:

> **"How does this professional's existing experience translate across the Environmental, Social, and Governance dimensions?"**

This shift from keyword matching to structured capability assessment could become increasingly valuable as ESG responsibilities spread across traditionally non-ESG industries.

---

# ⚠️ Limitations & Honest Scope

The most important limitation is the training data.

The model was trained using **synthetically generated profiles and labels based on a transparent scoring formula**.

Therefore:

* The model does **not** currently learn from actual hiring outcomes.
* A 94.75% test accuracy does **not** mean 94.75% real-world hiring accuracy.
* The current score represents alignment with the project's defined ESG readiness framework.
* Synthetic data may not capture the complexity of real professional careers.
* The system should not be used as the sole basis for recruitment or employment decisions.

This limitation is intentionally documented rather than hidden.

---

# 🔮 Future Roadmap

The next stage of SkillGreen is to move from a proof-of-concept toward real-world validation.

### Phase 1 — Real-world data

Replace synthetic labels with real data such as:

* ESG job descriptions
* ESG skill requirements
* Professional career profiles
* Relevant certifications
* Career transition outcomes
* Expert-labelled readiness assessments

### Phase 2 — Better explainability

Add:

* Feature importance
* SHAP explanations
* Personalized skill-gap recommendations
* Recommended certifications
* ESG career pathways

### Phase 3 — Job matching

Extend SkillGreen from:

```text
Profile → ESG Readiness
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

### Phase 4 — Continuous learning

Eventually, the system could learn from validated career outcomes rather than relying primarily on synthetic scoring rules.

---

# 📚 Learning Journey

SkillGreen was built as a practical application of concepts across **data science, machine learning, backend engineering, and frontend development**.

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

# 🧩 Key Takeaway

SkillGreen is more than a classification model.

It demonstrates the complete journey:

```text
Problem
  ↓
Research
  ↓
Synthetic Data
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
React Frontend
  ↓
Automated Testing
  ↓
End-to-End ML Application
```

The current prototype proves that the technical pipeline works.

The next major challenge is **validation against real-world ESG career outcomes**.

> **The goal is not to build a model that scores synthetic data well.
> The goal is to eventually build a system whose ESG readiness signal is meaningful in the real world.**

---

## 👨‍💻 Project Status

**Status:** ✅ Working Prototype

**Dataset:** 8,000 synthetic profiles

**Best Model:** Gradient Boosting

**Test Accuracy:** 94.75%

**Test F1-Macro:** 0.935

**Automated Tests:** 11 / 11 passing

**Backend:** FastAPI

**Frontend:** React + Vite

**Current Focus:** Moving from synthetic proof-of-concept toward real-world validation.

---

## 📄 License

Add your preferred license here, for example:

```text
MIT License
```

---

## ⭐ If you find the project useful

Consider starring the repository and sharing feedback. Contributions, ideas, and improvements are welcome.
