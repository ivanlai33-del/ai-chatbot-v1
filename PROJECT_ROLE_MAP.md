# PROJECT_ROLE_MAP: ai-chatbot-v2

## 1. Asset Classification

| Asset Type | Directory / Files | Primary Persona |
| :--- | :--- | :--- |
| **Strategy & Vision** | `product_strategy.md`, `AI_PERSONALITY_TRAINING_GUIDE.md` | Commander |
| **Logic & Core** | `app/api/`, `lib/`, `supabase_*.sql`, `package.json`, `next.config.mjs` | Engineering |
| **User Flows & UI** | `app/`, `components/`, `app/globals.css` | UX / Flow |
| **Knowledge & Docs** | `AI_INTEGRATION_GUIDE.md`, `CONVERSATIONAL_TRAINING.md`, `SAAS_API_DOCUMENTATION.md` | Research & Content |
| **Metrics & Analytics** | `token_usage_schema.sql`, `enterprise_enquiries_schema.sql`, `ai_chat_debug.log` | Data / Finance |
| **Ops & Deploy** | `.env.local`, `.vercel/`, `.gitignore`, `package-lock.json` | Support / Ops |

## 2. Special Assignments
* **ChatInterface.tsx**: Shared responsibility between **UX** (Aesthetics/Flow) and **Engineering** (Logic/Data Binding).
* **Supabase Integration**: **Engineering** leads structure, **Data** leads metric schemas.
