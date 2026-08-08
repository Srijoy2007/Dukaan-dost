
const request = require('supertest');
const express = require('express');
const merchantRoutes = require('../../routes/merchant');

describe('Merchant Registration Integration', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/v1/merchants', merchantRoutes);
  });

  describe('POST /v1/merchants/register', () => {
    it('should register kirana merchant and return customized persona', async () => {
      const payload = {
        phone: '+919876543210',
        storeName: 'Ramesh General Store',
        businessType: 'kirana',
        topProducts: ['Atta', 'Oil', 'Sugar'],
        aov: 500,
        deliveryEnabled: true,
        deliveryRadius: 2,
        tone: 'friendly',
        primaryLanguage: 'hinglish',
        creditEnabled: true,
        creditLimit: 2000,
        operatingHours: {
          open: '08:00',
          close: '21:00',
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        }
      };

      const response = await request(app)
        .post('/v1/merchants/register')
        .send(payload)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.merchantId).toBeDefined();
      expect(response.body.otpRequired).toBe(true);
      expect(response.body.persona).toBeDefined();
      expect(response.body.persona.businessType).toBe('KIRANA');
      expect(response.body.persona.businessTypeDisplay).toBe('Ramesh General Store');
      expect(response.body.persona.systemPrompt).toContain('Ramesh General Store');
      expect(response.body.persona.systemPrompt).toContain('kirana');
      expect(response.body.persona.deliveryEnabled).toBe(true);
      expect(response.body.persona.creditEnabled).toBe(true);
      expect(response.body.persona.toneProfile).toBeDefined();
      expect(response.body.persona.insightConfig).toBeDefined();
      expect(response.body.persona.greetingTemplate).toBe('Namaste');
    });

    it('should register pharmacy merchant with prescription rules in prompt', async () => {
      const payload = {
        phone: '+919876543211',
        storeName: 'Gupta Medical Store',
        businessType: 'pharmacy',
        topProducts: ['Paracetamol', 'Cough Syrup', 'Bandages'],
        aov: 300,
        deliveryEnabled: false,
        tone: 'formal',
        primaryLanguage: 'hi',
        creditEnabled: false,
        operatingHours: { open: '09:00', close: '21:00' }
      };

      const response = await request(app)
        .post('/v1/merchants/register')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.persona.businessType).toBe('PHARMACY');
      expect(response.body.persona.systemPrompt).toContain('prescription');
      expect(response.body.persona.systemPrompt).toContain('pickup-only');
      expect(response.body.persona.insightConfig.expiryAlerts).toBe(true);
      expect(response.body.persona.toneProfile.formalityLevel).toBe(75);
    });

    it('should register bakery merchant with pre-order alerts', async () => {
      const payload = {
        phone: '+919876543212',
        storeName: 'Sweet Crust Bakery',
        businessType: 'bakery',
        topProducts: ['Cake', 'Bread', 'Pastry'],
        aov: 400,
        deliveryEnabled: true,
        deliveryRadius: 5,
        tone: 'casual',
        primaryLanguage: 'en',
        creditEnabled: false,
        operatingHours: { open: '06:00', close: '20:00' }
      };

      const response = await request(app)
        .post('/v1/merchants/register')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.persona.businessType).toBe('BAKERY');
      expect(response.body.persona.insightConfig.preOrderAlerts).toBe(true);
      expect(response.body.persona.toneProfile.formalityLevel).toBe(15);
      expect(response.body.persona.systemPrompt).toContain('pre-orders');
    });

    it('should reject registration without required fields', async () => {
      const response = await request(app)
        .post('/v1/merchants/register')
        .send({ phone: '+919876543210' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('E001');
      expect(response.body.message).toContain('Missing required fields');
    });

    it('should reject registration without phone', async () => {
      const response = await request(app)
        .post('/v1/merchants/register')
        .send({ storeName: 'Test', businessType: 'kirana' });

      expect(response.status).toBe(400);
    });

    it('should generate unique merchant IDs for each registration', async () => {
      const payload = {
        phone: '+919876543210',
        storeName: 'Test Store',
        businessType: 'kirana'
      };

      const res1 = await request(app).post('/v1/merchants/register').send(payload);
      const res2 = await request(app).post('/v1/merchants/register').send(payload);

      expect(res1.body.merchantId).not.toBe(res2.body.merchantId);
    });
  });

  describe('POST /v1/merchants/verify-otp', () => {
    it('should verify OTP and return JWT', async () => {
      const response = await request(app)
        .post('/v1/merchants/verify-otp')
        .send({ merchantId: 'merch_123', otp: '123456' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.token).toContain('merch_123');
    });

    it('should reject invalid OTP', async () => {
      const response = await request(app)
        .post('/v1/merchants/verify-otp')
        .send({ merchantId: 'merch_123', otp: '99' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('E002');
    });

    it('should require merchantId and otp', async () => {
      const response = await request(app)
        .post('/v1/merchants/verify-otp')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /v1/merchants/provision-bot', () => {
    it('should initiate bot provisioning', async () => {
      const response = await request(app)
        .post('/v1/merchants/provision-bot')
        .send({ merchantId: 'merch_123' });

      expect(response.status).toBe(202);
      expect(response.body.status).toBe('INITIATED');
      expect(response.body.provisioningId).toBeDefined();
    });
  });

  describe('GET /v1/merchants/:merchantId/persona', () => {
    it('should return persona for merchant', async () => {
      const response = await request(app)
        .get('/v1/merchants/merch_123/persona');

      expect(response.status).toBe(200);
      expect(response.body.merchantId).toBe('merch_123');
    });
  });

  describe('POST /v1/merchants/verify-meta-otp', () => {
    it('should complete meta verification and activate bot', async () => {
      const response = await request(app)
        .post('/v1/merchants/verify-meta-otp')
        .send({ merchantId: 'merch_123', metaOtp: '654321' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ACTIVE');
      expect(response.body.botPhoneNumber).toBeDefined();
      expect(response.body.welcomeMessage).toContain('Namaste');
    });

    it('should reject short meta OTP', async () => {
      const response = await request(app)
        .post('/v1/merchants/verify-meta-otp')
        .send({ merchantId: 'merch_123', metaOtp: '12' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('E003');
    });
  });

  describe('Full Registration Flow', () => {
    it('should complete end-to-end merchant registration', async () => {
      // Step 1: Register
      const registerRes = await request(app)
        .post('/v1/merchants/register')
        .send({
          phone: '+919999999999',
          storeName: 'Full Flow Store',
          businessType: 'kirana',
          tone: 'friendly',
          primaryLanguage: 'hinglish',
          deliveryEnabled: true,
          deliveryRadius: 3,
          creditEnabled: false,
          operatingHours: { open: '08:00', close: '22:00' }
        });

      expect(registerRes.status).toBe(201);
      const merchantId = registerRes.body.merchantId;
      expect(registerRes.body.persona.systemPrompt).toContain('Full Flow Store');

      // Step 2: Verify OTP
      const otpRes = await request(app)
        .post('/v1/merchants/verify-otp')
        .send({ merchantId, otp: '123456' });
      expect(otpRes.status).toBe(200);

      // Step 3: Provision Bot
      const provRes = await request(app)
        .post('/v1/merchants/provision-bot')
        .send({ merchantId });
      expect(provRes.status).toBe(202);

      // Step 4: Verify Meta OTP
      const metaRes = await request(app)
        .post('/v1/merchants/verify-meta-otp')
        .send({ merchantId, metaOtp: '654321' });
      expect(metaRes.status).toBe(200);
      expect(metaRes.body.status).toBe('ACTIVE');
    });
  });
});
