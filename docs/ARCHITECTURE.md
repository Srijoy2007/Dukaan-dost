# DukaanDost Architecture Document
## Deploy or Die Hackathon | Specification and Architecture (25%)

> **Version:** 2.0  
> **Date:** August 2026  
> **Author:** Systems Engineering Lead  
> **Classification:** Entry Criterion — Architecture Document

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Context](#2-system-context)
3. [Container Architecture (Microservices)](#3-container-architecture-microservices)
4. [Component Deep-Dive: Bot Service](#4-component-deep-dive-bot-service)
5. [Technology Stack](#5-technology-stack)
6. [Data Architecture](#6-data-architecture)
7. [Integration Architecture](#7-integration-architecture)
8. [Security Architecture](#8-security-architecture)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Scalability & Performance](#10-scalability--performance)
11. [Monitoring & Observability](#11-monitoring--observability)
12. [Decision Log](#12-decision-log)

---

## 1. Executive Summary

DukaanDost is a WhatsApp-first business management platform for India's 12 million kirana stores. The architecture is designed around a single non-negotiable principle: **Ramesh Bhaiya never leaves WhatsApp.** 

This document describes a microservices-based system running on AWS India (ap-south-1) with event-driven state management, agent-orchestrated business logic, and a plug-in skill system engineered to absorb Day 2 surprise features without regression.

---

## 2. System Context

### 2.1 Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL ACTORS                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Customer  │  │  Merchant   │  │   Judge/    │  │   Razorpay / UPI    │ │
│  │  (WhatsApp) │  │(Ramesh Bhai)│  │   Demo User │  │   Payment Gateway   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼────────────────┼────────────────────┼────────────┘
          │                │                │                    │
          │ WhatsApp Msg   │ WhatsApp Msg   │ Browser / ngrok    │ Webhooks
          │                │                │                    │
┌─────────┼────────────────┼────────────────┼────────────────────┼────────────┐
│         ▼                ▼                ▼                    ▼            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    DUKAANDOST SYSTEM BOUNDARY                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │  Meta Whats  │  │   Bot        │  │    Payment               │  │   │
│  │  │  Business API│──│   Service    │──│    Service               │  │   │
│  │  │  (Webhook)   │  │  (Node.js)   │  │   (Razorpay)             │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │
│  │         │                 │                       │                 │   │
│  │         │                 │                       │                 │   │
│  │  ┌──────┴─────────────────┴───────────────────────┴──────┐         │   │
│  │  │              DATA LAYER (PostgreSQL + Redis)          │         │   │
│  │  └───────────────────────────────────────────────────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Boundaries

- **In Scope:** WhatsApp webhook handling, order management, inventory tracking, UPI payments, conversational business intelligence, landing page.
- **Out of Scope (Post-Hackathon):** Full catalog manager, advanced analytics, multi-language beyond Hindi/English, subscription billing, delivery logistics.

---

## 3. Container Architecture (Microservices)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         KUBERNETES CLUSTER (EKS)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         INGRESS (NGINX)                             │   │
│  │                    SSL Termination + Rate Limiting                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│  ┌──────────────────────────────────┼──────────────────────────────────┐   │
│  │                                  ▼                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │   │
│  │  │   Bot       │  │   Order     │  │  Payment    │  │   CRM     │ │   │
│  │  │   Service   │  │   Service   │  │  Service    │  │  Service  │ │   │
│  │  │   :3001     │  │   :3002     │  │   :3003     │  │   :3004   │ │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘ │   │
│  │         │                │                │               │       │   │
│  │  ┌──────┴────────────────┴────────────────┴───────────────┴─────┐ │   │
│  │  │              MESSAGE BUS (Redis Pub/Sub + Streams)            │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  │         │                │                │               │       │   │
│  │  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐  ┌────┴────┐│   │
│  │  │  Catalog    │  │  Analytics  │  │ Notification│  │  Auth   ││   │
│  │  │  Service    │  │  Service    │  │  Service    │  │ Service ││   │
│  │  │   :3005     │  │   :3006     │  │   :3007     │  │  :3008  ││   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘│   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Service Descriptions

| Service | Port | Responsibility | Tech |
|---------|------|----------------|------|
| **Bot Service** | 3001 | Webhook ingestion, NLP, agent orchestration, response formatting | Node.js 20, Express, Socket.io |
| **Order Service** | 3002 | Order CRUD, state machine, inventory deduction | Node.js 20, Express, Sequelize |
| **Payment Service** | 3003 | Razorpay integration, UPI QR generation, webhook reconciliation | Node.js 20, Razorpay SDK |
| **CRM Service** | 3004 | Customer directory, tags, broadcast messaging, loyalty | Node.js 20, MongoDB driver |
| **Catalog Service** | 3005 | Product catalog, stock levels, price management | Node.js 20, MongoDB |
| **Analytics Service** | 3006 | Aggregations, reports, proactive insights scheduler | Node.js 20, PostgreSQL |
| **Notification Service** | 3007 | WhatsApp message templating, SMS fallback, voice note dispatch | Node.js 20, MSG91 API |
| **Auth Service** | 3008 | OTP generation/verification, JWT issuance, session management | Node.js 20, Redis |

---

## 4. Component Deep-Dive: Bot Service

The Bot Service is the hackathon MVP's crown jewel. It is not a simple webhook handler; it is an **agent runtime**.

### 4.1 Internal Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      BOT SERVICE (:3001)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Webhook Controller                     │   │
│  │  (Meta WhatsApp Business API Signature Validation)  │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │              Message Normalizer                     │   │
│  │  (Unicode cleanup, Hinglish romanization standard)  │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │              Agent Runtime (ReAct Loop)             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │   Intent    │  │   Skill     │  │   Tool     │  │   │
│  │  │  Router     │──│  Registry   │──│  Executor  │  │   │
│  │  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │              Response Assembler                     │   │
│  │  (Template engine: Hindi/English/Hinglish i18n)     │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │              Outbound Dispatcher                    │   │
│  │  (Meta API client with retry + circuit breaker)     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 State Machine: Order Lifecycle

```
┌──────────┐    confirm     ┌──────────┐    pack      ┌──────────┐
│ RECEIVED │───────────────▶│ CONFIRMED│─────────────▶│  PACKED  │
└──────────┘                └──────────┘              └────┬─────┘
     │                                                     │
     │ cancel                                              │ ship
     ▼                                                     ▼
┌──────────┐                                          ┌──────────┐
│ CANCELLED│                                          │ OUT_FOR  │
└──────────┘                                          │ DELIVERY │
                                                      └────┬─────┘
                                                           │ deliver
                                                           ▼
                                                      ┌──────────┐
                                                      │ DELIVERED│
                                                      └────┬─────┘
                                                           │ pay
                                                           ▼
                                                      ┌──────────┐
                                                      │   PAID   │
                                                      └──────────┘
```

**State Transition Rules:**
- `RECEIVED` → `CONFIRMED`: Auto on successful stock validation.
- `CONFIRMED` → `PACKED`: Merchant taps "Pack" quick-reply button.
- `PACKED` → `OUT_FOR_DELIVERY`: Merchant taps "Ship" button.
- `OUT_FOR_DELIVERY` → `DELIVERED`: Merchant taps "Deliver" button OR customer sends "received".
- `DELIVERED` → `PAID`: Razorpay webhook confirms payment.
- Any state → `CANCELLED`: Merchant command "cancel order #123" within 10 minutes.

---

## 5. Technology Stack

### 5.1 Application Layer

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Runtime | Node.js 20 (LTS) | Non-blocking I/O for high-concurrency WhatsApp webhooks; team proficiency |
| Framework | Express.js 4 | Lightweight, middleware-rich, hackathon velocity |
| ORM | Sequelize 6 | PostgreSQL migrations, associations, transaction support |
| ODM | Mongoose 8 | Schema validation for catalog/logs in MongoDB |
| Validation | Zod 3 | Runtime type safety for all API contracts |
| Testing | Jest 29 + Supertest | Unit + integration testing with coverage |
| Linting | ESLint 8 + Prettier 3 | Code quality gate in CI |

### 5.2 Data Layer

| Store | Technology | Purpose |
|-------|-----------|---------|
| Primary DB | PostgreSQL 15 (RDS) | ACID transactions for orders, payments, merchants |
| Cache & Sessions | Redis 7 (ElastiCache) | Agent session state, rate limiting, job queues |
| Document Store | MongoDB 6 (DocumentDB) | Product catalogs, conversation logs, unstructured data |
| Object Storage | AWS S3 | QR code images, voice note backups, merchant assets |

### 5.3 Infrastructure Layer

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Cloud | AWS Mumbai (ap-south-1) | <50ms latency for Indian users; UPI compliance |
| Containers | Docker + Kubernetes (EKS) | Microservice isolation, auto-scaling |
| Ingress | NGINX Ingress Controller | SSL termination, path-based routing |
| CI/CD | GitHub Actions | Native Git integration, free for public repos |
| Secrets | AWS Secrets Manager | No hardcoded credentials |
| Monitoring | Datadog | APM, log aggregation, custom dashboards |
| Error Tracking | Sentry | Real-time exception alerting |

### 5.4 External Integrations

| Integration | Purpose | Failover |
|-------------|---------|----------|
| Meta WhatsApp Business API | Core messaging | BSP (360dialog) if direct API rate-limited |
| Razorpay Test API | UPI payments, QR codes | Cashfree sandbox if Razorpay down |
| Google Cloud Speech-to-Text | Voice note transcription | AWS Transcribe fallback |
| AWS Translate / Bhashini | Regional language translation | Manual Hindi/English only |
| MSG91 / Twilio | SMS fallback for non-WhatsApp | Direct operator SMS |

---

## 6. Data Architecture

### 6.1 ER Diagram (Core Entities)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  merchants  │◄──────│  customers  │◄──────│   orders    │
│─────────────│   1:M │─────────────│   1:M │─────────────│
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ phone (UQ)  │       │ phone       │       │ merchant_id │
│ store_name  │       │ merchant_id │       │ customer_id │
│ upi_id      │       │ name        │       │ status      │
│ language    │       │ tags[]      │       │ total_amt   │
│ created_at  │       │ created_at  │       │ pay_status  │
└─────────────┘       └─────────────┘       │ created_at  │
                                            └──────┬──────┘
                                                   │ 1:M
                                            ┌──────┴──────┐
                                            │ order_items │
                                            │─────────────│
                                            │ id (PK)     │
                                            │ order_id    │
                                            │ product_id  │
                                            │ quantity    │
                                            │ unit_price  │
                                            └─────────────┘
                                                   M:1
                                            ┌──────┴──────┐
                                            │   products  │
                                            │─────────────│
                                            │ id (PK)     │
                                            │ merchant_id │
                                            │ name        │
                                            │ price       │
                                            │ stock_qty   │
                                            │ low_thresh  │
                                            └─────────────┘

┌─────────────┐       ┌─────────────┐
│  payments   │◄──────│conversations│
│─────────────│   1:1 │─────────────│
│ id (PK)     │       │ id (PK)     │
│ order_id    │       │ merchant_id │
│ razorpay_id │       │ customer_id │
│ amount      │       │ direction   │
│ status      │       │ msg_type    │
│ utr         │       │ content     │
│ created_at  │       │ intent      │
└─────────────┘       │ entities    │
                      │ created_at  │
                      └─────────────┘
```

### 6.2 Database Selection Rationale

**Why PostgreSQL for orders?**
- Orders and payments require ACID compliance. A kirana store cannot afford double-charging or lost orders.
- Sequelize provides robust transaction support for inventory deduction + order creation.
- JSONB columns allow flexible metadata without schema migrations.

**Why MongoDB for catalog?**
- Product catalogs vary wildly between merchants (kirana vs. stationery vs. pharmacy).
- Schema evolution is frequent during early product-market fit.
- Conversation logs are write-heavy and read-rarely; MongoDB's document model is optimal.

**Why Redis?**
- Agent session TTL (24h) maps perfectly to Redis key expiration.
- Rate limiting on Meta API calls (prevent 429 errors).
- Pub/Sub for real-time order status updates to dashboard.

---

## 7. Integration Architecture

### 7.1 Meta WhatsApp Business API Flow

```
Customer sends message
        │
        ▼
┌───────────────┐
│  Meta Cloud   │
│   Servers     │
└───────┬───────┘
        │ HTTPS POST (Webhook)
        ▼
┌───────────────┐     ┌───────────────┐
│   NGINX       │────▶│  Bot Service  │
│   Ingress     │     │  /webhooks/   │
│  (SSL + WAF)  │     │  whatsapp     │
└───────────────┘     └───────┬───────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            ┌─────────────┐     ┌─────────────┐
            │   Redis     │     │ PostgreSQL  │
            │  (Session)  │     │  (Persist)  │
            └─────────────┘     └─────────────┘
                              │
                              ▼
                    ┌───────────────┐
                    │  Meta API     │
                    │  (Outbound)   │
                    └───────────────┘
```

### 7.2 Razorpay UPI Flow

```
Order Confirmed
        │
        ▼
┌───────────────┐
│ Payment Skill │──▶ Creates Razorpay Order
│   (create)    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Razorpay     │──▶ Returns payment_link_id + QR URL
│   API         │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   Customer    │──▶ Scans QR / clicks deep link
│   Phone       │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   UPI App     │──▶ Authenticates & pays
│ (GPay/PhonePe)│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Razorpay     │──▶ Webhook: payment.captured
│   Webhook     │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Payment Skill │──▶ Updates order → PAID
│ (reconcile)   │    Notifies merchant + customer
└───────────────┘
```

### 7.3 Voice Note Pipeline

```
Merchant sends voice note
        │
        ▼
┌───────────────┐
│  Meta API     │──▶ Provides audio URL (OGG/Opus)
│  (Download)   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   S3 Bucket   │──▶ Stores raw audio
│  (dukaan-voice│
│   -notes)     │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Google Cloud  │──▶ Transcription (hi-IN / en-IN)
│ Speech-to-Text│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ HinglishParser│──▶ Same pipeline as text
│    Skill      │
└───────────────┘
```

---

## 8. Security Architecture

### 8.1 Threat Model

| Threat | Mitigation |
|--------|-----------|
| Webhook spoofing | HMAC-SHA256 signature verification on all Meta and Razorpay webhooks |
| OTP brute force | Rate limiting: 3 attempts per phone per hour; Redis-backed |
| Payment tampering | Razorpay signature verification; amount validation against DB record |
| PII leakage | AES-256 encryption for phone numbers at rest; TLS 1.3 in transit |
| Injection attacks | Parameterized queries (Sequelize); Zod validation on all inputs |
| Unauthorized access | JWT with 15-min expiry; refresh token rotation |

### 8.2 Secrets Management

```yaml
# AWS Secrets Manager Structure
/dukaandost/
  /production/
    - META_API_TOKEN
    - META_WEBHOOK_SECRET
    - RAZORPAY_KEY_ID
    - RAZORPAY_KEY_SECRET
    - RAZORPAY_WEBHOOK_SECRET
    - DATABASE_URL
    - REDIS_URL
    - JWT_SECRET
    - GOOGLE_CLOUD_API_KEY
```

No secrets in code. All injected via Kubernetes Secrets + environment variables at pod startup.

---

## 9. Deployment Architecture

### 9.1 Local Development (Hackathon Mode)

```yaml
# docker-compose.yml (simplified)
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: dukaandost
      POSTGRES_USER: dukaan
      POSTGRES_PASSWORD: hackathon
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  bot:
    build: ./services/bot
    ports: ["3001:3001"]
    depends_on: [postgres, redis]
    env_file: .env

  order:
    build: ./services/order
    ports: ["3002:3002"]
    depends_on: [postgres, redis]

  payment:
    build: ./services/payment
    ports: ["3003:3003"]
    depends_on: [postgres, redis]

  web:
    build: ./services/web
    ports: ["3000:3000"]
```

**One-command startup:** `docker-compose up --build`

### 9.2 Production Target (Post-Hackathon)

```
┌─────────────────────────────────────────────┐
│              AWS Mumbai (ap-south-1)        │
│  ┌─────────────────────────────────────┐   │
│  │  Route 53 (dukaandost.in)           │   │
│  └─────────────────────────────────────┘   │
│                   │                         │
│  ┌────────────────▼─────────────────────┐   │
│  │  CloudFront (CDN + SSL)              │   │
│  └─────────────────────────────────────┘   │
│                   │                         │
│  ┌────────────────▼─────────────────────┐   │
│  │  Application Load Balancer           │   │
│  └─────────────────────────────────────┘   │
│                   │                         │
│  ┌────────────────▼─────────────────────┐   │
│  │  EKS Cluster (3 nodes, t3.medium)    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌────────┐ │   │
│  │  │ Bot Pod │ │Order Pod│ │Pay Pod │ │   │
│  │  │ (x2)    │ │ (x2)    │ │ (x2)   │ │   │
│  │  └─────────┘ └─────────┘ └────────┘ │   │
│  └─────────────────────────────────────┘   │
│                   │                         │
│  ┌────────────────▼─────────────────────┐   │
│  │  RDS PostgreSQL (Multi-AZ)           │   │
│  │  ElastiCache Redis (Cluster mode)    │   │
│  │  DocumentDB MongoDB                  │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 10. Scalability & Performance

### 10.1 Horizontal Scaling Strategy

| Service | Scaling Trigger | Max Replicas |
|---------|----------------|--------------|
| Bot Service | CPU > 70% or webhook queue > 1000 | 10 |
| Order Service | DB connection pool > 80% | 8 |
| Payment Service | Razorpay API latency > 2s | 6 |
| Analytics Service | Scheduled job backlog | 4 (cron-based) |

### 10.2 Performance Budgets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Bot response time | < 2 seconds | Meta API round-trip |
| Webhook processing | < 500ms | Ingress to DB commit |
| UPI QR generation | < 800ms | Razorpay API call |
| Landing page load | < 3 seconds | Lighthouse mobile |
| DB query (orders) | < 50ms | p95 daily sales query |

### 10.3 Caching Strategy

- **L1 (In-memory):** Merchant catalog (5-min TTL) inside Bot Service pods.
- **L2 (Redis):** Agent sessions (24h TTL), daily sales aggregates (1h TTL), rate limits.
- **L3 (PostgreSQL):** Materialized view `daily_sales_mv` refreshed every hour.

---

## 11. Monitoring & Observability

### 11.1 Three Pillars

| Pillar | Tool | Implementation |
|--------|------|----------------|
| **Metrics** | Datadog | Custom metrics: `orders.created`, `payments.success`, `bot.response_time`, `parser.confidence` |
| **Logs** | Datadog + Winston | Structured JSON logs with `trace_id`, `merchant_id`, `session_id` |
| **Traces** | Datadog APM | OpenTelemetry auto-instrumentation across all services |

### 11.2 Alerting Rules

| Condition | Severity | Action |
|-----------|----------|--------|
| Webhook 5xx rate > 1% | P0 | Page on-call engineer |
| Payment webhook delay > 5min | P0 | Page + notify merchant via SMS |
| Bot response time > 3s | P1 | Slack alert + auto-scale trigger |
| Parser confidence < 0.6 for > 10% of messages | P2 | Daily report + model retraining trigger |
| Disk usage > 85% | P2 | Auto-expand RDS storage |

### 11.3 Health Checks

```
GET /health
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "postgres": "connected",
    "redis": "connected",
    "razorpay": "reachable",
    "meta_api": "reachable"
  },
  "uptime": 86400
}
```

---


## 12. Business Persona System Architecture

### 12.1 Overview

The Business Persona System transforms DukaanDost from a kirana-specific tool into a **universal business intelligence layer**. Every merchant's bot adapts its personality, operational logic, insight templates, and conversational style based on an 8-question onboarding questionnaire.

**See full specification:** [BUSINESS_PERSONA_SYSTEM.md](./BUSINESS_PERSONA_SYSTEM.md)

### 12.2 Persona Engine Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BUSINESS PERSONA PIPELINE                           │
└─────────────────────────────────────────────────────────────────────────────┘

Merchant Registration Form (React)
    │
    ▼
┌─────────────────────────────┐
│  8-Question Assessment      │
│  Q1: Business Type          │
│  Q2: Top Products           │
│  Q3: Average Order Value    │
│  Q4: Delivery?              │
│  Q5: Communication Tone     │
│  Q6: Primary Language       │
│  Q7: Credit/Udhaar?         │
│  Q8: Operating Hours        │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  Persona Engine             │
│  - business_personas table  │
│  - tone_profile JSONB       │
│  - insight_config JSONB     │
└─────────────────────────────┘
    │
    ├──▶ Default Catalog Generator
    │       (Kirana → Atta/Oil/Sugar)
    │       (Pharmacy → Medicines/Syrups)
    │       (Bakery → Cakes/Bread/Pastries)
    │
    ├──▶ System Prompt Generator
    │       (Dynamic Groq prompt with business context)
    │
    ├──▶ Quick Reply Generator
    │       (Tone-aware button labels)
    │
    └──▶ Insight Template Selector
            (Pharmacy gets expiry alerts)
            (Bakery gets pre-order alerts)
```

### 12.3 Merchant vs Customer Authorization

```
Incoming WhatsApp Message
        │
        ▼
┌─────────────────────────────┐
│  Identity Resolution        │
│  1. Is sender == merchant?  │
│     → MERCHANT MODE         │
│     → Full capabilities     │
│                             │
│  2. Is sender == customer?  │
│     → CUSTOMER MODE         │
│     → Order-only capabilities│
│                             │
│  3. Unknown?                │
│     → Onboarding or ignore  │
└─────────────────────────────┘
```

**Capability Enforcement:** All business insight queries (`daily-sales`, `stock-check`, `pending-payments`) are wrapped with `authorizeCapability('merchant')` middleware. Unauthorized customers receive a polite redirect in their language.

### 12.4 Custom Bot Provisioning

Each merchant gets a **dedicated WhatsApp Business identity**:

| Component | Per-Merchant Customization |
|-----------|---------------------------|
| WABA | Created or linked per merchant |
| Phone Number | Merchant's own business number |
| Display Name | Store name from registration |
| Webhook URL | `https://api.dukaandost.in/webhooks/whatsapp/{merchantId}` |
| System Prompt | Generated from business persona |
| Catalog | Seeded from Q2 answers |

**Provisioning Service:** Async job queue (`provisioning_jobs` table) tracks WABA creation → phone registration → Meta OTP verification → webhook configuration → activation.

---

## 13. Frontend-Backend Integration Architecture

### 13.1 Registration Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│   Auth      │────▶│  Persona    │────▶│   Bot       │
│   Frontend  │     │   Service   │     │   Engine    │     │Provisioning │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      │ POST /register    │ POST /verify-otp  │ Generate persona  │ Meta API
      │                   │                   │                   │
      │◀──merchantId─────│◀──JWT + persona───│◀──system prompt───│◀──WABA ID
      │                   │                   │                   │
      │ WebSocket sub     │                   │                   │
      │◀──progress 30%────│                   │                   │
      │◀──progress 60%────│                   │                   │
      │◀──progress 100%───│                   │                   │
```

### 13.2 Real-Time Updates

WebSocket channel `provisioning:{merchantId}` streams progress:
- `WABA_CREATED` → 30%
- `PHONE_REGISTERED` → 60% (Meta OTP required)
- `WEBHOOK_CONFIGURED` → 80%
- `BOT_ACTIVE` → 100%

---

## 12. Decision Log

| ID | Decision | Alternatives | Rationale | Date |
|----|----------|--------------|-----------|------|
| ADR-001 | Node.js over Python | Python (FastAPI), Go | Team proficiency; non-blocking I/O for webhooks; vast npm ecosystem for WhatsApp/Razorpay SDKs | Hour 2 |
| ADR-002 | PostgreSQL over MySQL | MySQL 8, CockroachDB | Better JSONB support for flexible order metadata; superior transaction handling | Hour 4 |
| ADR-003 | Direct Meta API over BSP | 360dialog, Wati | Cost control long-term; no middleware dependency; direct webhook control | Hour 4 |
| ADR-004 | Regex NLP over ML Model | BERT, OpenAI API | 72-hour constraint; no training data; regex sufficient for MVP order patterns | Hour 6 |
| ADR-005 | Microservices over Monolith | Single Express app | Separation of concerns for team parallelization; Bot Service can scale independently | Hour 6 |
| ADR-006 | Redis Streams over Kafka | RabbitMQ, SQS | Simpler ops; no external broker needed; sufficient for MVP throughput | Hour 8 |
| ADR-007 | Docker Compose local over K8s local | Minikube, Kind | Zero setup time for judges; `docker-compose up` is universally understood | Hour 10 |
| ADR-008 | Event-sourcing for order state | Direct state updates | Enables Day 2 surprise feature injection without mutating existing state machine | Hour 12 |

---

*End of Architecture Document*| ADR-009 | Aug 2026 | Dynamic Business Persona System | Hardcoded kirana prompt | Universal persona engine with onboarding questionnaire | Hour 14 |
| ADR-010 | Aug 2026 | Per-Merchant Bot Provisioning | Shared bot number | Dedicated WABA + webhook per merchant for brand identity | Hour 16 |
| ADR-011 | Aug 2026 | Merchant/Customer Authorization | No role distinction | Identity resolution with capability matrix for security | Hour 18 |

