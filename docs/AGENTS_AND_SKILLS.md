# DukaanDost Agents & Skills Registry
## Deploy or Die Hackathon | Agent Engineering & Code Quality (30%)

> **Version:** 2.0  
> **Date:** August 2026  
> **Compliance:** Constitution Article V  
> **Location:** Committed to repo root (`AGENTS_AND_SKILLS.md`)

---

## 1. Custom Agent: `DukaanBot Business Agent`

### 1.1 Agent Manifest

| Attribute | Specification |
|-----------|---------------|
| **Agent ID** | `agent-dukaanbot-v1` |
| **Name** | DukaanBot Business Agent |
| **Role** | Autonomous business operations orchestrator for kirana store merchants |
| **Autonomy Level** | Semi-autonomous (human-in-the-loop for high-value transactions) |
| **Orchestration Model** | ReAct (Reasoning + Acting) with tool-calling |
| **Context Window** | 4,096 tokens (multi-turn conversational memory) |
| **State Persistence** | Redis session store per `merchant_id:customer_id` thread |

### 1.2 Core Responsibilities

1. **Intent Classification:** Determines whether an incoming message is an *order*, *query*, *command*, or *chit-chat*.
2. **Entity Extraction:** Delegates to `HinglishOrderParserSkill` for structured data extraction.
3. **Business Logic Execution:** Invokes tools for inventory checks, order creation, payment generation, and report queries.
4. **Proactive Nudging:** Schedules and sends morning briefings, mid-day pulses, and evening settlements.
5. **State Machine Enforcement:** Ensures every order transitions through valid states (`received` → `confirmed` → `packed` → `out_for_delivery` → `delivered`).

### 1.3 Agent Tools (Registered Capabilities)

```typescript
interface AgentTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  handler: (input: unknown) => Promise<unknown>;
}
```

| Tool Name | Description | Handler Location |
|-----------|-------------|------------------|
| `create_order` | Creates an order from parsed entities, validates stock, deducts inventory | `services/order.service.ts` |
| `check_stock` | Queries inventory levels and flags low-stock items | `services/inventory.service.ts` |
| `generate_upi_qr` | Calls Razorpay to create a payment link + QR code | `services/payment.service.ts` |
| `get_daily_sales` | Aggregates today's orders, revenue, cash/UPI split | `services/analytics.service.ts` |
| `get_pending_payments` | Lists overdue payments with customer details | `services/payment.service.ts` |
| `send_whatsapp_message` | Sends templated or free-form messages via Meta API | `services/notification.service.ts` |
| `broadcast_message` | Sends segmented broadcast to customer lists | `services/crm.service.ts` |
| `update_order_status` | Transitions order state with validation | `services/order.service.ts` |

### 1.4 Agent Memory & State

```typescript
interface AgentSession {
  threadId: string;           // merchant_id:customer_id:thread_timestamp
  merchantId: string;
  customerId: string;
  turnCount: number;
  lastIntent: IntentType;
  pendingAction?: PendingAction;  // e.g., awaiting_payment_confirmation
  contextBuffer: Message[];   // Last 10 messages for context
  createdAt: Date;
  ttl: number;                // Redis TTL: 24 hours
}
```

### 1.5 Decision Logic Flow

```
Incoming WhatsApp Message
        │
        ▼
┌─────────────────────┐
│  Intent Classifier  │──(chit-chat)──▶ Friendly Response
│  (Regex + Keywords) │
└─────────────────────┘
        │
    (order/query/command)
        │
        ▼
┌─────────────────────────────┐
│  HinglishOrderParserSkill   │──(parse failure)──▶ Clarifying Question
│  (Entity Extraction)        │
└─────────────────────────────┘
        │
    (structured entities)
        │
        ▼
┌─────────────────────────────┐
│   Business Logic Router     │
│  (ReAct Reasoning Loop)     │
└─────────────────────────────┘
        │
    ┌───┴───┬─────────┬──────────┐
    ▼       ▼         ▼          ▼
 create  check    generate   get_daily
 order   stock      upi       sales
    │       │         │          │
    └───────┴─────────┴──────────┘
                │
                ▼
        ┌──────────────┐
        │  Response    │
        │  Formatter   │──▶ WhatsApp Outbound
        │ (Hindi/Eng)  │
        └──────────────┘
```

### 1.6 Quality Gates

- **Gate 1:** Intent classification confidence > 0.75. Below threshold → fallback to human merchant confirmation.
- **Gate 2:** Stock validation before order creation. Negative stock → rejection with alternative suggestion.
- **Gate 3:** Payment amount sanity check. Orders > ₹10,000 require merchant voice confirmation.
- **Gate 4:** All tool outputs are logged to `agent_audit_log` table for traceability.

---

## 2. Custom Skill: `HinglishOrderParserSkill`

### 2.1 Skill Manifest

| Attribute | Specification |
|-----------|---------------|
| **Skill ID** | `skill-hinglish-parser-v1` |
| **Name** | Hinglish Order Parser Skill |
| **Type** | Natural Language Understanding (NLU) |
| **Input Modality** | Text, Transcribed Voice (Hindi/English/Hinglish) |
| **Output Modality** | Structured JSON (intent + entities) |
| **Latency SLA** | < 500ms for text, < 1.5s for voice (transcription included) |

### 2.2 Purpose

Extracts commercial intent and product entities from free-form conversational messages sent by customers and merchants on WhatsApp. Handles code-mixed Hindi-English (Hinglish), colloquial variations, and implicit quantities.

### 2.3 Input Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "HinglishParserInput",
  "type": "object",
  "required": ["message", "source", "merchantId"],
  "properties": {
    "message": { "type": "string", "maxLength": 4096 },
    "source": { "type": "string", "enum": ["text", "voice_transcription"] },
    "merchantId": { "type": "string", "format": "uuid" },
    "languageHint": { "type": "string", "enum": ["hi", "en", "hinglish"], "default": "hinglish" }
  }
}
```

### 2.4 Output Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "HinglishParserOutput",
  "type": "object",
  "required": ["intent", "entities", "confidence", "languageDetected"],
  "properties": {
    "intent": {
      "type": "string",
      "enum": ["place_order", "check_stock", "query_sales", "pending_payments", "general_chat", "unknown"]
    },
    "entities": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "product": { "type": "string" },
          "quantity": { "type": "number" },
          "unit": { "type": "string", "enum": ["kg", "g", "litre", "ml", "dozen", "piece", "pack"] },
          "normalizedProduct": { "type": "string" }
        }
      }
    },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "languageDetected": { "type": "string", "enum": ["hi", "en", "hinglish"] },
    "clarifyingQuestion": { "type": "string" }
  }
}
```

### 2.5 Implementation Architecture

```typescript
// src/skills/HinglishOrderParserSkill.ts

export class HinglishOrderParserSkill {
  private keywordDictionary: Map<string, string[]>; // normalizedProduct -> aliases
  private intentPatterns: RegExp[];
  private unitPatterns: RegExp[];

  constructor(merchantCatalog: Product[]) {
    this.buildDictionary(merchantCatalog);
    this.compilePatterns();
  }

  async parse(input: ParserInput): Promise<ParserOutput> {
    // Step 1: Language Detection (simple n-gram + script detection)
    const lang = this.detectLanguage(input.message);

    // Step 2: Pre-processing (normalize Unicode, expand contractions)
    const normalized = this.normalize(input.message, lang);

    // Step 3: Intent Classification (regex + keyword scoring)
    const intent = this.classifyIntent(normalized);

    // Step 4: Entity Extraction (regex groups + fuzzy matching against catalog)
    const entities = this.extractEntities(normalized, input.merchantId);

    // Step 5: Confidence Scoring
    const confidence = this.calculateConfidence(intent, entities, normalized);

    // Step 6: Fallback Handling
    if (confidence < 0.6) {
      return this.buildClarification(intent, entities, lang);
    }

    return { intent, entities, confidence, languageDetected: lang };
  }

  private extractEntities(message: string, merchantId: string): Entity[] {
    // Pattern: [quantity][unit][product][intent_verb]
    // Example: "2kg atta bhej do" → qty:2, unit:kg, product:atta
    const pattern = /(\d+(?:\.\d+)?)\s*(kg|g|litre|l|ml|dozen|pc|pack)?\s*([\w\s]+?)\s*(bhej do|chahiye|dena|order|bhejo)/gi;
    // ... implementation with fuzzy product matching against merchant catalog
  }
}
```

### 2.6 Pattern Examples

| Input Message | Detected Intent | Extracted Entities | Confidence |
|---------------|-----------------|-------------------|------------|
| *"Bhaiya 2kg atta bhej do"* | `place_order` | `[{product:"atta", qty:2, unit:"kg"}]` | 0.94 |
| *"Aaj kitna bikaa?"* | `query_sales` | `[]` | 0.91 |
| *"Stock check karo"* | `check_stock` | `[]` | 0.89 |
| *"Kaun payment nahi kiya?"* | `pending_payments` | `[]` | 0.88 |
| *"1 litre oil aur 500g dal"* | `place_order` | `[{oil,1,L}, {dal,0.5,kg}]` | 0.92 |
| *"Kuch samajh nahi aaya"* | `unknown` | `[]` | 0.45 → Clarify |

### 2.7 Test Suite

```typescript
// tests/skills/HinglishOrderParserSkill.test.ts
describe('HinglishOrderParserSkill', () => {
  const skill = new HinglishOrderParserSkill(mockCatalog);

  it('should parse simple Hindi order', async () => {
    const result = await skill.parse({ message: '2kg atta bhej do', source: 'text', merchantId: '123' });
    expect(result.intent).toBe('place_order');
    expect(result.entities[0]).toMatchObject({ product: 'atta', quantity: 2, unit: 'kg' });
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('should parse code-mixed order', async () => {
    const result = await skill.parse({ message: '1 litre oil chahiye', source: 'text', merchantId: '123' });
    expect(result.intent).toBe('place_order');
    expect(result.entities[0].normalizedProduct).toBe('oil');
  });

  it('should return clarification for ambiguous input', async () => {
    const result = await skill.parse({ message: 'kuch bhejo', source: 'text', merchantId: '123' });
    expect(result.confidence).toBeLessThan(0.6);
    expect(result.clarifyingQuestion).toBeDefined();
  });
});
```

---

## 3. Custom Skill: `UPIPaymentOrchestratorSkill`

### 3.1 Skill Manifest

| Attribute | Specification |
|-----------|---------------|
| **Skill ID** | `skill-upi-payment-v1` |
| **Name** | UPI Payment Orchestrator Skill |
| **Type** | Payment Integration |
| **Input Modality** | Order object + Merchant credentials |
| **Output Modality** | Payment link + QR code + Deep link |
| **Latency SLA** | < 800ms (Razorpay API call) |

### 3.2 Purpose

Generates UPI-compatible payment instruments for every order and handles the complete payment lifecycle: creation → notification → webhook reconciliation → status update.

### 3.3 State Machine

```
[PAYMENT_INITIATED]
      │
      ▼
[PAYMENT_LINK_GENERATED] ──(timeout 30min)──▶ [PAYMENT_EXPIRED]
      │
      ▼
[AWAITING_PAYMENT] ◄── Customer scans QR / clicks deep link
      │
      ├──(webhook: paid)────▶ [PAYMENT_SUCCESS] ──▶ Update order status
      │
      └──(webhook: failed)──▶ [PAYMENT_FAILED] ──▶ Retry flow
```

### 3.4 Implementation

```typescript
// src/skills/UPIPaymentOrchestratorSkill.ts

export class UPIPaymentOrchestratorSkill {
  private razorpay: Razorpay;

  async createPayment(order: Order, merchant: Merchant): Promise<PaymentInstrument> {
    const razorpayOrder = await this.razorpay.orders.create({
      amount: order.totalAmount * 100, // paise
      currency: 'INR',
      receipt: `order_${order.id}`,
      notes: {
        merchantId: merchant.id,
        customerId: order.customerId,
        orderId: order.id
      }
    });

    const upiIntent = await this.razorpay.paymentLink.create({
      amount: order.totalAmount * 100,
      currency: 'INR',
      accept_partial: false,
      description: `Payment for Order #${order.id} — ${merchant.storeName}`,
      customer: { contact: order.customerPhone },
      notify: { sms: false, email: false, whatsapp: true },
      reminder_enable: true,
      callback_url: `${process.env.WEBHOOK_BASE_URL}/webhooks/razorpay`,
      callback_method: 'get'
    });

    return {
      paymentLink: upiIntent.short_url,
      qrCodeUrl: upiIntent.qr_code_url,
      upiDeepLink: `upi://pay?pa=${merchant.upiId}&pn=${merchant.storeName}&am=${order.totalAmount}&cu=INR&tn=Order${order.id}`,
      razorpayOrderId: razorpayOrder.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    };
  }

  async reconcileWebhook(payload: RazorpayWebhookPayload): Promise<void> {
    const payment = await this.validateSignature(payload);
    await db.payments.update({
      where: { razorpayOrderId: payment.order_id },
      data: { status: payment.status, utr: payment.acquirer_data?.upi_transaction_id }
    });
    await db.orders.update({
      where: { id: payment.notes.orderId },
      data: { paymentStatus: payment.status === 'captured' ? 'paid' : 'failed' }
    });
    // Trigger notification skill
  }
}
```

### 3.5 Idempotency & Safety

- All Razorpay calls include `Idempotency-Key` header derived from `order.id + timestamp_day`.
- Webhook handlers verify Razorpay signature using HMAC-SHA256 before processing.
- Duplicate webhook deliveries are detected via `razorpay_event_id` uniqueness constraint.

---

## 4. Persona-Aware Agent Runtime

### 4.1 Dynamic Context Injection

The `DukaanBot Business Agent` now loads a **Business Persona** at session initialization. This persona determines:

1. **System Prompt for Groq:** Generated dynamically from merchant's business type, tone, and operational rules.
2. **Capability Enforcement:** `isMerchant` flag gates access to business insights.
3. **Response Templates:** Tone-aware Hindi/Hinglish/English templates with appropriate emoji density and honorifics.
4. **Operational Logic:** Delivery vs pickup workflows, credit tracking, expiry alerts, etc.

### 4.2 Identity Resolution in Agent Runtime

```typescript
// src/agents/DukaanBotAgent.ts

export class DukaanBotAgent {
  async processMessage(payload: WhatsAppPayload, session: EnhancedSession): Promise<void> {
    // Step 1: Identity Resolution
    const from = payload.messages[0].from;
    session.isMerchant = (from === session.merchantPhone);

    // Step 2: Load Persona (if not cached)
    if (!session.businessPersona) {
      session.businessPersona = await this.personaService.getByMerchantId(session.merchantId);
      session.systemPrompt = session.businessPersona.systemPrompt;
    }

    // Step 3: Intent Classification
    const parseResult = await this.skills.hinglishParser.parse({
      message: payload.messages[0].text.body,
      source: 'text',
      merchantId: session.merchantId
    });

    // Step 4: Capability Check
    if (this.isBusinessInsight(parseResult.intent) && !session.isMerchant) {
      await this.sendUnauthorizedResponse(session);
      return;
    }

    // Step 5: Route to appropriate handler
    if (parseResult.confidence > 0.75) {
      await this.handleStructuredIntent(parseResult, session);
    } else {
      // Fallback to Groq with full persona context
      await this.handleGroqFallback(payload.messages[0].text.body, session);
    }
  }

  private isBusinessInsight(intent: IntentType): boolean {
    return ['query_sales', 'check_stock', 'pending_payments'].includes(intent);
  }

  private async sendUnauthorizedResponse(session: EnhancedSession): Promise<void> {
    const persona = session.businessPersona;
    const responses = {
      hi: `Maaf kijiye, yeh jaankari sirf dukaan malik ke liye hai.`,
      en: `Sorry, this information is only for the store owner.`,
      hinglish: `Bhaiya, yeh sirf dukaan wale ke liye hai. Aap apna order pooch sakte ho.`
    };

    const msg = responses[persona.primaryLanguage] || responses.en;
    await this.tools.send_whatsapp_message.execute({
      to: session.customerPhone,
      text: msg
    });
  }

  private async handleGroqFallback(message: string, session: EnhancedSession): Promise<void> {
    const groqService = new GroqFallbackService();
    const reply = await groqService.handleUnknownIntent(message, session);

    await this.tools.send_whatsapp_message.execute({
      to: session.customerPhone,
      text: reply
    });
  }
}
```

### 4.3 Dynamic Prompt Generation Skill

```typescript
// src/skills/PromptEngineSkill.ts

export class PromptEngineSkill {
  generateSystemPrompt(persona: BusinessPersona): string {
    const parts = [
      this.buildIdentity(persona),
      this.buildBusinessContext(persona),
      this.buildCommunicationStyle(persona),
      this.buildOperationalRules(persona),
      this.buildBehavioralConstraints(persona)
    ];

    return parts.join('\n\n');
  }

  private buildIdentity(persona: BusinessPersona): string {
    return `You are ${persona.businessTypeDisplay}, a ${persona.businessType.toLowerCase()} owner's digital business assistant.`;
  }

  private buildBusinessContext(persona: BusinessPersona): string {
    const lines = [
      `BUSINESS CONTEXT:`,
      `- You manage a ${persona.businessType.toLowerCase()} in India.`,
      `- Your store ${persona.deliveryEnabled ? 'offers home delivery within ' + persona.deliveryRadiusKm + 'km' : 'is pickup-only'}.`,
      `- ${persona.creditEnabled ? 'You extend credit to trusted customers up to ₹' + persona.maxCreditLimit + '.' : 'You operate on cash/UPI only, no credit.'}`,
      `- Your primary language is ${persona.primaryLanguage}.`
    ];
    return lines.join('\n');
  }

  private buildCommunicationStyle(persona: BusinessPersona): string {
    const tone = persona.toneProfile;
    let style = 'COMMUNICATION STYLE:\n';

    if (tone.formalityLevel < 30) {
      style += `- Very casual and friendly. Use "${tone.honorificStyle}" freely.\n`;
      style += `- Use ${tone.emojiDensity} emojis per message.\n`;
      style += `- Talk like a neighbor, not a software.`;
    } else if (tone.formalityLevel < 70) {
      style += `- Friendly but professional.\n`;
      style += `- Use "${tone.honorificStyle}" with respect.\n`;
      style += `- Use ${Math.floor(tone.emojiDensity / 2)} emojis per message.`;
    } else {
      style += `- Very formal and respectful.\n`;
      style += `- Use "${tone.honorificStyle}" or "Sir/Madam".\n`;
      style += `- Minimal emoji usage (0-1 per message).`;
    }

    return style;
  }

  private buildBehavioralConstraints(persona: BusinessPersona): string {
    return `BEHAVIORAL CONSTRAINTS:
- NEVER ask the merchant to download an app. Everything happens on WhatsApp.
- If a customer asks for business insights (sales, stock, payments), politely redirect them to the merchant.
- Keep responses under 3 WhatsApp bubbles (max 400 characters each).
- Use the merchant's preferred greeting style: "${persona.greetingTemplate}".
- For unknown queries, use your best judgment but stay within the business context.`;
  }
}
```

---

## 4. Agent-Skill Interaction Contract

```typescript
// When DukaanBot receives an order intent:
const parseResult = await skills.hinglishParser.parse({ message, merchantId });
if (parseResult.confidence < 0.75) {
  return bot.sendClarification(parseResult.clarifyingQuestion);
}

const order = await tools.create_order.execute({ entities: parseResult.entities, merchantId });
const payment = await skills.upiPayment.createPayment(order, merchant);

await tools.send_whatsapp_message.execute({
  to: customerPhone,
  template: 'ORDER_CONFIRMATION',
  params: {
    orderId: order.id,
    total: order.totalAmount,
    paymentLink: payment.paymentLink,
    qrCode: payment.qrCodeUrl
  }
});
```

---

## 5. Versioning & Evolution

| Version | Date | Change | Author |
|---------|------|--------|--------|
| v1.0.0 | Aug 2026 | Initial hackathon release | Systems Eng |
| v1.1.0 | (Post-Hack) | Bhashini integration for regional languages | TBD |
| v1.2.0 | (Post-Hack) | ML-based intent classifier (replaces regex) | TBD |

---

*End of Agents & Skills Registry*
