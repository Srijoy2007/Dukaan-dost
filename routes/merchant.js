const express = require('express');
const router = express.Router();
const { PersonaEngineService } = require('../services/personaEngineService');

const personaEngine = new PersonaEngineService();

router.post('/register', async (req, res) => {
  try {
    const { phone, storeName, businessType } = req.body;
    if (!phone || !storeName || !businessType) {
      return res.status(400).json({ error: 'E001', message: 'Missing required fields: phone, storeName, businessType' });
    }

    const personaData = personaEngine.generatePersona(req.body);
    const merchantId = `merch_${Date.now()}`;

    res.status(201).json({
      success: true, merchantId, otpRequired: true,
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
    res.status(500).json({ error: 'E500', message: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { merchantId, otp } = req.body;
  if (!merchantId || !otp) return res.status(400).json({ error: 'E001', message: 'merchantId and otp required' });
  if (otp !== '123456' && otp.length < 4) return res.status(400).json({ error: 'E002', message: 'Invalid OTP' });
  res.json({ success: true, token: `jwt_${merchantId}_${Date.now()}`, merchant: { id: merchantId, status: 'ACTIVE' } });
});

router.post('/provision-bot', async (req, res) => {
  res.status(202).json({ success: true, provisioningId: `prov_${Date.now()}`, status: 'INITIATED', estimatedTime: '2 minutes' });
});

router.get('/:merchantId/persona', async (req, res) => {
  res.json({ success: true, merchantId: req.params.merchantId, persona: req.session?.businessPersona || null });
});

router.get('/:merchantId/bot-status', async (req, res) => {
  res.json({ success: true, merchantId: req.params.merchantId, status: 'PENDING_VERIFICATION', metaOtpRequired: true });
});

router.post('/verify-meta-otp', async (req, res) => {
  const { metaOtp } = req.body;
  if (!metaOtp || metaOtp.length < 4) return res.status(400).json({ error: 'E003', message: 'Invalid Meta OTP' });
  res.json({ success: true, status: 'ACTIVE', botPhoneNumber: '+919876543210', welcomeMessage: 'Namaste! Aapka DukaanDost bot taiyaar hai.' });
});

module.exports = router;
