# Arth AI Demo Script

This script provides a recommended 5-minute walkthrough of the Arth AI platform, highlighting its primary value propositions: Seamless Onboarding, Deterministic Financial Modeling, AI Advisory, and Compliance.

## 1. Onboarding & Profiling (0:00 - 1:00)

1. **Login:** Click "Demo Login". Explain that this bypasses standard OTP for demo purposes but secures the session with a real JWT in the backend.
2. **Language Selection:** Briefly show the Multilingual capability (English, Hindi, Tamil) as a tool for financial inclusion. Select English.
3. **Risk Profiling:** 
   - Walk through the 5-question psychometric assessment.
   - Answer moderately to achieve a "Moderate" risk profile.
   - Explain that this profile dictates the entire downstream logic (planning assumptions, product suitability).

## 2. Home Dashboard & Health (1:00 - 2:00)

1. **Dashboard:** Land on the Home Dashboard. Point out the Investable Surplus and Financial Health Score.
2. **Explainability:** Click to expand the Health Score breakdown.
   - Explain that this isn't arbitrary. It is derived dynamically from the mock transactions in the database.
   - Show the metrics: Savings Rate, Emergency Fund, Expense Stability, and Goal Readiness.

## 3. Goals & Simulator (2:00 - 3:00)

1. **Goals Tab:** Navigate to the Plan/Goals section.
2. **Dynamic Gaps:** Point out an existing goal (e.g., Retirement). Show the required SIP.
   - *Talking Point:* Explain that the required SIP is calculated using a "Planning Assumption" (e.g., 12% CAGR) pulled explicitly from the user's Risk Profile. It's not a generic flat rate.
3. **Simulator:** Open the Simulator.
   - Adjust the monthly SIP slider. Show how the projected future value changes dynamically.
   - Highlight the UI disclosure that explicitly labels CAGR as an assumption, satisfying regulatory transparency.

## 4. Arth AI Advisory Chat (3:00 - 4:00)

1. **Chat Tab:** Navigate to the Arth AI chat interface.
2. **Deterministic Responses:** 
   - Type `"What is my financial health score?"`. See the system parse the backend health breakdown and deliver a contextualized assessment.
   - Type `"Should I invest my surplus?"`. See the system recommend a specific asset class allocation based on the user's Moderate risk profile.
   - *Talking Point:* Emphasize that the AI is deterministic. It does not use costly LLMs prone to hallucination. It acts as an NLP layer on top of strict backend rules.

## 5. Report Generation & Audit (4:00 - 5:00)

1. **Profile Tab:** Navigate to the Activity/Profile tab.
2. **Audit Trail:** Show the read-only, immutable audit ledger. Point out the cryptographic hash tracking major life-cycle events (Risk Profiling, Advisory generation).
3. **Download Report:** Click "Download Advisory Report".
   - Open the Markdown report.
   - Show how the report combines the snapshot, health metrics, active goals, recommended portfolio basket, and standard financial disclosures into a single, compliant, exportable artifact.
