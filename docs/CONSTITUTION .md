# DukaanDost Constitution
## Deploy or Die Hackathon | ADLC + Spec Kit + BMAD Framework

> **Version:** 2.0  
> **Date:** August 2026  
> **Status:** Hackathon Entry — Non-Negotiable  
> **Authority:** Systems Engineering Lead

---

## Preamble

This constitution governs every line of code, every agent decision, and every architectural choice made during the 72-hour ADLC Hackathon. It is not a suggestion. It is the invariant layer upon which DukaanDost is built. Any deviation requires unanimous team consent and a documented ADR (Architecture Decision Record).

---

## Article I: WhatsApp-First Mandate

**Principle:** All business logic MUST be accessible via WhatsApp chat. The web dashboard is strictly secondary and exists only as a read-only analytics layer for power users.

**Rationale:** Ramesh Bhaiya will never open a browser. He lives inside WhatsApp. If a feature cannot be triggered, queried, or completed within a WhatsApp conversation, it does not exist.

**Invariant:**
- Every user story must have a conversational acceptance criterion before a visual one.
- The bot is the primary interface; the dashboard is the bonus.
- North Star Metric: *"Can Ramesh Bhaiya run his entire business without ever leaving WhatsApp?"*

---

## Article II: Bharat-First Language Policy

**Principle:** Hindi/Hinglish support is mandatory. English is secondary. Voice-first interaction is preferred for merchants who do not type fluently.

**Rationale:** 90% of kirana store owners in Tier 2/3 cities are comfortable with spoken Hindi but not with typing English. Voice notes reduce friction to zero.

**Invariant:**
- All bot responses must support Hindi (Devanagari), Hinglish (Roman Hindi), and English.
- Critical alerts (low stock, payment due) MUST be sent as voice notes by default.
- NLP parser must handle code-mixed utterances (e.g., *"Bhaiya 2kg atta bhej do"*).
- Planned regional languages (Tamil, Telugu, Marathi, Bengali, Gujarati) must be architected as plug-in translation modules.

---

## Article III: Zero-Friction Onboarding

**Principle:** No app installs. No passwords. No training. No credit card. Start in 2 minutes.

**Rationale:** The target merchant has a ₹15,000 Android phone, 2G connectivity, and zero patience for onboarding flows.

**Invariant:**
- Onboarding is OTP-based phone verification only.
- Merchant catalog is bootstrapped via chat commands, not form filling.
- First order must be capturable within 60 seconds of first message.

---

## Article IV: UPI-Native Payments

**Principle:** Every order generates a UPI-payable invoice with a QR code. Payment reconciliation is automatic.

**Rationale:** India runs on UPI. Ramesh Bhaiya already uses Google Pay, PhonePe, and Paytm. We meet him where his money is.

**Invariant:**
- Razorpay Test API integration is demo-critical.
- Every order confirmation MUST include a UPI deep link + QR code.
- Payment status webhooks must update order state automatically.
- Failed payments must trigger a polite retry flow via WhatsApp.

---

## Article V: Agent-Driven Architecture

**Principle:** Business logic is executed by autonomous agents with specialized skills, not by hardcoded imperative scripts.

**Rationale:** A script breaks when the Day 2 surprise feature arrives. An agent adapts. This is what separates "Agent Engineering" from "prompting a generic assistant."

**Invariant:**
- The `DukaanBot Business Agent` is the sole orchestrator of merchant-facing logic.
- All agent tools are versioned, tested, and documented in `AGENTS_AND_SKILLS.md`.
- Agents must maintain conversational state (context window) across multi-turn interactions.
- Human-in-the-loop for transactions >₹5,000 or inventory deletions.

---

## Article VI: Quality Gates & BMAD Compliance

**Principle:** No code merges without review. No features without tests. No deploy without a green CI/CD pipeline.

**Rationale:** In a 72-hour sprint, the temptation to skip tests is high. Skipping tests kills demos. A green pipeline is our safety net.

**Invariant:**
- Every Pull Request must pass: Lint → Unit Tests → Integration Tests → Security Audit.
- Test coverage for critical paths (bot parser, payment flow, state machine) must be >60%.
- All commits must reference a BMAD Story ID.
- The `main` branch is always deployable.

---

## Article VII: Demo-Runnable Locality

**Principle:** The entire stack must spin up on localhost with a single command and be demonstrable via ngrok.

**Rationale:** Hackathon WiFi is unreliable. Judges want to see it work on your machine.

**Invariant:**
- `docker-compose up` must boot PostgreSQL + Redis + Bot Service + Web Dashboard.
- ngrok tunnel must expose the webhook endpoint for live WhatsApp testing.
- Demo data must be seedable via `npm run seed:demo`.

---

## Article VIII: Extensibility for Day 2 Surprise

**Principle:** The architecture must absorb a Day 2 surprise feature without breaking existing conversational flows.

**Rationale:** The Deploy or Die finals explicitly judge *"how cleanly you added the Day 2 surprise feature without breaking existing functionality."*

**Invariant:**
- All skills are plug-in modules with standardized input/output schemas.
- The state machine uses event-sourcing; new states are additive, never mutative.
- Feature flags (`FF_` prefix) wrap all new capabilities.
- API contracts are versioned (`/v1/`, `/v2/`).

---

## Article IX: Dynamic Business Persona

**Principle:** The bot must adapt its personality, operational logic, and insight templates to match the merchant's actual business type — not assume everyone runs a kirana store.

**Rationale:** India has 63 million MSMEs. Kirana stores are just one segment. Pharmacies, bakeries, tailors, and stationery shops all manage orders on WhatsApp. A one-size-fits-all approach limits our TAM and feels generic to judges.

**Invariant:**
- Every merchant completes an 8-question persona assessment during onboarding.
- The `BusinessPersona` object is the single source of truth for bot behavior.
- System prompts for Groq are generated dynamically from the persona — never hardcoded.
- Feature activation (expiry tracking, pre-orders, bulk pricing) is persona-driven.
- Tone, emoji usage, honorifics, and greeting style are derived from merchant preference.

---

## Article X: Merchant-Only Business Insights

**Principle:** Business intelligence (sales, stock, pending payments, customer data) is accessible only to the registered merchant. Customers are explicitly unauthorized.

**Rationale:** A customer seeing another customer's credit status is a privacy violation. A competitor messaging the bot to check stock levels is a business risk. Identity resolution is simple (phone number comparison) and effective.

**Invariant:**
- Every incoming message undergoes identity resolution: `sender_phone == merchant_phone`?
- The `isMerchant` flag is set on every session and checked before all insight endpoints.
- Unauthorized insight requests receive a polite redirect in the merchant's preferred language — never an error dump.
- Customers may only: place orders, view their own order history, make payments, ask "is X available?"

---

## Article XI: Per-Merchant Bot Identity

**Principle:** Every merchant gets their own WhatsApp Business identity with their store name and phone number — not a shared generic bot.

**Rationale:** A merchant's WhatsApp number is their business identity. Customers save it as "Sharma Kirana" not "DukaanDost Bot." Brand trust and personal relationships are preserved.

**Invariant:**
- Each merchant registration triggers async WABA provisioning.
- The bot's display name matches the merchant's store name.
- The webhook URL is merchant-scoped: `/webhooks/whatsapp/{merchantId}`.
- Webhook signatures are verified using merchant-specific tokens.
- Provisioning failures are retried with exponential backoff and surfaced to the merchant via WebSocket.

---

## Amendment Process

This constitution may only be amended during the Hour 0–2 team alignment phase or during a Day-end Retrospective with 100% team consensus. All amendments are recorded in `docs/ADRs/`.

---

*Signed,*  
**Systems Engineering Lead**  
*ADLC Hackathon | Hour 0*
