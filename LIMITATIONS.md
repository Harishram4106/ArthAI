# Limitations & Assumptions

Arth AI is designed as a **production-grade MVP** that demonstrates the architecture, UX, and compliance requirements of an AI-driven wealth advisory platform. However, because it was built within constraints (e.g., no external paid APIs, synthetic mock data), certain limitations and assumptions are baked into the current implementation.

## 1. Zero External LLM Dependency
- **Limitation:** The "Arth AI" chat assistant does not rely on a live LLM (like OpenAI or Gemini). 
- **Assumption:** To meet cost and API constraints, the system uses a **deterministic natural language template engine**. It parses keywords (e.g., "health", "score", "invest", "retire") and maps them directly to the underlying `TransactionsService` and `GoalsService` output.
- **Why:** This ensures zero hallucination, strict SEBI compliance, and zero recurring API costs for the demo.

## 2. Financial Modeling Proxies
- **Limitation:** Without live bank account aggregation (e.g., via Account Aggregator frameworks), we cannot definitively know the user's total net worth or historical long-term assets.
- **Assumption:** "Liquid Assets" is derived using a planning proxy formula: `(Base Buffer [₹200k] + Cumulative Net Cash Flow)`.
- **Why:** Hardcoding numbers leads to contradictory states if the user adds/removes income. Deriving it dynamically ensures the simulator, goals, and health scores remain coherent, even if the base number is a synthetic assumption.

## 3. Planning Assumptions (CAGR & Inflation)
- **Limitation:** The future value (FV) of goals is inherently unpredictable.
- **Assumption:** Arth AI standardizes Planning Assumptions based on the user's Risk Profile:
  - Conservative: 8% CAGR
  - Moderate: 12% CAGR
  - Aggressive: 14% CAGR
  - Inflation: 6% (flatline assumption)
- **Why:** This mirrors standard financial planning heuristics. These assumptions are centralized in `shared/planning-assumptions.ts` and explicitly disclosed in the UI and exported reports as "Planning Assumptions" so as not to be construed as guaranteed returns.

## 4. Local Database Setup
- **Limitation:** The database relies on a local SQLite file (`dev.db`).
- **Assumption:** A full distributed PostgreSQL instance was not necessary for a functional prototype demonstration. Prisma ORM handles the schema, meaning migrating to PostgreSQL in the future is a one-line configuration change.

## 5. Security & Auth Mocking
- **Limitation:** The login screen provides a "Demo Login" button rather than a full OTP/OAuth flow.
- **Assumption:** While a real JWT is minted and verified for all API routes (hardening the backend), the entry point to acquire the token is intentionally bypassed for ease of demonstration.
