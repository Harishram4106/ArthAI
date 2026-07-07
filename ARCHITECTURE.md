# Arth AI Architecture

Arth AI is built as a monorepo containing a full-stack Node.js + React application.

## 1. System Components

### `apps/web` (Frontend)
- **Framework:** React + Vite
- **State Management:** Zustand
- **Styling:** Tailwind CSS (customized with IDBI brand colors)
- **Routing:** React Router (Mobile-first, bottom-tab navigation paradigm)
- **API Client:** Axios instance (`apiClient`) intercepting requests to inject JWT auth tokens.

### `apps/api` (Backend)
- **Framework:** Express.js
- **Database ORM:** Prisma
- **Database:** SQLite (local file-based db for demo purposes `dev.db`)
- **Modules:** Organized by domain (`auth`, `transactions`, `goals`, `advisory`, `simulator`, `reports`).

### `packages/shared-types`
- Centralized TypeScript interfaces used by both the frontend and backend to guarantee type safety across the network boundary.

## 2. Core Flows

### A. Authentication & Risk Profiling
1. User logs in via a demo JWT endpoint.
2. The UI enforces language selection, followed by a 5-question risk assessment.
3. The backend calculates a risk score (10-50) and categorizes the user as **Conservative**, **Moderate**, or **Aggressive**.
4. The backend persists the `RiskAssessment` object and emits a "Risk Profile Computed" entry into the `AuditLog`.

### B. Transaction Processing & Health Scoring
1. Synthetic transactions are seeded for the user.
2. The `TransactionsService` groups transactions into Income vs. Expenses and classifies discretionary vs. non-discretionary spending.
3. A rule-based engine assigns a **Financial Health Score (0-100)** and a detailed sub-score breakdown (Savings Rate, Emergency Fund, Expense Stability).
4. Liquid assets are deterministically modeled as a base proxy + net cash flow, rather than hardcoded magic numbers.

### C. Goal Planning & Simulation
1. Users define financial goals (Target Amount, Target Year).
2. The `GoalsService` fetches the user's latest risk profile and looks up the unified **Planning Assumptions** (e.g., 12% CAGR for Moderate).
3. The Future Value (FV) gap and required monthly SIP are calculated deterministically.
4. The Simulator allows users to adjust variables without mutating the underlying database state.

### D. AI Advisory & Consent
1. The **Arth AI Chat** interface maps natural language intents to strict backend facts.
2. The backend returns deterministic strings and UI templates rather than relying on an external LLM API (to comply with zero-cost constraints).
3. Users can accept a portfolio recommendation. When accepted, a digital signature (hash) and a "Consent Captured" audit event are recorded.

## 3. Database Schema (Prisma)

- **UserProfile**: Basic user demographic data.
- **RiskAssessment**: Risk scores and final profile mapping.
- **Goal**: Financial targets and current progress.
- **Transaction**: Granular ledger of historical cash flows.
- **Product**: The mutual fund catalog available for recommendation.
- **PortfolioRecommendation**: The proposed basket of products, amounts, and rationale.
- **AuditLog**: Immutable, hashed ledger of critical compliance events.
