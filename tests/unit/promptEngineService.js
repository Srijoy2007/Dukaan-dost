const { PromptEngineService } = require('../../services/promptEngineService');

describe('PromptEngineService', () => {
  let service;

  beforeEach(() => {
    service = new PromptEngineService();
  });

  describe('generateSystemPrompt', () => {
    it('should generate complete prompt for delivery-enabled kirana with credit', () => {
      const persona = {
        businessTypeDisplay: 'Ramesh General Store',
        businessType: 'KIRANA',
        deliveryEnabled: true,
        deliveryRadiusKm: 2,
        creditEnabled: true,
        maxCreditLimit: 2000,
        primaryLanguage: 'hinglish',
        toneProfile: {
          formalityLevel: 45,
          emojiDensity: 2,
          honorificStyle: 'bhaiya',
          greetingStyle: 'Namaste'
        },
        operatingHours: {
          open: '08:00',
          close: '21:00'
        },
        insightConfig: {
          morningBriefing: true,
          eveningSettlement: true,
          lowStockAlerts: true
        },
        greetingTemplate: 'Namaste'
      };

      const prompt = service.generateSystemPrompt(persona);

      expect(prompt).toContain('You are Ramesh General Store');
      expect(prompt).toContain('kirana');
      expect(prompt).toContain('home delivery within 2km');
      expect(prompt).toContain('₹2000');
      expect(prompt).toContain('COMMUNICATION STYLE');
      expect(prompt).toContain('OPERATIONAL RULES');
      expect(prompt).toContain('INSIGHTS YOU PROVIDE');
      expect(prompt).toContain('BEHAVIORAL CONSTRAINTS');
      expect(prompt).toContain('Namaste');
      expect(prompt).toContain('bhaiya');
      expect(prompt).toContain('Out for Delivery');
      expect(prompt).toContain('udhaar book');
    });

    it('should generate formal prompt for pickup-only pharmacy', () => {
      const persona = {
        businessTypeDisplay: 'Gupta Medical Store',
        businessType: 'PHARMACY',
        deliveryEnabled: false,
        creditEnabled: false,
        primaryLanguage: 'hi',
        toneProfile: {
          formalityLevel: 85,
          emojiDensity: 0,
          honorificStyle: 'ji',
          greetingStyle: 'Namaste'
        },
        operatingHours: { open: '09:00', close: '21:00' },
        insightConfig: {
          expiryAlerts: true,
          morningBriefing: true
        },
        greetingTemplate: 'Namaste'
      };

      const prompt = service.generateSystemPrompt(persona);

      expect(prompt).toContain('Gupta Medical Store');
      expect(prompt).toContain('pharmacy');
      expect(prompt).toContain('pickup-only');
      expect(prompt).toContain('cash/UPI only');
      expect(prompt).toContain('prescription');
      expect(prompt).toContain('Very formal and respectful');
      expect(prompt).toContain('ji');
      expect(prompt).toContain('Ready for Pickup');
      expect(prompt).toContain('expiry dates');
    });

    it('should generate casual prompt for bakery', () => {
      const persona = {
        businessTypeDisplay: 'Sweet Crust Bakery',
        businessType: 'BAKERY',
        deliveryEnabled: true,
        deliveryRadiusKm: 5,
        creditEnabled: false,
        primaryLanguage: 'en',
        toneProfile: {
          formalityLevel: 15,
          emojiDensity: 4,
          honorificStyle: 'bhaiya',
          greetingStyle: 'Ram Ram'
        },
        operatingHours: { open: '06:00', close: '20:00' },
        insightConfig: {
          preOrderAlerts: true,
          expiryAlerts: true
        },
        greetingTemplate: 'Ram Ram'
      };

      const prompt = service.generateSystemPrompt(persona);

      expect(prompt).toContain('Sweet Crust Bakery');
      expect(prompt).toContain('bakery');
      expect(prompt).toContain('Very casual and friendly');
      expect(prompt).toContain('4 emojis');
      expect(prompt).toContain('pre-orders');
      expect(prompt).toContain('perishable');
      expect(prompt).toContain('Ram Ram');
    });

    it('should include tailor-specific rules', () => {
      const persona = {
        businessTypeDisplay: 'Stitch Well Tailors',
        businessType: 'TAILOR',
        deliveryEnabled: false,
        creditEnabled: true,
        maxCreditLimit: 5000,
        primaryLanguage: 'hinglish',
        toneProfile: {
          formalityLevel: 60,
          emojiDensity: 1,
          honorificStyle: 'ji',
          greetingStyle: 'Namaste'
        },
        operatingHours: {},
        insightConfig: {},
        greetingTemplate: 'Namaste'
      };

      const prompt = service.generateSystemPrompt(persona);

      expect(prompt).toContain('tailor');
      expect(prompt).toContain('measurement logs');
      expect(prompt).toContain('alteration deadlines');
      expect(prompt).toContain('₹5000');
    });

    it('should handle missing toneProfile gracefully', () => {
      const persona = {
        businessTypeDisplay: 'Test',
        businessType: 'KIRANA',
        deliveryEnabled: false,
        creditEnabled: false,
        primaryLanguage: 'en',
        toneProfile: null,
        operatingHours: {},
        insightConfig: {},
        greetingTemplate: 'Hello'
      };

      const prompt = service.generateSystemPrompt(persona);
      expect(prompt).toContain('You are Test');
      expect(prompt).toContain('BEHAVIORAL CONSTRAINTS');
    });
  });

  describe('buildCommunicationStyle', () => {
    it('should generate casual style correctly', () => {
      const persona = {
        toneProfile: { formalityLevel: 15, emojiDensity: 4, honorificStyle: 'bhaiya' }
      };
      const style = service.buildCommunicationStyle(persona);
      expect(style).toContain('Very casual and friendly');
      expect(style).toContain('4 emojis');
    });

    it('should generate formal style correctly', () => {
      const persona = {
        toneProfile: { formalityLevel: 85, emojiDensity: 0, honorificStyle: 'ji' }
      };
      const style = service.buildCommunicationStyle(persona);
      expect(style).toContain('Very formal and respectful');
      expect(style).toContain('Minimal emoji');
    });
  });
});
