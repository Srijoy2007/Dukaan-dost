# DukaanDost Business Persona System
## Dynamic Merchant Intelligence & Custom Bot Provisioning

> **Version:** 2.0  
> **Date:** August 2026  
> **Author:** Systems Engineering Lead  
> **Status:** Core Architecture Extension

---

## 1. Philosophy: One Platform, Infinite Businesses

DukaanDost is not a "kirana store app." It is a **business intelligence layer** that adapts its personality, insights, vocabulary, and operational logic to match the merchant's actual business type. A pharmacy needs expiry tracking. A bakery needs pre-order slots. A stationery shop needs bulk pricing. A tailor needs measurement logs.

The Business Persona System is the engine that makes this possible.

---

## 2. Onboarding Questionnaire

During website registration, every merchant answers a **dynamic 8-question assessment**. Their answers generate a `BusinessPersona` object that tailors every subsequent interaction.

### 2.1 The Questionnaire

| # | Question | Options / Input Type | Why It Matters |
|---|----------|---------------------|----------------|
| **Q1** | **What type of business do you run?** | Dropdown: Kirana Store, Pharmacy, Bakery, Stationery, Tailor, Mobile Repair, Vegetable Vendor, General Store, Hardware, Others | Determines catalog defaults, insight types, and compliance rules (e.g., pharmacy needs prescription awareness) |
| **Q2** | **What are your top 5 products/services?** | Multi-select + free text | Seeds the initial catalog. Bakery → Cakes, Bread, Pastries. Pharmacy → Medicines, Syrups, Ointments. |
| **Q3** | **What's your average order value (AOV)?** | Slider: ₹50–₹5,000 | Determines payment reminder tone. High AOV → formal reminders. Low AOV → casual nudges. |
| **Q4** | **Do you offer home delivery?** | Yes/No + radius (km) | If Yes: "Out for Delivery" state is active. If No: "Ready for Pickup" replaces it. |
| **Q5** | **How do you usually talk to customers?** | Radio: Very Formal / Friendly but Professional / Casual / Like Family | Determines bot's conversational tone, emoji usage, and greeting style. |
| **Q6** | **What language do your customers use most?** | Multi-select: Hindi, Hinglish, English, Tamil, Telugu, Marathi, Bengali, Gujarati | Sets primary NLP language model and response templates. |
| **Q7** | **Do you give credit (udhaar) to customers?** | Yes/No + max credit limit | If Yes: Credit tracking, overdue alerts, and "udhaar book" features activate. |
| **Q8** | **What are your typical operating hours?** | Time picker: Open–Close + Days | Determines when proactive nudges fire. A bakery opens at 6 AM; a mobile shop opens at 10 AM. |

### 2.2 Derived Business Persona Object

```typescript
interface BusinessPersona {
  personaId: string;           // UUID
  merchantId: string;          // FK

  // Core Identity
  businessType: BusinessType;  // 'KIRANA' | 'PHARMACY' | 'BAKERY' | ...
  businessTypeDisplay: string; // "Sharma Ji Ki Dukaan" or user-defined

  // Catalog DNA
  defaultCatalog: ProductSeed[];
  unitPreferences: string[];   // ['kg', 'litre', 'piece', 'dozen']

  // Communication Style
  toneProfile: ToneProfile;    // Generated from Q5
  primaryLanguage: string;     // From Q6
  secondaryLanguages: string[];

  // Operational Logic
  deliveryEnabled: boolean;
  deliveryRadiusKm?: number;
  creditEnabled: boolean;
  maxCreditLimit?: number;
  operatingHours: OperatingHours;

  // Insight Preferences
  insightConfig: InsightConfig; // Which reports matter most

  // Generated Artifacts
  systemPrompt: string;        // Dynamic Groq prompt
  quickReplyDefaults: string[];
  greetingTemplate: string;

  createdAt: Date;
  updatedAt: Date;
}

interface ToneProfile {
  formalityLevel: number;      // 0-100 (0=casual, 100=formal)
  emojiDensity: number;        // 0-10 emojis per message
  honorificStyle: string;      // 'bhaiya' | 'sir' | 'ji' | 'anna' | 'dada'
  greetingStyle: string;       // 'Ram Ram' | 'Namaste' | 'Hello' | 'Vanakkam'
}

interface InsightConfig {
  morningBriefing: boolean;
  midDayPulse: boolean;
  eveningSettlement: boolean;
  weeklyVoiceSummary: boolean;
  lowStockAlerts: boolean;
  paymentReminders: boolean;
  expiryAlerts?: boolean;      // Pharmacy-specific
  preOrderAlerts?: boolean;    // Bakery-specific
}
```

---

## 3. Dynamic System Prompt Generation

Instead of a hardcoded *"You are managing a kirana dukaan"*, the system generates a **contextual system prompt** for Groq based on the Business Persona.

### 3.1 Prompt Template Engine

```typescript
// src/services/prompt-engine.service.ts

export class PromptEngineService {
  generateSystemPrompt(persona: BusinessPersona): string {
    const tone = this.describeTone(persona.toneProfile);
    const operations = this.describeOperations(persona);
    const insights = this.describeInsights(persona.insightConfig);
    const catalog = this.describeCatalog(persona.defaultCatalog);

    return `
You are ${persona.businessTypeDisplay}, a ${this.translateBusinessType(persona.businessType)} owner's digital business assistant.

BUSINESS CONTEXT:
- You manage a ${persona.businessType.toLowerCase()} in India.
- Your store ${persona.deliveryEnabled ? 'offers home delivery within ' + persona.deliveryRadiusKm + 'km' : 'is pickup-only'}.
- ${persona.creditEnabled ? 'You extend credit to trusted customers up to ₹' + persona.maxCreditLimit + '.' : 'You operate on cash/UPI only, no credit.'}
- Your primary language is ${persona.primaryLanguage}.

COMMUNICATION STYLE:
${tone}

OPERATIONAL RULES:
${operations}

INSIGHTS YOU PROVIDE:
${insights}

CATALOG YOU KNOW:
${catalog}

BEHAVIORAL CONSTRAINTS:
- NEVER ask the merchant to download an app. Everything happens on WhatsApp.
- If a customer asks for business insights (sales, stock, payments), politely redirect them to the merchant.
- Keep responses under 3 WhatsApp bubbles (max 400 characters each).
- Use the merchant's preferred greeting style: "${persona.greetingTemplate}".
- For unknown queries, use your best judgment but stay within the business context.
    `.trim();
  }

  private describeTone(tone: ToneProfile): string {
    if (tone.formalityLevel < 30) {
      return `- Very casual and friendly. Use "${tone.honorificStyle}" freely.
- Use ${tone.emojiDensity} emojis per message.
- Talk like a neighbor, not a software.`;
    } else if (tone.formalityLevel < 70) {
      return `- Friendly but professional.
- Use "${tone.honorificStyle}" with respect.
- Use ${Math.floor(tone.emojiDensity / 2)} emojis per message.`;
    } else {
      return `- Very formal and respectful.
- Use "${tone.honorificStyle}" or "Sir/Madam".
- Minimal emoji usage (0-1 per message).`;
    }
  }

  private describeOperations(persona: BusinessPersona): string {
    const rules = [];
    if (persona.deliveryEnabled) {
      rules.push('- Track delivery status: Received → Confirmed → Packed → Out for Delivery → Delivered.');
    } else {
      rules.push('- Track pickup status: Received → Confirmed → Packed → Ready for Pickup → Picked Up.');
    }
    if (persona.creditEnabled) {
      rules.push('- Maintain an "udhaar book". Flag customers nearing their credit limit.');
    }
    if (persona.businessType === 'PHARMACY') {
      rules.push('- NEVER sell prescription medicines without valid prescription mention.');
      rules.push('- Track medicine expiry dates. Alert 30 days before expiry.');
    }
    if (persona.businessType === 'BAKERY') {
      rules.push('- Track pre-orders with pickup time slots.');
      rules.push('- Flag perishable items with short shelf life.');
    }
    return rules.join('\n');
  }
}
```

### 3.2 Example Generated Prompts

**Kirana Store (Casual, Hinglish):**
```
You are Ramesh General Store, a kirana store owner's digital business assistant.

BUSINESS CONTEXT:
- You manage a kirana store in India.
- Your store offers home delivery within 2km.
- You extend credit to trusted customers up to ₹2000.
- Your primary language is Hinglish.

COMMUNICATION STYLE:
- Very casual and friendly. Use "bhaiya" freely.
- Use 3 emojis per message.
- Talk like a neighbor, not a software.

OPERATIONAL RULES:
- Track delivery status: Received → Confirmed → Packed → Out for Delivery → Delivered.
- Maintain an "udhaar book". Flag customers nearing their credit limit.

BEHAVIORAL CONSTRAINTS:
- NEVER ask the merchant to download an app...
```

**Pharmacy (Formal, Hindi):**
```
You are Gupta Medical Store, a pharmacy owner's digital business assistant.

BUSINESS CONTEXT:
- You manage a pharmacy in India.
- Your store is pickup-only.
- You operate on cash/UPI only, no credit.
- Your primary language is Hindi.

COMMUNICATION STYLE:
- Very formal and respectful.
- Use "ji" or "Sir/Madam".
- Minimal emoji usage (0-1 per message).

OPERATIONAL RULES:
- Track pickup status: Received → Confirmed → Packed → Ready for Pickup → Picked Up.
- NEVER sell prescription medicines without valid prescription mention.
- Track medicine expiry dates. Alert 30 days before expiry.
```

---

## 4. Merchant vs. Customer Authorization

### 4.1 Identity Resolution

When any message arrives, the system performs **identity resolution** in this order:

```
Incoming Message (from: +919876543210)
        │
        ▼
┌─────────────────────────────┐
│  Step 1: Is this a known    │
│  merchant phone number?     │
│  (merchants.phone == from)  │
└─────────────────────────────┘
        │
    ┌───┴───┐
    ▼       ▼
  YES      NO
    │       │
    ▼       ▼
┌────────┐  ┌─────────────────────────┐
│MERCHANT│  │ Step 2: Is this a known │
│  MODE  │  │ customer of any merchant?│
└───┬────┘  │ (customers.phone == from)│
    │       └─────────────────────────┘
    │               │
    │           ┌───┴───┐
    │           ▼       ▼
    │         YES      NO
    │           │       │
    │           ▼       ▼
    │      ┌────────┐ ┌──────────────┐
    │      │CUSTOMER│ │UNKNOWN USER  │
    │      │  MODE  │ │→ Onboarding  │
    │      └───┬────┘ │  flow or     │
    │          │      │  ignore      │
    │          │      └──────────────┘
    │          │
    ▼          ▼
[Different capabilities]
```

### 4.2 Capability Matrix

| Capability | Merchant | Customer | Unknown |
|------------|----------|----------|---------|
| Place Order | ✅ (on behalf of customer) | ✅ | ❌ |
| View Daily Sales | ✅ | ❌ | ❌ |
| Check Stock | ✅ | ❌ (only "is X available?") | ❌ |
| View Pending Payments | ✅ | ❌ (only "how much do I owe?") | ❌ |
| Update Order Status | ✅ | ❌ | ❌ |
| Broadcast Message | ✅ | ❌ | ❌ |
| Add/Edit Products | ✅ | ❌ | ❌ |
| View Own Order History | ✅ | ✅ | ❌ |
| Make Payment | ✅ | ✅ | ❌ |
| Ask Business Insights | ✅ | ❌ (redirected) | ❌ |

### 4.3 Unauthorized Access Handling

```typescript
// src/middleware/authorization.middleware.ts

export function authorizeCapability(
  requiredRole: 'merchant' | 'customer' | 'any'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as AgentSession;

    if (requiredRole === 'merchant' && !session.isMerchant) {
      const persona = await getPersona(session.merchantId);
      return res.json({
        message: formatUnauthorizedResponse(persona, session.language)
      });
    }

    next();
  };
}

function formatUnauthorizedResponse(persona: BusinessPersona, lang: string): string {
  const responses = {
    hi: `Maaf kijiye, yeh jaankari sirf dukaan malik ke liye hai. Aap apne order ki jaankari pooch sakte hain.`,
    en: `Sorry, this information is only for the store owner. You can ask about your own orders.`,
    hinglish: `Bhaiya, yeh sirf dukaan wale ke liye hai. Aap apna order pooch sakte ho.`
  };
  return responses[lang] || responses.en;
}
```

---

## 5. Custom Bot Provisioning Architecture

### 5.1 The Vision: One Merchant, One Bot

Every registered merchant gets their **own WhatsApp Business identity**:
- **Custom Display Name:** "Sharma Kirana" or "Gupta Medical"
- **Custom Phone Number:** Merchant's own business number
- **Custom Profile:** Business hours, address, catalog
- **Dedicated Webhook:** `https://api.dukaandost.in/webhooks/whatsapp/:merchantId`

### 5.2 Provisioning Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MERCHANT REGISTRATION FLOW                          │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Landing Page Registration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Merchant visits dukaandost.in
    │
    ▼
┌─────────────────────────────┐
│  React Registration Form    │
│  - Business Questionnaire   │
│  - Phone Number Input       │
│  - Store Name               │
└─────────────────────────────┘
    │
    ▼ POST /v1/merchants/register

Step 2: Backend Processing
━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────┐
│  Auth Service               │
│  - Validate phone format    │
│  - Check for duplicates     │
│  - Generate OTP             │
└─────────────────────────────┘
    │
    ▼ SMS via MSG91
Merchant receives OTP
    │
    ▼ POST /v1/merchants/verify-otp
┌─────────────────────────────┐
│  Auth Service               │
│  - Verify OTP               │
│  - Create merchant record   │
│  - Generate JWT             │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  Persona Engine             │
│  - Process questionnaire    │
│  - Generate BusinessPersona │
│  - Create default catalog   │
│  - Generate system prompt   │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  Bot Provisioning Service   │
│  (Async Job Queue)          │
└─────────────────────────────┘

Step 3: WhatsApp Business Provisioning
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────┐
│  Meta Business API          │
│  - Create WABA (if new)     │
│  - Register phone number    │
│  - Verify via OTP/SMS       │
│  - Set display name         │
│  - Configure webhook URL    │
└─────────────────────────────┘
    │
    ▼
Webhook URL: https://api.dukaandost.in/webhooks/whatsapp/{merchantId}
    │
    ▼
┌─────────────────────────────┐
│  Bot Service                │
│  - Registers merchant route │
│  - Loads persona into cache │
│  - Ready to receive msgs    │
└─────────────────────────────┘

Step 4: Merchant Activation
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Merchant receives WhatsApp message:
"Namaste {storeName}! Aapka DukaanDost bot taiyaar hai.
Customers ab aapke is number par order kar sakte hain.
Business insights ke liye 'Hi' bhejein."
```

### 5.3 Technical Implementation

#### Meta WABA Provisioning API

```typescript
// src/services/bot-provisioning.service.ts

export class BotProvisioningService {
  private metaApi: MetaBusinessAPI;
  private webhookBaseUrl: string;

  async provisionMerchantBot(merchant: Merchant, persona: BusinessPersona): Promise<BotConfig> {
    // Step 1: Create or get WABA
    const waba = await this.metaApi.createWABA({
      name: persona.businessTypeDisplay,
      timezone: 'Asia/Kolkata',
      currency: 'INR'
    });

    // Step 2: Register phone number
    const phoneNumber = await this.metaApi.registerPhoneNumber({
      wabaId: waba.id,
      phoneNumber: merchant.phone,
      migrationType: 'UPGRADE' // or 'NEW'
    });

    // Step 3: Verify phone number (Meta sends OTP)
    // This is async - merchant must enter OTP
    await this.metaApi.requestPhoneVerification(phoneNumber.id);

    // Step 4: Set display name
    await this.metaApi.setDisplayName(phoneNumber.id, persona.businessTypeDisplay);

    // Step 5: Configure webhook
    const webhookUrl = `${this.webhookBaseUrl}/webhooks/whatsapp/${merchant.id}`;
    await this.metaApi.configureWebhook(waba.id, {
      url: webhookUrl,
      verifyToken: this.generateVerifyToken(merchant.id),
      fields: ['messages', 'message_deliveries', 'message_reads']
    });

    // Step 6: Subscribe phone number to webhook
    await this.metaApi.subscribePhoneNumber(phoneNumber.id);

    // Step 7: Persist configuration
    const botConfig = await db.botConfigs.create({
      merchantId: merchant.id,
      wabaId: waba.id,
      phoneNumberId: phoneNumber.id,
      displayName: persona.businessTypeDisplay,
      webhookUrl,
      verifyToken: this.generateVerifyToken(merchant.id),
      status: 'PENDING_VERIFICATION', // Until merchant enters Meta OTP
      metaAccessToken: await this.encrypt(waba.accessToken)
    });

    return botConfig;
  }

  async completePhoneVerification(merchantId: string, metaOtp: string): Promise<void> {
    const config = await db.botConfigs.findOne({ where: { merchantId } });
    await this.metaApi.verifyPhoneNumber(config.phoneNumberId, metaOtp);

    await db.botConfigs.update(
      { where: { merchantId } },
      { status: 'ACTIVE', activatedAt: new Date() }
    );

    // Load persona into Redis cache
    await this.cachePersona(merchantId);

    // Send welcome message
    await this.sendWelcomeMessage(merchantId);
  }

  private generateVerifyToken(merchantId: string): string {
    return crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(merchantId)
      .digest('hex')
      .substring(0, 32);
  }
}
```

#### Webhook Routing per Merchant

```typescript
// src/routes/webhook.routes.ts

// Dynamic webhook endpoint per merchant
app.post('/webhooks/whatsapp/:merchantId', async (req, res) => {
  const { merchantId } = req.params;

  // Step 1: Verify webhook signature using merchant-specific token
  const botConfig = await db.botConfigs.findOne({ where: { merchantId } });
  if (!botConfig || botConfig.status !== 'ACTIVE') {
    return res.status(404).json({ error: 'Bot not found or inactive' });
  }

  const isValid = verifyWebhookSignature(req, botConfig.verifyToken);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Step 2: Load merchant persona from cache
  const persona = await redis.get(`persona:${merchantId}`);
  if (!persona) {
    await cachePersona(merchantId); // Lazy load
  }

  // Step 3: Identity resolution
  const from = extractPhoneFromPayload(req.body);
  const isMerchant = (from === botConfig.merchantPhone);

  // Step 4: Route to Agent Runtime with full context
  const session = await sessionStore.getOrCreate(merchantId, from);
  session.isMerchant = isMerchant;
  session.persona = persona;

  await agentRuntime.process(req.body, session);

  res.status(200).send('OK');
});
```

---

## 6. Frontend-Backend Registration Integration

### 6.1 Registration Flow (React Frontend)

```typescript
// web/src/components/RegistrationFlow.tsx

const RegistrationFlow = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>({
    phone: '',
    storeName: '',
    businessType: '',
    topProducts: [],
    aov: 500,
    deliveryEnabled: false,
    deliveryRadius: 0,
    tone: 'friendly',
    primaryLanguage: 'hinglish',
    creditEnabled: false,
    creditLimit: 0,
    operatingHours: { open: '09:00', close: '21:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  });

  const steps = [
    { id: 1, title: 'Phone Verification', component: PhoneStep },
    { id: 2, title: 'Business Profile', component: BusinessProfileStep },
    { id: 3, title: 'Operations', component: OperationsStep },
    { id: 4, title: 'Communication Style', component: CommunicationStep },
    { id: 5, title: 'Review & Activate', component: ReviewStep }
  ];

  const handleSubmit = async () => {
    // Step 1: Register merchant
    const { merchantId, otpRequired } = await api.post('/v1/merchants/register', formData);

    if (otpRequired) {
      // Show OTP input
      const otp = await showOtpModal();
      await api.post('/v1/merchants/verify-otp', { merchantId, otp });
    }

    // Step 2: Trigger bot provisioning (async)
    await api.post('/v1/merchants/provision-bot', { merchantId });

    // Step 3: Show Meta phone verification
    const { metaOtpRequired } = await api.get(`/v1/merchants/bot-status/${merchantId}`);
    if (metaOtpRequired) {
      const metaOtp = await showMetaOtpModal(
        'Meta ne aapke number par OTP bheja hai. Enter karein:'
      );
      await api.post('/v1/merchants/verify-meta-otp', { merchantId, metaOtp });
    }

    // Step 4: Success!
    router.push('/dashboard?activated=true');
  };

  return (
    <div className="registration-flow">
      <ProgressBar current={step} total={steps.length} />
      <AnimatePresence mode="wait">
        <motion.div key={step}>
          {React.createElement(steps[step - 1].component, {
            data: formData,
            onChange: setFormData,
            onNext: () => setStep(s => Math.min(s + 1, steps.length)),
            onBack: () => setStep(s => Math.max(s - 1, 1))
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
```

### 6.2 API Integration Points

```typescript
// Frontend → Backend API Contract

interface RegistrationAPI {
  // Step 1: Initiate registration
  'POST /v1/merchants/register': {
    request: {
      phone: string;                    // +919876543210
      storeName: string;
      businessType: BusinessType;
      topProducts: string[];
      aov: number;
      deliveryEnabled: boolean;
      deliveryRadius?: number;
      tone: 'casual' | 'friendly' | 'formal' | 'very_formal';
      primaryLanguage: string;
      creditEnabled: boolean;
      creditLimit?: number;
      operatingHours: OperatingHours;
    };
    response: {
      merchantId: string;
      otpRequired: boolean;
      message: string;
    };
  };

  // Step 2: Verify OTP
  'POST /v1/merchants/verify-otp': {
    request: { merchantId: string; otp: string };
    response: {
      token: string;
      merchant: Merchant;
      persona: BusinessPersona;
    };
  };

  // Step 3: Trigger bot provisioning
  'POST /v1/merchants/provision-bot': {
    request: { merchantId: string };
    response: {
      provisioningId: string;
      status: 'INITIATED' | 'PENDING_PHONE_VERIFICATION';
      estimatedTime: string;
    };
  };

  // Step 4: Check provisioning status
  'GET /v1/merchants/bot-status/:merchantId': {
    response: {
      status: 'PENDING' | 'PENDING_PHONE_VERIFICATION' | 'ACTIVE' | 'FAILED';
      phoneNumberId?: string;
      displayName?: string;
      metaOtpRequired: boolean;
      webhookUrl?: string;
    };
  };

  // Step 5: Verify Meta OTP
  'POST /v1/merchants/verify-meta-otp': {
    request: { merchantId: string; metaOtp: string };
    response: {
      status: 'ACTIVE';
      botPhoneNumber: string;
      welcomeMessage: string;
    };
  };
}
```

### 6.3 Real-Time Provisioning Updates (WebSocket)

```typescript
// Backend: WebSocket for provisioning progress
io.on('connection', (socket) => {
  socket.on('subscribe:provisioning', (merchantId: string) => {
    socket.join(`provisioning:${merchantId}`);
  });
});

// During provisioning steps:
io.to(`provisioning:${merchantId}`).emit('provisioning:update', {
  step: 'WABA_CREATED',
  message: 'WhatsApp Business account created',
  progress: 30
});

io.to(`provisioning:${merchantId}`).emit('provisioning:update', {
  step: 'PHONE_REGISTERED',
  message: 'Phone number registered. OTP sent by Meta.',
  progress: 60
});

io.to(`provisioning:${merchantId}`).emit('provisioning:complete', {
  step: 'BOT_ACTIVE',
  message: 'Your bot is live!',
  progress: 100,
  botPhoneNumber: '+919876543210'
});
```

---

## 7. Session Store with Persona Context

### 7.1 Enhanced Session Structure

```typescript
// src/services/session-store.service.ts

interface EnhancedSession {
  // Identity
  threadId: string;              // merchantId:customerId:timestamp
  merchantId: string;
  customerId: string;
  customerPhone: string;
  isMerchant: boolean;           // KEY: Determines capability access

  // Business Context (NEW)
  businessPersona: BusinessPersona;  // Full persona object
  systemPrompt: string;          // Pre-generated Groq prompt

  // Conversation State
  turnCount: number;
  lastIntent: IntentType;
  pendingAction?: PendingAction;
  contextBuffer: Message[];      // Last 10 messages

  // Groq Context (NEW)
  groqContext: {
    conversationHistory: GroqMessage[];
    businessMemory: string[];    // Key facts learned about business
    customerRelationships: Map<string, CustomerMemory>;
  };

  // Operational
  createdAt: Date;
  ttl: number;                   // Redis TTL: 24h
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CustomerMemory {
  name: string;
  totalOrders: number;
  totalSpent: number;
  creditBalance: number;
  preferredProducts: string[];
  lastOrderDate: Date;
  notes: string[];               // "Always asks for discount", "Prefers morning delivery"
}
```

### 7.2 Session Lifecycle

```
Message Arrives
    │
    ▼
┌─────────────────────────────┐
│  1. Identity Resolution     │
│     (Merchant vs Customer)  │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  2. Session Lookup (Redis)  │
│     Key: session:{threadId} │
└─────────────────────────────┘
    │
    ├──(Cache Hit)────────────▶ Use existing session
    │
    └──(Cache Miss)───────────▶ Create new session
            │
            ▼
    ┌─────────────────────────────┐
    │  3. Load Business Persona   │
    │     (Redis or DB)           │
    └─────────────────────────────┘
            │
            ▼
    ┌─────────────────────────────┐
    │  4. Initialize Groq Context │
    │     - System prompt         │
    │     - Business memory       │
    │     - Customer history      │
    └─────────────────────────────┘
            │
            ▼
    ┌─────────────────────────────┐
    │  5. Process with Agent      │
    │     or Groq Fallback        │
    └─────────────────────────────┘
```

### 7.3 Groq Fallback with Persona Context

```typescript
// src/services/groq-fallback.service.ts

export class GroqFallbackService {
  private groq: Groq;

  async handleUnknownIntent(
    message: string,
    session: EnhancedSession
  ): Promise<string> {
    // Build context-rich prompt
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: session.systemPrompt  // Dynamic, persona-specific
      },
      {
        role: 'system',
        content: this.buildBusinessMemoryContext(session.groqContext.businessMemory)
      },
      {
        role: 'system',
        content: this.buildCustomerContext(session.groqContext.customerRelationships, session.customerPhone)
      },
      ...session.groqContext.conversationHistory.slice(-5), // Last 5 turns
      {
        role: 'user',
        content: message
      }
    ];

    const response = await this.groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 400,
      top_p: 0.9
    });

    const reply = response.choices[0].message.content;

    // Update conversation history
    session.groqContext.conversationHistory.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: reply, timestamp: new Date() }
    );

    await sessionStore.save(session);

    return reply;
  }

  private buildBusinessMemoryContext(memories: string[]): string {
    if (memories.length === 0) return '';
    return `\n\nBUSINESS MEMORY (facts you've learned):\n${memories.map(m => `- ${m}`).join('\n')}`;
  }

  private buildCustomerContext(
    relationships: Map<string, CustomerMemory>,
    customerPhone: string
  ): string {
    const memory = relationships.get(customerPhone);
    if (!memory) return '';

    return `\n\nCUSTOMER CONTEXT:
- Name: ${memory.name}
- Total Orders: ${memory.totalOrders}
- Total Spent: ₹${memory.totalSpent}
- Credit Balance: ₹${memory.creditBalance}
- Preferred: ${memory.preferredProducts.join(', ')}
- Notes: ${memory.notes.join('; ')}`;
  }
}
```

---

## 8. Business-Type Specific Features

### 8.1 Feature Activation Matrix

| Feature | Kirana | Pharmacy | Bakery | Stationery | Tailor |
|---------|--------|----------|--------|------------|--------|
| Expiry Tracking | ❌ | ✅ | ✅ (shelf life) | ❌ | ❌ |
| Prescription Required | ❌ | ✅ | ❌ | ❌ | ❌ |
| Pre-order Slots | ❌ | ❌ | ✅ | ❌ | ✅ |
| Measurement Log | ❌ | ❌ | ❌ | ❌ | ✅ |
| Bulk Pricing | ✅ | ❌ | ❌ | ✅ | ❌ |
| Udhaar (Credit) | ✅ | ✅ | ❌ | ✅ | ✅ |
| Delivery Radius | ✅ | ✅ | ✅ | ❌ | ❌ |
| Morning Stock Alert | ✅ | ❌ | ✅ | ❌ | ❌ |

### 8.2 Dynamic Insight Templates

```typescript
// Generated based on business type

// Kirana Store
const kiranaInsights = {
  morning: "Good morning! Aaj {{pendingDeliveries}} deliveries hain. {{lowStockItems}} ka stock kam hai.",
  evening: "Aaj ka hisaab: {{orderCount}} orders, ₹{{revenue}}. Cash: ₹{{cash}} | UPI: ₹{{upi}}. {{pendingPayments}} payments pending.",
  weekly: "Is hafte sabse zyada {{topProduct}} bikaa. {{growth}}% growth hua."
};

// Pharmacy
const pharmacyInsights = {
  morning: "Good morning! Aaj {{expiringSoon}} medicines expire hone wali hain. {{prescriptionPending}} prescriptions pending hain.",
  evening: "Aaj {{orderCount}} prescriptions process hui. ₹{{revenue}} ki sale. {{lowStockItems}} medicines reorder karein.",
  expiryAlert: "⚠️ {{medicineName}} {{daysLeft}} din mein expire ho jayegi!"
};

// Bakery
const bakeryInsights = {
  morning: "Good morning! Aaj {{preOrders}} pre-orders hain. {{lowStockItems}} ki fresh batch banani hai.",
  evening: "Aaj {{orderCount}} orders mile. ₹{{revenue}}. {{unsoldItems}} bacha hai — discount dein?"
};
```

---

## 9. Data Model Extensions

### 9.1 New Tables

```sql
-- Business Personas
CREATE TABLE business_personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL UNIQUE REFERENCES merchants(id) ON DELETE CASCADE,
    business_type VARCHAR(50) NOT NULL,
    business_type_display VARCHAR(100) NOT NULL,
    tone_profile JSONB NOT NULL DEFAULT '{}',
    primary_language VARCHAR(10) DEFAULT 'hinglish',
    secondary_languages TEXT[] DEFAULT '{}',
    delivery_enabled BOOLEAN DEFAULT false,
    delivery_radius_km INTEGER,
    credit_enabled BOOLEAN DEFAULT false,
    max_credit_limit DECIMAL(10,2),
    operating_hours JSONB NOT NULL DEFAULT '{}',
    insight_config JSONB NOT NULL DEFAULT '{}',
    system_prompt TEXT NOT NULL,
    greeting_template VARCHAR(200) DEFAULT 'Namaste',
    quick_reply_defaults TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot Configurations (per merchant)
CREATE TABLE bot_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL UNIQUE REFERENCES merchants(id) ON DELETE CASCADE,
    waba_id VARCHAR(100),
    phone_number_id VARCHAR(100),
    display_name VARCHAR(100) NOT NULL,
    bot_phone_number VARCHAR(15) NOT NULL,
    webhook_url TEXT NOT NULL,
    verify_token VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'FAILED')),
    meta_access_token_encrypted TEXT,
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Memories (learned facts for Groq context)
CREATE TABLE business_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    memory_type VARCHAR(50) NOT NULL, -- 'preference', 'rule', 'customer_note', 'event'
    content TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 1.0,
    source VARCHAR(50), -- 'merchant_stated', 'inferred', 'manual'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Memories (per merchant-customer relationship)
CREATE TABLE customer_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    credit_balance DECIMAL(10,2) DEFAULT 0.00,
    preferred_products TEXT[] DEFAULT '{}',
    notes TEXT[] DEFAULT '{}',
    last_order_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(merchant_id, customer_id)
);

-- Provisioning Jobs (async tracking)
CREATE TABLE provisioning_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL, -- 'WABA_CREATION', 'PHONE_REGISTRATION', 'WEBHOOK_CONFIG'
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    payload JSONB DEFAULT '{}',
    result JSONB DEFAULT '{}',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

---

## 10. Implementation Roadmap

### Phase 1: Hackathon MVP (72 Hours)
- [x] Hardcoded Hinglish parser (`nlpservice.js`)
- [x] Groq fallback with basic system prompt (`groqFallbackservice.js`)
- [x] Session store with context (`sessionstore.js`)
- [x] NLP hybrid router (`nlphybrid.js`)
- [ ] **NEW:** Dynamic persona questionnaire (frontend)
- [ ] **NEW:** Persona engine backend
- [ ] **NEW:** Merchant/customer authorization
- [ ] **NEW:** Custom bot provisioning (basic)

### Phase 2: Post-Hackathon Polish
- [ ] Full Meta WABA provisioning automation
- [ ] Regional language support (Bhashini integration)
- [ ] Advanced business-type features (expiry tracking, pre-orders)
- [ ] ML-based intent classification (replaces regex)
- [ ] Business memory learning (auto-extract facts from conversations)

---

*End of Business Persona System Document*
