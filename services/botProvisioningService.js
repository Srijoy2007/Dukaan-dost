
const crypto = require('crypto');

class BotProvisioningService {
  constructor({ metaApi, db, redis, webhookBaseUrl }) {
    this.metaApi = metaApi;
    this.db = db;
    this.redis = redis;
    this.webhookBaseUrl = webhookBaseUrl;
  }

  async provisionMerchantBot(merchant, persona) {
    // Step 1: Create WABA (mocked for test/hackathon)
    const waba = await this.createWABA(persona.businessTypeDisplay);

    // Step 2: Register phone
    const phoneNumber = await this.registerPhoneNumber(waba.id, merchant.phone);

    // Step 3: Configure webhook
    const webhookUrl = `${this.webhookBaseUrl}/webhooks/whatsapp/${merchant.id}`;
    const verifyToken = this.generateVerifyToken(merchant.id);

    await this.configureWebhook(waba.id, webhookUrl, verifyToken);

    // Step 4: Persist config
    const botConfig = await this.db.BotConfig.create({
      merchantId: merchant.id,
      wabaId: waba.id,
      phoneNumberId: phoneNumber.id,
      displayName: persona.businessTypeDisplay,
      botPhoneNumber: merchant.phone,
      webhookUrl,
      verifyToken,
      status: 'PENDING_VERIFICATION'
    });

    // Step 5: Cache persona
    await this.cachePersona(merchant.id, persona);

    return botConfig;
  }

  async completePhoneVerification(merchantId, metaOtp) {
    const config = await this.db.BotConfig.findOne({ where: { merchantId } });
    if (!config) throw new Error('Bot config not found');

    // Simulate Meta verification
    await this.verifyPhoneNumber(config.phoneNumberId, metaOtp);

    await config.update({
      status: 'ACTIVE',
      activatedAt: new Date()
    });

    await this.cachePersona(merchantId);
    return config;
  }

  async cachePersona(merchantId, persona = null) {
    if (!persona) {
      const record = await this.db.BusinessPersona.findOne({ where: { merchantId } });
      persona = record ? record.toJSON() : null;
    }
    if (persona) {
      await this.redis.setex(`persona:${merchantId}`, 86400, JSON.stringify(persona));
    }
  }

  async getCachedPersona(merchantId) {
    const cached = await this.redis.get(`persona:${merchantId}`);
    return cached ? JSON.parse(cached) : null;
  }

  generateVerifyToken(merchantId) {
    const secret = process.env.WEBHOOK_SECRET || 'hackathon-secret';
    return crypto
      .createHmac('sha256', secret)
      .update(merchantId)
      .digest('hex')
      .substring(0, 32);
  }

  // Mock Meta API methods for hackathon
  async createWABA(name) {
    return { id: `waba_${Date.now()}`, name };
  }

  async registerPhoneNumber(wabaId, phone) {
    return { id: `phone_${Date.now()}`, wabaId, phone };
  }

  async configureWebhook(wabaId, url, token) {
    return { success: true, wabaId, url, verifyToken: token };
  }

  async verifyPhoneNumber(phoneNumberId, otp) {
    if (!otp || otp.length < 4) throw new Error('Invalid OTP');
    return { success: true, phoneNumberId };
  }
}

module.exports = { BotProvisioningService };
