# Arth AI Wealth Advisor

**Arth AI** is a compliance-aware, AI-powered wealth advisory and financial planning platform built for the IDBI Innovate Hackathon 2026. It provides a cohesive, end-to-end user experience starting from multilingual onboarding and risk profiling, all the way to goal-based planning, interactive "what-if" simulations, and deterministic AI financial advisory.

## Problem Statement

Retail investors often struggle to understand their holistic financial health, set realistic goals, and choose the right mutual fund products. Existing tools are either purely transactional without advisory or provide generic advice without taking real transactional data into account. 

## Solution

Arth AI acts as an intelligent financial co-pilot. It:
1. Analysizes real transaction data to generate a dynamic Financial Health Score.
2. Conducts a SEBI-aligned risk assessment to determine the investor's risk profile.
3. Provides a curated, suitability-matched portfolio recommendation basket (IDBI Mutual Funds).
4. Enables goal mapping with dynamic gap analysis based on risk-adjusted CAGR planning assumptions.
5. Offers an explainable AI chat interface to interact with financial data.
6. Maintains a rigorous digital consent and audit trail for all advisory actions.

## Tech Stack

- **Frontend:** React, React Router, TailwindCSS, Zustand, Vite.
- **Backend:** Node.js, Express.js.
- **Database:** Prisma ORM with SQLite (for MVP/Demo purposes).
- **Architecture:** Monorepo using npm workspaces (`apps/web`, `apps/api`, `packages/shared-types`).

## Setup Instructions

1. **Install Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Initialize Local Database:**
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma db push
   npm run seed
   cd ../..
   ```

3. **Initialize Supabase Profile & Settings (Required):**
   Arth AI uses Supabase to persist user profiles and settings.
   - Create a new project in [Supabase](https://supabase.com/).
   - Run the following SQL in the Supabase SQL Editor:
     ```sql
     CREATE TABLE user_profiles (
       app_user_id TEXT PRIMARY KEY,
       full_name TEXT,
       email TEXT,
       phone TEXT,
       date_of_birth TEXT,
       city TEXT,
       country TEXT,
       occupation TEXT,
       monthly_income_range TEXT,
       investment_experience TEXT,
       preferred_currency TEXT DEFAULT 'INR',
       preferred_language TEXT DEFAULT 'en',
       onboarding_completed BOOLEAN DEFAULT false,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );

     CREATE TABLE user_settings (
       app_user_id TEXT PRIMARY KEY,
       theme_preference TEXT DEFAULT 'system',
       email_notifications BOOLEAN DEFAULT true,
       push_notifications BOOLEAN DEFAULT true,
       risk_review_reminders BOOLEAN DEFAULT true,
       show_planning_assumptions BOOLEAN DEFAULT true,
       advisor_contact_preference TEXT DEFAULT 'in-app',
       report_export_format TEXT DEFAULT 'markdown',
       language_preference TEXT DEFAULT 'en',
       privacy_mode BOOLEAN DEFAULT false,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```
   - Copy your Supabase URL and Service Role Key into `apps/api/.env`:
     ```env
     SUPABASE_URL=your_project_url
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

4. **Run the Application:**
   From the root of the project, run:
   \`\`\`bash
   npm run dev
   \`\`\`
   This will start both the Express API (on port 3001) and the React frontend (on port 3000) concurrently.

## Core Features

- **Multilingual Onboarding:** English, Hindi, and Tamil support for inclusive access.
- **Risk Profiling:** 5-question psychometric test to categorize users as Conservative, Moderate, or Aggressive.
- **Transaction Ingestion Engine:** Parses mock transaction data to derive Investable Surplus, Emergency Fund Coverage, and Expense Stability.
- **Goal Gap Simulator:** Interactive sliders to simulate the compounding effect of monthly SIPs over time.
- **Deterministic AI Chat:** An interactive assistant that relies on synthesized backend metrics instead of hallucinating answers.
- **Exportable Advisory Report:** Generates a downloadable Markdown report summarizing the user's financial snapshot, recommendations, and goals.

## Important Note

This is a **Portfolio/Demo-Ready MVP**. For information on limitations, assumptions, and architectural decisions, please read `ARCHITECTURE.md` and `LIMITATIONS.md`.
