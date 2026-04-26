# MaxAds — AI-Powered Marketing Copilot for Egyptian SMBs

> Research funded by Meta Regional Research Grant (META–RRG)
> Egyptian University Of Informatics (EUI)

---

## Overview

MaxAds is a unified marketing operations platform built specifically for Egyptian Small and Medium Businesses (SMBs). It connects Meta Ads and Shopify into a single intelligent dashboard, replacing the complexity of Ads Manager with an AI agent that reasons, acts, and remembers — conversing natively in Egyptian Ammiya.

Egyptian SMBs face a real barrier: **73% doubt their ads strategy**, waste an average of **10 hours per week** on manual campaign management, and risk up to **40% ROI reduction** — not because their businesses aren't viable, but because existing tools were never designed for non-technical owners.

MaxAds changes that.

---

## The Agent: How It Thinks, Acts & Learns

MaxAds is powered by a **Unified Tooled Agent** built on Llama 4 Maverick and LangGraph. The agent operates in a continuous four-stage loop:

```
Plan → Execute → Analyze → Optimize
```

### Stage 1 — Perceive
The agent receives the user's intent and injects RAG context. It retrieves business data, chat history, and brand documents via:
```
search_docs()
```

### Stage 2 — Reason
Llama 4 Maverick performs deep reasoning inside a **single context window**. It selects tools autonomously with no human routing and no message-passing overhead.

### Stage 3 — Act
The agent executes tool calls via native function calling:
```
create_campaign()
fetch_insights()
pause_ad_set()
optimize_budget()
```

### Stage 4 — Remember
Decisions, outcomes, and user preferences are persisted to a **three-tier memory system**, enabling stateful multi-session marketing cycles:

| Memory Layer | Technology | Purpose |
|---|---|---|
| Transactional | PostgreSQL | Profiles, campaigns, ledger |
| Semantic | pgVector (1536d embeddings) | Chat history, agentic RAG |
| Ephemeral | Redis | Sub-ms session state and buffers |

---

## Unified Toolset

The agent has direct access to four external tool groups:

### Meta Graph API
```
create_campaign()     — launch new ad campaigns
fetch_insights()      — pull performance metrics
pause_ad_set()        — stop underperforming ads
```

### Shopify Admin
```
query_inventory()     — check stock levels
get_top_sellers()     — identify best performing products
fetch_segments()      — pull customer segments
```

### pgVector Agentic RAG
```
search_docs()         — semantic document retrieval
retrieve_context()    — inject business context into reasoning
```

### Web Search
```
search_web()          — real-time market intelligence
get_market_trends()   — competitive and trend signals
```

---

## Architectural Evolution

MaxAds went through three architectural phases before reaching its current form:

### Phase 1 — ReAct Monolith *(The Reasoning Awakening)*
- **Stack:** Llama 3.1 8B · FAISS · Streamlit
- **Approach:** ReAct loop (Thought → Action → Observation) with RAG grounding
- **Limitation:** Surface-level reasoning; unable to handle complex multi-step workflows

| Latency | Trust Score | Reasoning Depth |
|---|---|---|
| ~3 sec | 2.8 / 5 | Surface |

---

### Phase 2 — Multi-Agent Orchestration *(Distributed Orchestration)*
- **Stack:** LangGraph · Docker · 3× Quantized 8B models
- **Approach:** Supervisor delegates to Analytics, Creative, and Research sub-agents
- **Limitation:** Catastrophic coordination overhead — 44% of task time consumed by inter-agent messaging and dialogue loops

| Latency | Trust Score | Reasoning Depth |
|---|---|---|
| ~15 sec | 3.5 / 5 | Moderate |

---

### Phase 3 — Unified Tooled Agent *(Zero-Overhead Execution)* `CURRENT`
- **Stack:** Llama 4 Maverick · LangGraph · Native Tool Calling
- **Approach:** Single frontier model with direct API access across Meta, Shopify, pgVector, and Web Search
- **Result:** Deep reasoning in one context window, zero message-passing tax

| Latency | Trust Score | Reasoning Depth |
|---|---|---|
| ~5 sec | 4.6 / 5 | Deep |

---

## Technical Benchmarks

| Metric | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| State Management | None (Stateless) | Complex (Shared State) | Unified (PostgreSQL + pgVector) |
| Arabic Support | Generic / MSA | Translated (Wrapper) | Native (Egyptian Ammiya) |
| Task Completion Time | N/A | 21.8 min | 12.4 min *(44% faster)* |
| SUS Score | N/A | 78.2 | 88.8 *(+13.6%)* |

---

## What MaxAds Delivers

**Agentic Copilot**
The conversational agent autonomously executes marketing operations — creates campaigns, pauses underperforming ads, reallocates budgets, and analyzes performance. Speaks Egyptian Ammiya natively.

**Explainable AI (XAI)**
Every recommendation cites real business metrics so SMBs can verify before acting:
> *"Pause Ad Set B — CPA rose to $15, exceeding your $10 target"* → `fetch_insights()`

**Dynamic Adaptive Dashboard**
Live unified view of ad spend, ROAS, inventory, and sales attribution. Adapts layout to the user's active campaigns and business type. Replaces the complexity of Meta Ads Manager entirely.

**AI Content Gallery**
Image generation and AI copywriting for ad creatives — static posts, carousel content, and copy culturally tuned for the Egyptian market in Arabic or English:
> `generate_ad_creative()` → brand-consistent visuals + copy

**Simplified Analytics**
> Before: 47 metrics in Ads Manager → After: 5 key insights, plain language

---

## System Architecture

```
User
  └── Frontend (React / Vite + RTL / i18n)
        ├── Supabase Auth
        └── Backend API (Node / Express)
              ├── PostgreSQL via Prisma
              ├── pgVector  (1536d semantic memory)
              ├── Redis     (ephemeral state)
              ├── Bull      (background sync jobs)
              ├── Meta Graph API
              ├── Shopify Admin API
              └── Llama 4 Maverick · LangGraph Agent
```

### Authentication & Security
- **Portal Auth (Supabase):** Used for all production endpoints. Frontend obtains Supabase JWT; backend validates via `requireSupabaseAuth`.
- **Token Storage:** Meta and Shopify access tokens are AES-encrypted at rest in PostgreSQL and never exposed to the frontend.

---

## User Journey

| Step | Action |
|---|---|
| 1 | Portal login via Supabase (Google / Facebook / email) |
| 2 | Connect Meta account via OAuth |
| 3 | Connect Shopify store *(optional)* |
| 4 | View unified analytics dashboard |
| 5 | Generate AI ad creatives |
| 6 | Chat with the agent and execute marketing actions |

---

## Environment Variables

**Backend**
```env
DATABASE_URL=
JWT_SECRET=
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=
ENCRYPTION_KEY=
REDIS_URL=
```

**Frontend**
```env
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Roadmap

- [ ] Regional expansion — UAE and Saudi Arabia
- [ ] Multi-tenancy via PostgreSQL Row-Level Security (RLS)
- [ ] Kubernetes auto-scaling infrastructure
- [ ] Full i18n coverage across all pages (Analytics, AI Chat, AI Ads, Work Station)
- [ ] Meta token refresh and reconnect flow
- [ ] Technical paper publication

---

## Acknowledgment

This research was funded by the **Meta Regional Research Grant (META–RRG)**. All findings and outputs are part of an independent academic research initiative conducted at the Egyptian University Of Informatics (EUI).
