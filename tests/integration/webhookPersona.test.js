
const request = require('supertest');
const express = require('express');
const { authorizeCapability } = require('../../middleware/authorization');

describe('Webhook with Persona Context', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock webhook endpoint with persona context
    app.post('/webhooks/whatsapp/:merchantId', async (req, res) => {
      const { merchantId } = req.params;
      const from = req.body.from;
      const message = req.body.message;

      // Mock session with persona
      req.session = {
        merchantId,
        customerPhone: from,
        isMerchant: from === '+919999999999', // merchant phone
        businessPersona: req.body.mockPersona || null
      };

      // Simulate intent classification
      const intent = classifyIntent(message);

      // Check authorization for business insights
      if (isBusinessInsight(intent) && !req.session.isMerchant) {
        const middleware = authorizeCapability('merchant');
        return middleware(req, res, () => {});
      }

      res.json({
        success: true,
        intent,
        isMerchant: req.session.isMerchant,
        personaLoaded: !!req.session.businessPersona,
        response: generateMockResponse(intent, req.session)
      });
    });
  });

  function classifyIntent(message) {
    const msg = message.toLowerCase();
    if (msg.includes('kitna bikaa') || msg.includes('sales')) return 'query_sales';
    if (msg.includes('stock') || msg.includes('check')) return 'check_stock';
    if (msg.includes('payment') || msg.includes('udhaar')) return 'pending_payments';
    if (msg.includes('order') || msg.includes('bhej')) return 'place_order';
    return 'unknown';
  }

  function isBusinessInsight(intent) {
    return ['query_sales', 'check_stock', 'pending_payments'].includes(intent);
  }

  function generateMockResponse(intent, session) {
    if (!session.businessPersona) return 'Generic response';
    const persona = session.businessPersona;
    if (intent === 'place_order') {
      return `${persona.greetingTemplate}! Order received for ${persona.businessTypeDisplay}`;
    }
    return 'OK';
  }

  it('should allow merchant to query sales with persona context', async () => {
    const response = await request(app)
      .post('/webhooks/whatsapp/merch_123')
      .send({
        from: '+919999999999',
        message: 'Aaj kitna bikaa?',
        mockPersona: {
          businessType: 'KIRANA',
          businessTypeDisplay: 'Ramesh General Store',
          primaryLanguage: 'hinglish',
          greetingTemplate: 'Namaste'
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.intent).toBe('query_sales');
    expect(response.body.isMerchant).toBe(true);
    expect(response.body.personaLoaded).toBe(true);
  });

  it('should block customer from accessing sales data with persona-aware message', async () => {
    const response = await request(app)
      .post('/webhooks/whatsapp/merch_123')
      .send({
        from: '+918888888888', // customer
        message: 'Aaj kitna bikaa?',
        mockPersona: {
          businessType: 'KIRANA',
          businessTypeDisplay: 'Ramesh General Store',
          primaryLanguage: 'hinglish',
          greetingTemplate: 'Namaste'
        }
      });

    expect(response.status).toBe(200); // middleware sends 403 via res.json
    expect(response.body.message).toContain('Bhaiya');
    expect(response.body.message).toContain('dukaan wale');
  });

  it('should allow customer to place order', async () => {
    const response = await request(app)
      .post('/webhooks/whatsapp/merch_123')
      .send({
        from: '+918888888888',
        message: '2kg atta bhej do',
        mockPersona: {
          businessType: 'KIRANA',
          businessTypeDisplay: 'Ramesh General Store',
          primaryLanguage: 'hinglish',
          greetingTemplate: 'Namaste'
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.intent).toBe('place_order');
    expect(response.body.response).toContain('Namaste');
    expect(response.body.response).toContain('Ramesh General Store');
  });

  it('should handle Hindi unauthorized message correctly', async () => {
    const response = await request(app)
      .post('/webhooks/whatsapp/merch_123')
      .send({
        from: '+918888888888',
        message: 'Stock check karo',
        mockPersona: {
          businessType: 'PHARMACY',
          businessTypeDisplay: 'Gupta Medical',
          primaryLanguage: 'hi',
          greetingTemplate: 'Namaste'
        }
      });

    expect(response.body.message).toContain('Maaf kijiye');
  });
});
