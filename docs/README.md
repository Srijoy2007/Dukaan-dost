# DukaanDost 🏪🤖

> **WhatsApp-first business intelligence for India's 12 million kirana stores.**

[![CI/CD](https://github.com/your-org/dukaandost/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/dukaandost/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage->60%25-brightgreen)](./TEST_PLAN.md)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

**Deploy or Die Hackathon** | ADLC + Spec Kit + BMAD Framework  
**Powered by:** Meta WhatsApp API • Razorpay UPI • Node.js • PostgreSQL • Redis

---

## 🎯 The Problem

India runs on WhatsApp — and 12 million kirana stores run on memory, trust, and handwritten ledgers. Every evening, Ramesh Bhaiya locks his shop, pulls out a frayed notebook, and squints at scribbled entries to figure out who ordered what, who still owes money, and whether he has enough *atta* for tomorrow.

His customers already message him on WhatsApp. His payments already flow through UPI. But his business intelligence is still trapped on paper.

## 💡 The Solution

**DukaanDost** transforms the familiar WhatsApp chat into a full-fledged business tool:

- 📦 **Auto-Order Capture:** *"Bhaiya 2kg atta bhej do"* → Structured order + UPI QR
- 📊 **Conversational Insights:** *"Aaj kitna bikaa?"* → Daily sales, stock, pending payments (merchant-only)
- 🎭 **Adaptive Persona:** Pharmacy, bakery, tailor, stationery — the bot adapts to YOUR business
- 🤖 **Custom Bot:** Every merchant gets their own WhatsApp Business number with their store name
- 💳 **UPI-Native:** Every order generates a QR code. Payment reconciliation is automatic.
- 🗣️ **Voice-First:** Merchants who can't type fluently speak to their business.
- 🇮🇳 **Bharat-First:** Hindi, Hinglish, and English. Zero app installs.

---

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Customer   │     │   Meta      │     │   Bot       │
│  WhatsApp   │◄───►│  WhatsApp   │◄───►│  Service    │
│             │     │  Business   │     │  (Agent     │
└─────────────┘     │  API        │     │  Runtime)   │
                    └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────┐
                    │                          │          │
              ┌─────▼─────┐            ┌───────▼─────┐  ┌▼────────┐
              │ PostgreSQL │            │    Redis    │  │Razorpay │
              │  (Orders)  │            │ (Sessions)  │  │  (UPI)  │
              └────────────┘            └─────────────┘  └─────────┘
```

**Key Documents:**
- 📐 [Architecture](./ARCHITECTURE.md) — Stack, data model, integrations, deployment
- 📋 [Specification](./SPECIFICATION.md) — User stories, acceptance criteria, state machines
- 🤖 [Agents & Skills](./AGENTS_AND_SKILLS.md) — Custom agent manifest, skill schemas, tool registry
- 📊 [Data Model](./DATA_MODEL.md) — PostgreSQL DDL, MongoDB collections, Redis patterns
- 🔌 [API Spec](./API_SPEC.md) — Webhooks, REST endpoints, error codes
- 🧪 [Test Plan](./TEST_PLAN.md) — Unit, integration, E2E, security, performance tests
- ⚖️ [Constitution](./CONSTITUTION.md) — Non-negotiable principles and quality gates

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development without Docker)
- ngrok (for WhatsApp webhook testing)
- Razorpay Test Account
- Meta WhatsApp Business API Sandbox

### One-Command Startup

```bash
# Clone the repo
git clone https://github.com/your-org/dukaandost.git
cd dukaandost

# Copy environment template
cp .env.example .env
# Edit .env with your Razorpay and Meta API credentials

# Start everything
docker-compose up --build

# In another terminal, expose webhook via ngrok
ngrok http 3001

# Configure Meta webhook URL: https://your-ngrok-url/webhooks/whatsapp
```

### Seed Demo Data

```bash
npm run db:migrate
npm run db:seed:demo
```

This creates:
- 1 merchant (Ramesh General Store)
- 5 products (Atta, Oil, Sugar, Dal, Rice)
- 3 customers with realistic order history
- 1 pending payment for the "Pending Payments" demo

### Run Tests

```bash
# Unit tests with coverage
npm run test:unit

# Integration tests (requires Docker services)
npm run test:integration

# E2E tests (full flow)
npm run test:e2e

# All tests + lint + security audit
npm run test:all
```

---

## 🎬 Demo Script (3 Minutes)

### Scene 1: Customer Places Order (Hindi)
**Customer (Priya):** *"Bhaiya 2kg atta, 1 litre oil bhej do"*

**Bot:** ✅ Order Confirm!
- Atta — 2kg × ₹45 = ₹90
- Oil — 1L × ₹120 = ₹120
- **Total: ₹210**

💳 Pay karne ke liye QR scan karein...

### Scene 2: Merchant Checks Business
**Merchant (Ramesh):** *"Aaj kitna bikaa?"*

**Bot:** 📊 Aaj ka Hisaab:
- 🛒 Orders: 23
- 💵 Total: ₹18,450
- ⏳ Pending Payments: 3

### Scene 3: Payment & Delivery
- Customer scans QR → UPI payment successful
- Razorpay webhook updates order → PAID
- Both receive confirmation
- Ramesh taps "Deliver" → Customer gets "Order delivered! 🙏"

---

## 🧠 Agent Engineering

### Custom Agent: `DukaanBot Business Agent`

An autonomous ReAct-loop agent that adapts to each merchant's business persona:

- **Identity Resolution:** Distinguishes merchant from customer. Business insights are merchant-only.
- **Dynamic Context:** Loads business persona (store type, tone, language) per session.
- **Intent Classification:** Routes messages to appropriate skills
- **Entity Extraction:** Delegates to `HinglishOrderParserSkill`
- **Tool Execution:** Creates orders, checks stock, generates UPI links
- **Dynamic Prompts:** Generates contextual Groq system prompts from business persona
- **Proactive Nudging:** Scheduled morning briefings, evening settlements (tone-aware)

### Custom Skill 1: `HinglishOrderParserSkill`

Parses mixed Hindi-English (Hinglish) messages into structured commercial intent:

```
"2kg atta bhej do" → { intent: "place_order", entities: [{product: "atta", qty: 2, unit: "kg"}] }
```

### Custom Skill 2: `UPIPaymentOrchestratorSkill`

Handles complete Razorpay UPI lifecycle: link generation → QR code → webhook reconciliation.

**See full details in [AGENTS_AND_SKILLS.md](./AGENTS_AND_SKILLS.md)**

---

## 📁 Project Structure

```
dukaandost/
├── .github/
│   └── workflows/
│       └── ci.yml              # Green CI/CD pipeline
├── docs/
│   ├── ARCHITECTURE.md              # System architecture
│   ├── BUSINESS_PERSONA_SYSTEM.md   # Dynamic personas & bot provisioning
│   ├── SPECIFICATION.md             # Executable specifications
│   ├── DATA_MODEL.md                # Database schema
│   ├── API_SPEC.md                  # API contracts
│   ├── TEST_PLAN.md                 # Testing strategy
│   ├── AGENTS_AND_SKILLS.md         # Agent registry
│   └── CONSTITUTION.md              # Project constitution
├── services/
│   ├── bot/                    # Bot Service (webhook, NLP, agent runtime)
│   ├── order/                  # Order Service (CRUD, state machine)
│   ├── payment/                # Payment Service (Razorpay, UPI)
│   ├── catalog/                # Catalog Service (products, inventory)
│   ├── analytics/              # Analytics Service (reports, insights)
│   ├── notification/           # Notification Service (WhatsApp, SMS)
│   ├── crm/                    # CRM Service (customers, broadcasts)
│   └── auth/                   # Auth Service (OTP, JWT)
├── web/                        # Landing page + optional dashboard
├── shared/
│   ├── types/                  # TypeScript interfaces
│   └── utils/                  # Common utilities
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   ├── e2e/                    # End-to-end tests
│   ├── language/               # Multi-language tests
│   ├── security/               # Security tests
│   └── performance/            # Load tests (k6)
├── docker-compose.yml          # Local development stack
├── docker-compose.test.yml     # Test environment stack
├── package.json
└── README.md
```

---

## 🏆 Judging Criteria Alignment

### ✅ The Five Checkpoints (Entry Criteria)

| Checkpoint | Evidence | Location |
|------------|----------|----------|
| **Architecture Document** | Present, describing stack, data model, high-level design | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Agent Rules** | Constitution file with non-negotiable principles | [CONSTITUTION.md](./CONSTITUTION.md) |
| **Working Code** | App builds and runs. Demonstrable via `docker-compose up` | [services/](./services/) |
| **Custom Agent + Custom Skill** | Both committed and documented | [AGENTS_AND_SKILLS.md](./AGENTS_AND_SKILLS.md) |
| **Green CI/CD Pipeline** | GitHub Actions workflow present, latest run passes | [.github/workflows/ci.yml](./.github/workflows/ci.yml) |

### 📊 Scoring Areas

| Area | Weight | How We Address It |
|------|--------|-------------------|
| **Specification & Architecture** | 25% | Deliberate decisions in [SPECIFICATION.md](./SPECIFICATION.md), event-sourcing for Day 2 extensibility, ADR log in [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Working Software & Delivery** | 30% | `docker-compose up` boots full stack. ngrok-ready for live demo. Razorpay Test API generates real UPI QRs. |
| **Agent Engineering & Code Quality** | 30% | ReAct-loop agent runtime. Versioned skills with I/O schemas. Tool registry with audit logging. >60% test coverage. |
| **Testing & Verification** | 15% | Automated unit, integration, E2E, security, and performance tests. All run in CI pipeline. Coverage threshold enforced. |

---

## 🛡️ Security

- All webhooks verified via HMAC-SHA256 (Meta + Razorpay)
- Phone numbers encrypted at rest (AES-256)
- JWT tokens with 15-minute expiry + refresh rotation
- Rate limiting on all endpoints
- `npm audit` and Snyk scanning in CI
- TruffleHog secret detection in CI

---

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 👥 Team

Built with 💙 for Ramesh Bhaiya by the DukaanDost Hackathon Squad.

**Event:** Deploy or Die: HowToAlgo x GDG on Campus KIIT Hackathon  
**Duration:** 72 Hours  
**Framework:** ADLC + GitHub Spec Kit + BMAD

---

*DukaanDost — Har dukaan ka digital dost.* 🇮🇳
