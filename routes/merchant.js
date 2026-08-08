
const express = require('express');
const router = express.Router();
const { PersonaEngineService } = require('../services/personaEngineService');
const { BotProvisioningService } = require('../services/botProvisioningService');

const personaEngine = new PersonaEngineService();

// POST /v1/merchants/register
// Accepts questionnaire data and generates business persona
router.post('/register', async (req, res) => {
  try {
    const {
      phone,
      storeName,
      businessType,
      topProducts,
      aov,
      deliveryEnabled,
      deliveryRadius,
      tone,
      primaryLanguage,
      creditEnabled,
      creditLimit,
      operatingHours
    } = req.body;

    // Validation
    if (!phone || !storeName || !businessType) {
      return res.status(400).json({
        error: 'E001',
        message: 'Missing required fields: phone, storeName, businessType'
      });
    }

    // Generate persona from questionnaire
    const personaData = personaEngine.generatePersona({
      storeName,
      businessType,
      topProducts,
      aov,
      deliveryEnabled,
      deliveryRadius,
      tone,
      primaryLanguage,
      creditEnabled,
      creditLimit,
      operatingHours
    });

    // In production: Save merchant + persona to DB here
    // const merchant = await db.Merchant.create({ phone, storeName });
    // await db.BusinessPersona.create({ merchantId: merchant.id, ...personaData });

    const merchantId = `merch_${Date.now()}`;

    res.status(201).json({
      success: true,
      merchantId,
      otpRequired: true,
      persona: {
        businessType: personaData.businessType,
        businessTypeDisplay: personaData.businessTypeDisplay,
        primaryLanguage: personaData.primaryLanguage,
        deliveryEnabled: personaData.deliveryEnabled,
        creditEnabled: personaData.creditEnabled,
        systemPrompt: personaData.systemPrompt,
        greetingTemplate: personaData.greetingTemplate,
        toneProfile: personaData.toneProfile,
        insightConfig: personaData.insightConfig,
        quickReplyDefaults: personaData.quickReplyDefaults
      },
      message: 'Merchant registered. Please verify OTP sent to your phone.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'E500',
      message: error.message
    });
  }
});

// POST /v1/merchants/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { merchantId, otp } = req.body;

    if (!merchantId || !otp) {
      return res.status(400).json({ error: 'E001', message: 'merchantId and otp required' });
    }

    // Mock OTP verification
    if (otp !== '123456' && otp.length < 4) {
      return res.status(400).json({ error: 'E002', message: 'Invalid OTP' });
    }

    res.json({
      success: true,
      token: `jwt_${merchantId}_${Date.now()}`,
      merchant: { id: merchantId, status: 'ACTIVE' },
      message: 'OTP verified successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'E500', message: error.message });
  }
});

// POST /v1/merchants/provision-bot
router.post('/provision-bot', async (req, res) => {
  try {
    const { merchantId } = req.body;

    res.status(202).json({
      success: true,
      provisioningId: `prov_${Date.now()}`,
      status: 'INITIATED',
      estimatedTime: '2 minutes',
      message: 'Bot provisioning started'
    });
  } catch (error) {
    res.status(500).json({ error: 'E500', message: error.message });
  }
});

// GET /v1/merchants/:merchantId/persona
router.get('/:merchantId/persona', async (req, res) => {
  try {
    const { merchantId } = req.params;

    // In production: fetch from DB
    // const persona = await db.BusinessPersona.findOne({ where: { merchantId } });

    res.json({
      success: true,
      merchantId,
      persona: req.session?.businessPersona || null
    });
  } catch (error) {
    res.status(500).json({ error: 'E500', message: error.message });
  }
});

// GET /v1/merchants/:merchantId/bot-status
router.get('/:merchantId/bot-status', async (req, res) => {
  try {
    const { merchantId } = req.params;

    res.json({
      success: true,
      merchantId,
      status: 'PENDING_VERIFICATION',
      metaOtpRequired: true,
      message: 'Meta phone verification pending'
    });
  } catch (error) {
    res.status(500).json({ error: 'E500', message: error.message });
  }
});

// POST /v1/merchants/verify-meta-otp
router.post('/verify-meta-otp', async (req, res) => {
  try {
    const { merchantId, metaOtp } = req.body;

    if (!metaOtp || metaOtp.length < 4) {
      return res.status(400).json({ error: 'E003', message: 'Invalid Meta OTP' });
    }

    res.json({
      success: true,
      status: 'ACTIVE',
      botPhoneNumber: '+919876543210',
      welcomeMessage: `Namaste! Aapka DukaanDost bot taiyaar hai. Customers ab aapke is number par order kar sakte hain.`,
      message: 'Meta verification complete. Bot is now active!'
    });
  } catch (error) {
    res.status(500).json({ error: 'E500', message: error.message });
  }
});

module.exports = router;
