# DukaanDost API Specification
## Deploy or Die Hackathon | Working Software and Delivery (30%)

> **Version:** 2.0  
> **Date:** August 2026  
> **Base URL:** `https://api.dukaandost.in/v1` (production) / `http://localhost:3001` (local)

---

## 1. Authentication

All internal API calls use **JWT Bearer tokens**.

```http
Authorization: Bearer <jwt_token>
```

Webhook endpoints use **HMAC-SHA256 signature verification** instead of JWT.

---

## 2. Webhook Endpoints (External → DukaanDost)

### 2.1 Meta WhatsApp Webhook

```http
POST /webhooks/whatsapp
Content-Type: application/json
X-Hub-Signature-256: sha256=<hmac_signature>
```

**Request Body:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "919876543210",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "contacts": [{"profile": {"name": "Priya"}, "wa_id": "919876543211"}],
        "messages": [{
          "from": "919876543211",
          "id": "wamid.XXX",
          "timestamp": "1691467200",
          "type": "text",
          "text": {"body": "Bhaiya 2kg atta bhej do"}
        }]
      },
      "field": "messages"
    }]
  }]
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{ "status": "processed", "message_id": "wamid.XXX" }
```

**Validation:**
```typescript
const signature = crypto
  .createHmac('sha256', META_WEBHOOK_SECRET)
  .update(JSON.stringify(body))
  .digest('hex');

if (`sha256=${signature}` !== req.headers['x-hub-signature-256']) {
  throw new UnauthorizedError('Invalid webhook signature');
}
```

### 2.2 Razorpay Payment Webhook

```http
POST /webhooks/razorpay
Content-Type: application/json
X-Razorpay-Signature: <hmac_signature>
```

**Request Body:**
```json
{
  "entity": "event",
  "account_id": "acc_xxx",
  "event": "payment.captured",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxx",
        "amount": 184500,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_xxx",
        "method": "upi",
        "acquirer_data": { "upi_transaction_id": "upi_xxx" },
        "notes": { "merchantId": "uuid", "orderId": "uuid" }
      }
    }
  }
}
```

**Response:**
```http
HTTP/1.1 200 OK
```

---

## 3. Internal REST API

### 3.1 Orders

#### Create Order

```http
POST /v1/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "merchantId": "550e8400-e29b-41d4-a716-446655440000",
  "customerPhone": "+919876543211",
  "customerName": "Priya",
  "items": [
    { "productId": "550e8400-e29b-41d4-a716-446655440001", "quantity": 2, "unit": "kg" },
    { "productId": "550e8400-e29b-41d4-a716-446655440002", "quantity": 1, "unit": "litre" }
  ],
  "notes": "Deliver by 6 PM"
}
```

**Response 201:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "merchantId": "550e8400-e29b-41d4-a716-446655440000",
  "customerId": "550e8400-e29b-41d4-a716-446655440005",
  "status": "RECEIVED",
  "paymentStatus": "PENDING",
  "totalAmount": 210.00,
  "items": [
    { "productId": "...", "productName": "Atta", "quantity": 2, "unit": "kg", "unitPrice": 45.00, "totalPrice": 90.00 },
    { "productId": "...", "productName": "Oil", "quantity": 1, "unit": "litre", "unitPrice": 120.00, "totalPrice": 120.00 }
  ],
  "createdAt": "2026-08-08T10:30:00Z"
}
```

#### Get Order by ID

```http
GET /v1/orders/:orderId
Authorization: Bearer <token>
```

#### Update Order Status

```http
PATCH /v1/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "PACKED",
  "actor": "merchant"
}
```

#### Get Daily Sales

```http
GET /v1/orders/daily-sales?merchantId=:id&date=2026-08-08
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "date": "2026-08-08",
  "merchantId": "...",
  "orderCount": 23,
  "totalRevenue": 18450.00,
  "cashRevenue": 6200.00,
  "upiRevenue": 12250.00,
  "pendingPayments": 3
}
```

---

### 3.2 Payments

#### Generate UPI Payment

```http
POST /v1/payments/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "550e8400-e29b-41d4-a716-446655440010",
  "amount": 210.00
}
```

**Response 201:**
```json
{
  "paymentId": "550e8400-e29b-41d4-a716-446655440020",
  "orderId": "550e8400-e29b-41d4-a716-446655440010",
  "razorpayOrderId": "order_xxx",
  "paymentLink": "https://rzp.io/l/xxx",
  "qrCodeUrl": "https://rzp.io/qrcode/xxx",
  "upiDeepLink": "upi://pay?pa=ramesh@upi&pn=Ramesh+Store&am=210.00&cu=INR",
  "expiresAt": "2026-08-08T11:00:00Z",
  "status": "PENDING"
}
```

#### Get Pending Payments

```http
GET /v1/payments/pending?merchantId=:id
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "merchantId": "...",
  "pendingCount": 3,
  "totalPendingAmount": 1250.00,
  "payments": [
    {
      "orderId": "...",
      "customerName": "Shyam",
      "customerPhone": "+919876543212",
      "amount": 450.00,
      "daysOverdue": 5,
      "orderDate": "2026-08-03"
    }
  ]
}
```

---

### 3.3 Inventory

#### Get Stock

```http
GET /v1/inventory?merchantId=:id
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "merchantId": "...",
  "products": [
    { "id": "...", "name": "Atta", "quantity": 8, "unit": "kg", "status": "LOW", "suggestedReorder": 20 },
    { "id": "...", "name": "Oil", "quantity": 15, "unit": "litre", "status": "OK", "suggestedReorder": 0 },
    { "id": "...", "name": "Sugar", "quantity": 22, "unit": "kg", "status": "OK", "suggestedReorder": 0 }
  ],
  "lowStockCount": 1,
  "outOfStockCount": 0
}
```

#### Update Stock

```http
PATCH /v1/inventory/:productId
Authorization: Bearer <token>
Content-Type: application/json

{
  "stockQuantity": 25,
  "reason": "restock"
}
```

---

### 3.4 Auth

#### Request OTP

```http
POST /v1/auth/otp/request
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

#### Verify OTP

```http
POST /v1/auth/otp/verify
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "merchant": {
    "id": "...",
    "phone": "+919876543210",
    "storeName": "Ramesh General Store"
  }
}
```

---

### 3.5 Merchants & Registration

#### Register Merchant

```http
POST /v1/merchants/register
Content-Type: application/json

{
  "phone": "+919876543210",
  "storeName": "Ramesh General Store",
  "businessType": "KIRANA",
  "topProducts": ["Atta", "Oil", "Sugar", "Dal", "Rice"],
  "aov": 500,
  "deliveryEnabled": true,
  "deliveryRadius": 2,
  "tone": "friendly",
  "primaryLanguage": "hinglish",
  "creditEnabled": true,
  "creditLimit": 2000,
  "operatingHours": {
    "open": "08:00",
    "close": "21:00",
    "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  }
}
```

**Response 201:**
```json
{
  "merchantId": "550e8400-e29b-41d4-a716-446655440000",
  "otpRequired": true,
  "message": "OTP sent to +919876543210"
}
```

#### Verify OTP

```http
POST /v1/merchants/verify-otp
Content-Type: application/json

{
  "merchantId": "550e8400-e29b-41d4-a716-446655440000",
  "otp": "123456"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "merchant": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "+919876543210",
    "storeName": "Ramesh General Store"
  },
  "persona": {
    "businessType": "KIRANA",
    "businessTypeDisplay": "Ramesh General Store",
    "primaryLanguage": "hinglish",
    "systemPrompt": "You are Ramesh General Store..."
  }
}
```

#### Get Business Persona

```http
GET /v1/merchants/persona
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "personaId": "550e8400-e29b-41d4-a716-446655440001",
  "businessType": "KIRANA",
  "businessTypeDisplay": "Ramesh General Store",
  "toneProfile": {
    "formalityLevel": 40,
    "emojiDensity": 3,
    "honorificStyle": "bhaiya",
    "greetingStyle": "Namaste"
  },
  "primaryLanguage": "hinglish",
  "deliveryEnabled": true,
  "deliveryRadiusKm": 2,
  "creditEnabled": true,
  "maxCreditLimit": 2000,
  "systemPrompt": "You are Ramesh General Store...",
  "greetingTemplate": "Namaste"
}
```

### 3.6 Bot Provisioning

#### Provision Bot

```http
POST /v1/merchants/provision-bot
Authorization: Bearer <token>
Content-Type: application/json

{
  "merchantId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 202 (Accepted - Async):**
```json
{
  "provisioningId": "550e8400-e29b-41d4-a716-446655440030",
  "status": "INITIATED",
  "estimatedTime": "2-3 minutes",
  "message": "Bot provisioning started. You will receive updates via WebSocket."
}
```

#### Get Bot Status

```http
GET /v1/merchants/bot-status/:merchantId
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "status": "PENDING_PHONE_VERIFICATION",
  "wabaId": "waba_xxx",
  "phoneNumberId": "phone_xxx",
  "displayName": "Ramesh General Store",
  "botPhoneNumber": "+919876543210",
  "metaOtpRequired": true,
  "webhookUrl": "https://api.dukaandost.in/webhooks/whatsapp/550e8400-e29b-41d4-a716-446655440000",
  "progress": 60
}
```

#### Verify Meta OTP

```http
POST /v1/merchants/verify-meta-otp
Authorization: Bearer <token>
Content-Type: application/json

{
  "merchantId": "550e8400-e29b-41d4-a716-446655440000",
  "metaOtp": "123456"
}
```

**Response 200:**
```json
{
  "status": "ACTIVE",
  "botPhoneNumber": "+919876543210",
  "welcomeMessage": "Namaste Ramesh General Store! Aapka DukaanDost bot taiyaar hai.",
  "webhookUrl": "https://api.dukaandost.in/webhooks/whatsapp/550e8400-e29b-41d4-a716-446655440000"
}
```

### 3.7 WebSocket Events

```javascript
// Client subscribes to provisioning updates
socket.emit('subscribe:provisioning', merchantId);

// Server emits progress
socket.on('provisioning:update', (data) => {
  console.log(data.step);      // 'WABA_CREATED'
  console.log(data.message);   // 'WhatsApp Business account created'
  console.log(data.progress);  // 30
});

socket.on('provisioning:complete', (data) => {
  console.log(data.botPhoneNumber);  // '+919876543210'
  console.log(data.welcomeMessage);
});
```

---

## 4. Error Codes

| Code | HTTP Status | Message | When |
|------|-------------|---------|------|
| E001 | 400 | Bad Request | Invalid JSON or missing required fields |
| E002 | 401 | Unauthorized | Invalid or expired JWT |
| E003 | 403 | Forbidden | Merchant accessing another merchant's data |
| E004 | 404 | Not Found | Order, product, or customer not found |
| E005 | 409 | Conflict | Duplicate order within 5 minutes |
| E006 | 422 | Unprocessable | Insufficient stock for order |
| E007 | 429 | Too Many Requests | Rate limit exceeded |
| E008 | 500 | Internal Error | Unexpected server error (logged to Sentry) |
| E009 | 502 | Bad Gateway | Razorpay or Meta API unavailable |

**Error Response Format:**
```json
{
  "error": {
    "code": "E006",
    "message": "Insufficient stock for product 'Atta'. Available: 1kg, Requested: 2kg",
    "details": {
      "productId": "...",
      "available": 1,
      "requested": 2
    }
  }
}
```

---

## 5. Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /webhooks/*` | 10,000 | 1 minute (per IP) |
| `POST /v1/orders` | 100 | 1 minute (per merchant) |
| `POST /v1/auth/otp/*` | 3 | 1 hour (per phone) |
| `GET /v1/*` | 1,000 | 1 minute (per merchant) |

---

*End of API Specification*
