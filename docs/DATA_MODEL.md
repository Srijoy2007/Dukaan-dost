# DukaanDost Data Model
## Deploy or Die Hackathon | Specification and Architecture (25%)

> **Version:** 2.0  
> **Date:** August 2026  
> **DBMS:** PostgreSQL 15 (Primary), MongoDB 6 (Logs/Catalog), Redis 7 (Cache)

---

## 1. Entity Relationship Overview

```
merchants ||--o{ customers : serves
merchants ||--o{ products : stocks
merchants ||--o{ orders : receives
customers ||--o{ orders : places
orders ||--|{ order_items : contains
products ||--o{ order_items : ordered_as
orders ||--o| payments : settled_by
merchants ||--o{ conversations : has
```

---

## 2. PostgreSQL Schema (DDL)

### 2.1 Merchants

```sql
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) NOT NULL UNIQUE,
    store_name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100),
    upi_id VARCHAR(50),
    language_preference VARCHAR(10) DEFAULT 'hinglish',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_merchants_phone ON merchants(phone);
CREATE INDEX idx_merchants_active ON merchants(is_active) WHERE is_active = true;
```

### 2.2 Customers

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    phone VARCHAR(15) NOT NULL,
    name VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    last_order_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(merchant_id, phone)
);

CREATE INDEX idx_customers_merchant ON customers(merchant_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_tags ON customers USING GIN(tags);
```

### 2.3 Products

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    normalized_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'piece',
    stock_quantity DECIMAL(10,2) DEFAULT 0,
    low_stock_threshold DECIMAL(10,2) DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_merchant ON products(merchant_id);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_low_stock ON products(merchant_id, stock_quantity) 
    WHERE stock_quantity <= low_stock_threshold;
```

### 2.4 Orders

```sql
CREATE TYPE order_status AS ENUM (
    'RECEIVED', 'CONFIRMED', 'PACKED', 
    'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'PAID'
);

CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status order_status DEFAULT 'RECEIVED',
    payment_status payment_status DEFAULT 'PENDING',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cash_amount DECIMAL(12,2) DEFAULT 0.00,
    upi_amount DECIMAL(12,2) DEFAULT 0.00,
    payment_method VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_merchant ON orders(merchant_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_merchant_date ON orders(merchant_id, created_at);
```

### 2.5 Order Items

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

### 2.6 Payments

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL,
    status payment_status DEFAULT 'PENDING',
    utr VARCHAR(50),
    failure_reason TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_razorpay ON payments(razorpay_order_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 2.7 Order Events (Event Sourcing)

```sql
CREATE TABLE order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    actor VARCHAR(50) NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_events_order ON order_events(order_id);
CREATE INDEX idx_order_events_created ON order_events(created_at);
```

### 2.8 Conversations

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    message_type VARCHAR(20) NOT NULL DEFAULT 'text',
    content TEXT NOT NULL,
    intent VARCHAR(50),
    entities JSONB DEFAULT '{}',
    confidence DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_merchant ON conversations(merchant_id);
CREATE INDEX idx_conversations_created ON conversations(created_at);
```

### 2.9 Agent Audit Log

```sql
CREATE TABLE agent_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    tool_input JSONB,
    tool_output JSONB,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_merchant ON agent_audit_log(merchant_id);
CREATE INDEX idx_audit_session ON agent_audit_log(session_id);
CREATE INDEX idx_audit_created ON agent_audit_log(created_at);
```

### 2.10 Business Personas

```sql
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

CREATE INDEX idx_business_personas_merchant ON business_personas(merchant_id);
CREATE INDEX idx_business_personas_type ON business_personas(business_type);
```

### 2.11 Bot Configurations

```sql
CREATE TABLE bot_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL UNIQUE REFERENCES merchants(id) ON DELETE CASCADE,
    waba_id VARCHAR(100),
    phone_number_id VARCHAR(100),
    display_name VARCHAR(100) NOT NULL,
    bot_phone_number VARCHAR(15) NOT NULL,
    webhook_url TEXT NOT NULL,
    verify_token VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'FAILED')),
    meta_access_token_encrypted TEXT,
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bot_configs_merchant ON bot_configs(merchant_id);
CREATE INDEX idx_bot_configs_status ON bot_configs(status);
CREATE INDEX idx_bot_configs_phone ON bot_configs(bot_phone_number);
```

### 2.12 Business Memories

```sql
CREATE TABLE business_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    memory_type VARCHAR(50) NOT NULL, -- 'preference', 'rule', 'customer_note', 'event'
    content TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 1.0,
    source VARCHAR(50), -- 'merchant_stated', 'inferred', 'manual'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_business_memories_merchant ON business_memories(merchant_id);
CREATE INDEX idx_business_memories_type ON business_memories(memory_type);
```

### 2.13 Customer Memories

```sql
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

CREATE INDEX idx_customer_memories_merchant ON customer_memories(merchant_id);
CREATE INDEX idx_customer_memories_customer ON customer_memories(customer_id);
```

### 2.14 Provisioning Jobs

```sql
CREATE TABLE provisioning_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL, -- 'WABA_CREATION', 'PHONE_REGISTRATION', 'WEBHOOK_CONFIG'
    status VARCHAR(20) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    payload JSONB DEFAULT '{}',
    result JSONB DEFAULT '{}',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_provisioning_jobs_merchant ON provisioning_jobs(merchant_id);
CREATE INDEX idx_provisioning_jobs_status ON provisioning_jobs(status);
```

---

---

## 3. Materialized Views (Analytics)

### 3.1 Daily Sales Summary

```sql
CREATE MATERIALIZED VIEW mv_daily_sales AS
SELECT 
    merchant_id,
    DATE(created_at) as sale_date,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue,
    SUM(cash_amount) as cash_revenue,
    SUM(upi_amount) as upi_revenue,
    COUNT(*) FILTER (WHERE payment_status = 'PENDING') as pending_payments
FROM orders
WHERE status != 'CANCELLED'
GROUP BY merchant_id, DATE(created_at);

CREATE UNIQUE INDEX idx_mv_daily_sales ON mv_daily_sales(merchant_id, sale_date);
```

**Refresh Strategy:** Every hour via cron job or trigger on order creation.

### 3.2 Low Stock Alert View

```sql
CREATE MATERIALIZED VIEW mv_low_stock AS
SELECT 
    merchant_id,
    id as product_id,
    name,
    stock_quantity,
    low_stock_threshold,
    (low_stock_threshold - stock_quantity) as deficit
FROM products
WHERE stock_quantity <= low_stock_threshold
AND is_active = true;

CREATE INDEX idx_mv_low_stock_merchant ON mv_low_stock(merchant_id);
```

---

## 4. MongoDB Collections (Schema-Lite)

### 4.1 Product Catalogs (Flexible Schema)

```javascript
// db.catalogs
{
  _id: ObjectId,
  merchant_id: UUID,
  categories: [
    {
      name: "Grains",
      products: [
        { name: "Atta", variants: [{ weight: "5kg", price: 245 }, { weight: "10kg", price: 480 }] }
      ]
    }
  ],
  updated_at: ISODate
}
```

### 4.2 Voice Note Transcriptions

```javascript
// db.voice_notes
{
  _id: ObjectId,
  merchant_id: UUID,
  audio_url: "s3://dukaan-voice/abc123.ogg",
  transcription: "2kg atta bhej do",
  confidence: 0.94,
  language: "hi-IN",
  duration_seconds: 3.2,
  created_at: ISODate
}
```

### 4.3 Broadcast Message Logs

```javascript
// db.broadcasts
{
  _id: ObjectId,
  merchant_id: UUID,
  segment: { tags: ["regular", "credit"] },
  message: "Diwali offer! 10% off on all items.",
  sent_count: 156,
  delivered_count: 149,
  read_count: 98,
  created_at: ISODate
}
```

---

## 5. Redis Key Patterns

```
# Session State
session:{merchant_id}:{customer_id} → JSON (TTL: 24h)

# Rate Limiting
ratelimit:meta_api:{merchant_id} → Counter (TTL: 1min)
ratelimit:otp:{phone} → Counter (TTL: 1hour)

# Cache
merchant:{merchant_id}:catalog → JSON (TTL: 5min)
merchant:{merchant_id}:daily_sales:{YYYY-MM-DD} → JSON (TTL: 1hour)
merchant:{merchant_id}:stock_snapshot → JSON (TTL: 2min)

# Job Queues
queue:whatsapp_outbound → List
queue:payment_reconcile → List
queue:analytics_refresh → List

# Locks
lock:order_create:{merchant_id}:{customer_id} → String (TTL: 10s)
```

---

## 6. Data Flow Diagrams

### 6.1 Order Creation Flow

```
Customer Message
    │
    ▼
[Bot Service] ──Parse──▶ [HinglishParserSkill]
    │
    ▼
[Bot Service] ──Validate──▶ [Catalog Service] (stock check)
    │
    ▼
[Bot Service] ──Create──▶ [Order Service]
    │                           │
    │                           ▼
    │                   [PostgreSQL: orders + order_items]
    │                           │
    │                           ▼
    │                   [PostgreSQL: order_events] (ORDER_RECEIVED)
    │                           │
    ▼                           ▼
[Bot Service] ◄──Confirm── [Order Service]
    │
    ▼
[Bot Service] ──Generate──▶ [Payment Service] (Razorpay)
    │                           │
    │                           ▼
    │                   [PostgreSQL: payments]
    │                           │
    ▼                           ▼
[Bot Service] ◄──Link── [Payment Service]
    │
    ▼
[WhatsApp API] ──Send──▶ Customer (Confirmation + QR)
```

### 6.2 Daily Sales Query Flow

```
Merchant: "Aaj kitna bikaa?"
    │
    ▼
[Bot Service] ──Check Cache──▶ [Redis: daily_sales:{date}]
    │                               │
    │ (cache miss)                  │ (cache hit)
    ▼                               ▼
[Analytics Service] ◄──────── [Bot Service]
    │
    ▼
[PostgreSQL: mv_daily_sales] OR [orders table aggregation]
    │
    ▼
[Analytics Service] ──Cache──▶ [Redis: daily_sales:{date}]
    │
    ▼
[Bot Service] ──Format──▶ [Response Assembler]
    │
    ▼
[WhatsApp API] ──Send──▶ Merchant
```

---

## 7. Migration Strategy

### 7.1 Hackathon Migrations (Sequelize)

```javascript
// migrations/001_initial_schema.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('merchants', { /* ... */ });
    await queryInterface.createTable('customers', { /* ... */ });
    await queryInterface.createTable('products', { /* ... */ });
    await queryInterface.createTable('orders', { /* ... */ });
    await queryInterface.createTable('order_items', { /* ... */ });
    await queryInterface.createTable('payments', { /* ... */ });
    await queryInterface.createTable('order_events', { /* ... */ });
    await queryInterface.createTable('conversations', { /* ... */ });
    await queryInterface.createTable('agent_audit_log', { /* ... */ });
  },
  down: async (queryInterface, Sequelize) => {
    // Reverse order for clean rollback
    await queryInterface.dropTable('agent_audit_log');
    await queryInterface.dropTable('conversations');
    await queryInterface.dropTable('order_events');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('customers');
    await queryInterface.dropTable('merchants');
  }
};
```

### 7.2 Seed Data (Demo-Ready)

```javascript
// seeders/001_demo_data.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const merchant = await queryInterface.bulkInsert('merchants', [{
      phone: '+919876543210',
      store_name: 'Ramesh General Store',
      owner_name: 'Ramesh Kumar',
      upi_id: 'ramesh@upi',
      language_preference: 'hinglish'
    }], { returning: true });

    await queryInterface.bulkInsert('products', [
      { merchant_id: merchant[0].id, name: 'Atta', normalized_name: 'atta', price: 45, unit: 'kg', stock_quantity: 8, low_stock_threshold: 10 },
      { merchant_id: merchant[0].id, name: 'Oil', normalized_name: 'oil', price: 120, unit: 'litre', stock_quantity: 15, low_stock_threshold: 5 },
      { merchant_id: merchant[0].id, name: 'Sugar', normalized_name: 'sugar', price: 42, unit: 'kg', stock_quantity: 22, low_stock_threshold: 10 },
      { merchant_id: merchant[0].id, name: 'Dal', normalized_name: 'dal', price: 95, unit: 'kg', stock_quantity: 45, low_stock_threshold: 10 },
      { merchant_id: merchant[0].id, name: 'Rice', normalized_name: 'rice', price: 55, unit: 'kg', stock_quantity: 30, low_stock_threshold: 15 }
    ]);

    // NEW: Business Persona for demo merchant
    await queryInterface.bulkInsert('business_personas', [{
      merchant_id: merchant[0].id,
      business_type: 'KIRANA',
      business_type_display: 'Ramesh General Store',
      tone_profile: JSON.stringify({
        formalityLevel: 40,
        emojiDensity: 3,
        honorificStyle: 'bhaiya',
        greetingStyle: 'Namaste'
      }),
      primary_language: 'hinglish',
      secondary_languages: ['hi', 'en'],
      delivery_enabled: true,
      delivery_radius_km: 2,
      credit_enabled: true,
      max_credit_limit: 2000,
      operating_hours: JSON.stringify({
        open: '08:00',
        close: '21:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      }),
      insight_config: JSON.stringify({
        morningBriefing: true,
        midDayPulse: true,
        eveningSettlement: true,
        weeklyVoiceSummary: true,
        lowStockAlerts: true,
        paymentReminders: true
      }),
      system_prompt: `You are Ramesh General Store, a kirana store owner's digital business assistant...`,
      greeting_template: 'Namaste'
    }]);

    // NEW: Bot Config for demo merchant
    await queryInterface.bulkInsert('bot_configs', [{
      merchant_id: merchant[0].id,
      waba_id: 'demo_waba_123',
      phone_number_id: 'demo_phone_123',
      display_name: 'Ramesh General Store',
      bot_phone_number: '+919876543210',
      webhook_url: 'https://api.dukaandost.in/webhooks/whatsapp/' + merchant[0].id,
      verify_token: 'demo_verify_token',
      status: 'ACTIVE',
      activated_at: new Date()
    }]);
  }
};
```

DukaanDost Data Model
## Deploy or Die Hackathon | Specification and Architecture (25%)

> **Version:** 2.0  
> **Date:** August 2026  
> **DBMS:** PostgreSQL 15 (Primary), MongoDB 6 (Logs/Catalog), Redis 7 (Cache)

---

## 1. Entity Relationship Overview

```
merchants ||--o{ customers : serves
merchants ||--o{ products : stocks
merchants ||--o{ orders : receives
customers ||--o{ orders : places
orders ||--|{ order_items : contains
products ||--o{ order_items : ordered_as
orders ||--o| payments : settled_by
merchants ||--o{ conversations : has
```

---

## 2. PostgreSQL Schema (DDL)

### 2.1 Merchants

```sql
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) NOT NULL UNIQUE,
    store_name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100),
    upi_id VARCHAR(50),
    language_preference VARCHAR(10) DEFAULT 'hinglish',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_merchants_phone ON merchants(phone);
CREATE INDEX idx_merchants_active ON merchants(is_active) WHERE is_active = true;
```

### 2.2 Customers

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    phone VARCHAR(15) NOT NULL,
    name VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    last_order_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(merchant_id, phone)
);

CREATE INDEX idx_customers_merchant ON customers(merchant_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_tags ON customers USING GIN(tags);
```

### 2.3 Products

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    normalized_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'piece',
    stock_quantity DECIMAL(10,2) DEFAULT 0,
    low_stock_threshold DECIMAL(10,2) DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_merchant ON products(merchant_id);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_low_stock ON products(merchant_id, stock_quantity) 
    WHERE stock_quantity <= low_stock_threshold;
```

### 2.4 Orders

```sql
CREATE TYPE order_status AS ENUM (
    'RECEIVED', 'CONFIRMED', 'PACKED', 
    'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'PAID'
);

CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status order_status DEFAULT 'RECEIVED',
    payment_status payment_status DEFAULT 'PENDING',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cash_amount DECIMAL(12,2) DEFAULT 0.00,
    upi_amount DECIMAL(12,2) DEFAULT 0.00,
    payment_method VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_merchant ON orders(merchant_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_merchant_date ON orders(merchant_id, created_at);
```

### 2.5 Order Items

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

### 2.6 Payments

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL,
    status payment_status DEFAULT 'PENDING',
    utr VARCHAR(50),
    failure_reason TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_razorpay ON payments(razorpay_order_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 2.7 Order Events (Event Sourcing)

```sql
CREATE TABLE order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    actor VARCHAR(50) NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_events_order ON order_events(order_id);
CREATE INDEX idx_order_events_created ON order_events(created_at);
```

### 2.8 Conversations

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    message_type VARCHAR(20) NOT NULL DEFAULT 'text',
    content TEXT NOT NULL,
    intent VARCHAR(50),
    entities JSONB DEFAULT '{}',
    confidence DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_merchant ON conversations(merchant_id);
CREATE INDEX idx_conversations_created ON conversations(created_at);
```

### 2.9 Agent Audit Log

```sql
CREATE TABLE agent_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    tool_input JSONB,
    tool_output JSONB,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_merchant ON agent_audit_log(merchant_id);
CREATE INDEX idx_audit_session ON agent_audit_log(session_id);
CREATE INDEX idx_audit_created ON agent_audit_log(created_at);
```

### 2.10 Business Personas

```sql
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

CREATE INDEX idx_business_personas_merchant ON business_personas(merchant_id);
CREATE INDEX idx_business_personas_type ON business_personas(business_type);
```

### 2.11 Bot Configurations

```sql
CREATE TABLE bot_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL UNIQUE REFERENCES merchants(id) ON DELETE CASCADE,
    waba_id VARCHAR(100),
    phone_number_id VARCHAR(100),
    display_name VARCHAR(100) NOT NULL,
    bot_phone_number VARCHAR(15) NOT NULL,
    webhook_url TEXT NOT NULL,
    verify_token VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'FAILED')),
    meta_access_token_encrypted TEXT,
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bot_configs_merchant ON bot_configs(merchant_id);
CREATE INDEX idx_bot_configs_status ON bot_configs(status);
CREATE INDEX idx_bot_configs_phone ON bot_configs(bot_phone_number);
```

### 2.12 Business Memories

```sql
CREATE TABLE business_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    memory_type VARCHAR(50) NOT NULL, -- 'preference', 'rule', 'customer_note', 'event'
    content TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 1.0,
    source VARCHAR(50), -- 'merchant_stated', 'inferred', 'manual'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_business_memories_merchant ON business_memories(merchant_id);
CREATE INDEX idx_business_memories_type ON business_memories(memory_type);
```

### 2.13 Customer Memories

```sql
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

CREATE INDEX idx_customer_memories_merchant ON customer_memories(merchant_id);
CREATE INDEX idx_customer_memories_customer ON customer_memories(customer_id);
```

### 2.14 Provisioning Jobs

```sql
CREATE TABLE provisioning_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL, -- 'WABA_CREATION', 'PHONE_REGISTRATION', 'WEBHOOK_CONFIG'
    status VARCHAR(20) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    payload JSONB DEFAULT '{}',
    result JSONB DEFAULT '{}',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_provisioning_jobs_merchant ON provisioning_jobs(merchant_id);
CREATE INDEX idx_provisioning_jobs_status ON provisioning_jobs(status);
```

---

---

## 3. Materialized Views (Analytics)

### 3.1 Daily Sales Summary

```sql
CREATE MATERIALIZED VIEW mv_daily_sales AS
SELECT 
    merchant_id,
    DATE(created_at) as sale_date,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue,
    SUM(cash_amount) as cash_revenue,
    SUM(upi_amount) as upi_revenue,
    COUNT(*) FILTER (WHERE payment_status = 'PENDING') as pending_payments
FROM orders
WHERE status != 'CANCELLED'
GROUP BY merchant_id, DATE(created_at);

CREATE UNIQUE INDEX idx_mv_daily_sales ON mv_daily_sales(merchant_id, sale_date);
```

**Refresh Strategy:** Every hour via cron job or trigger on order creation.

### 3.2 Low Stock Alert View

```sql
CREATE MATERIALIZED VIEW mv_low_stock AS
SELECT 
    merchant_id,
    id as product_id,
    name,
    stock_quantity,
    low_stock_threshold,
    (low_stock_threshold - stock_quantity) as deficit
FROM products
WHERE stock_quantity <= low_stock_threshold
AND is_active = true;

CREATE INDEX idx_mv_low_stock_merchant ON mv_low_stock(merchant_id);
```

---

## 4. MongoDB Collections (Schema-Lite)

### 4.1 Product Catalogs (Flexible Schema)

```javascript
// db.catalogs
{
  _id: ObjectId,
  merchant_id: UUID,
  categories: [
    {
      name: "Grains",
      products: [
        { name: "Atta", variants: [{ weight: "5kg", price: 245 }, { weight: "10kg", price: 480 }] }
      ]
    }
  ],
  updated_at: ISODate
}
```

### 4.2 Voice Note Transcriptions

```javascript
// db.voice_notes
{
  _id: ObjectId,
  merchant_id: UUID,
  audio_url: "s3://dukaan-voice/abc123.ogg",
  transcription: "2kg atta bhej do",
  confidence: 0.94,
  language: "hi-IN",
  duration_seconds: 3.2,
  created_at: ISODate
}
```

### 4.3 Broadcast Message Logs

```javascript
// db.broadcasts
{
  _id: ObjectId,
  merchant_id: UUID,
  segment: { tags: ["regular", "credit"] },
  message: "Diwali offer! 10% off on all items.",
  sent_count: 156,
  delivered_count: 149,
  read_count: 98,
  created_at: ISODate
}
```

---

## 5. Redis Key Patterns

```
# Session State
session:{merchant_id}:{customer_id} → JSON (TTL: 24h)

# Rate Limiting
ratelimit:meta_api:{merchant_id} → Counter (TTL: 1min)
ratelimit:otp:{phone} → Counter (TTL: 1hour)

# Cache
merchant:{merchant_id}:catalog → JSON (TTL: 5min)
merchant:{merchant_id}:daily_sales:{YYYY-MM-DD} → JSON (TTL: 1hour)
merchant:{merchant_id}:stock_snapshot → JSON (TTL: 2min)

# Job Queues
queue:whatsapp_outbound → List
queue:payment_reconcile → List
queue:analytics_refresh → List

# Locks
lock:order_create:{merchant_id}:{customer_id} → String (TTL: 10s)
```

---

## 6. Data Flow Diagrams

### 6.1 Order Creation Flow

```
Customer Message
    │
    ▼
[Bot Service] ──Parse──▶ [HinglishParserSkill]
    │
    ▼
[Bot Service] ──Validate──▶ [Catalog Service] (stock check)
    │
    ▼
[Bot Service] ──Create──▶ [Order Service]
    │                           │
    │                           ▼
    │                   [PostgreSQL: orders + order_items]
    │                           │
    │                           ▼
    │                   [PostgreSQL: order_events] (ORDER_RECEIVED)
    │                           │
    ▼                           ▼
[Bot Service] ◄──Confirm── [Order Service]
    │
    ▼
[Bot Service] ──Generate──▶ [Payment Service] (Razorpay)
    │                           │
    │                           ▼
    │                   [PostgreSQL: payments]
    │                           │
    ▼                           ▼
[Bot Service] ◄──Link── [Payment Service]
    │
    ▼
[WhatsApp API] ──Send──▶ Customer (Confirmation + QR)
```

### 6.2 Daily Sales Query Flow

```
Merchant: "Aaj kitna bikaa?"
    │
    ▼
[Bot Service] ──Check Cache──▶ [Redis: daily_sales:{date}]
    │                               │
    │ (cache miss)                  │ (cache hit)
    ▼                               ▼
[Analytics Service] ◄──────── [Bot Service]
    │
    ▼
[PostgreSQL: mv_daily_sales] OR [orders table aggregation]
    │
    ▼
[Analytics Service] ──Cache──▶ [Redis: daily_sales:{date}]
    │
    ▼
[Bot Service] ──Format──▶ [Response Assembler]
    │
    ▼
[WhatsApp API] ──Send──▶ Merchant
```

---

## 7. Migration Strategy

### 7.1 Hackathon Migrations (Sequelize)

```javascript
// migrations/001_initial_schema.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('merchants', { /* ... */ });
    await queryInterface.createTable('customers', { /* ... */ });
    await queryInterface.createTable('products', { /* ... */ });
    await queryInterface.createTable('orders', { /* ... */ });
    await queryInterface.createTable('order_items', { /* ... */ });
    await queryInterface.createTable('payments', { /* ... */ });
    await queryInterface.createTable('order_events', { /* ... */ });
    await queryInterface.createTable('conversations', { /* ... */ });
    await queryInterface.createTable('agent_audit_log', { /* ... */ });
  },
  down: async (queryInterface, Sequelize) => {
    // Reverse order for clean rollback
    await queryInterface.dropTable('agent_audit_log');
    await queryInterface.dropTable('conversations');
    await queryInterface.dropTable('order_events');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('customers');
    await queryInterface.dropTable('merchants');
  }
};
```

### 7.2 Seed Data (Demo-Ready)

```javascript
// seeders/001_demo_data.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const merchant = await queryInterface.bulkInsert('merchants', [{
      phone: '+919876543210',
      store_name: 'Ramesh General Store',
      owner_name: 'Ramesh Kumar',
      upi_id: 'ramesh@upi',
      language_preference: 'hinglish'
    }], { returning: true });

    await queryInterface.bulkInsert('products', [
      { merchant_id: merchant[0].id, name: 'Atta', normalized_name: 'atta', price: 45, unit: 'kg', stock_quantity: 8, low_stock_threshold: 10 },
      { merchant_id: merchant[0].id, name: 'Oil', normalized_name: 'oil', price: 120, unit: 'litre', stock_quantity: 15, low_stock_threshold: 5 },
      { merchant_id: merchant[0].id, name: 'Sugar', normalized_name: 'sugar', price: 42, unit: 'kg', stock_quantity: 22, low_stock_threshold: 10 },
      { merchant_id: merchant[0].id, name: 'Dal', normalized_name: 'dal', price: 95, unit: 'kg', stock_quantity: 45, low_stock_threshold: 10 },
      { merchant_id: merchant[0].id, name: 'Rice', normalized_name: 'rice', price: 55, unit: 'kg', stock_quantity: 30, low_stock_threshold: 15 }
    ]);
  }
};
```

---

*End of Data Model Document*
