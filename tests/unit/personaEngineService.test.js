const { PersonaEngineService } = require('../../services/personaEngineService');

describe('PersonaEngineService', () => {
  let service;

  beforeEach(() => {
    service = new PersonaEngineService();
  });

  describe('generatePersona', () => {
    it('should generate a complete kirana store persona from questionnaire', () => {
      const questionnaire = {
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

      const persona = service.generatePersona(questionnaire);

      expect(persona.businessType).toBe('KIRANA');
      expect(persona.businessTypeDisplay).toBe('Ramesh General Store');
      expect(persona.deliveryEnabled).toBe(true);
      expect(persona.deliveryRadiusKm).toBe(2);
      expect(persona.creditEnabled).toBe(true);
      expect(parseFloat(persona.maxCreditLimit)).toBe(2000);
      expect(persona.primaryLanguage).toBe('hinglish');
      expect(persona.greetingTemplate).toBe('Namaste');
      expect(persona.systemPrompt).toBeDefined();
      expect(persona.systemPrompt.length).toBeGreaterThan(100);
      expect(persona.systemPrompt).toContain('Ramesh General Store');
      expect(persona.systemPrompt).toContain('kirana');
      expect(persona.systemPrompt).toContain('home delivery within 2km');
      expect(persona.systemPrompt).toContain('₹2000');
      expect(persona.systemPrompt).toContain('COMMUNICATION STYLE');
      expect(persona.systemPrompt).toContain('OPERATIONAL RULES');
      expect(persona.systemPrompt).toContain('BEHAVIORAL CONSTRAINTS');
    });

    it('should generate a pharmacy persona with prescription rules', () => {
      const questionnaire = {
        storeName: 'Gupta Medical Store',
        businessType: 'pharmacy',
        topProducts: ['Paracetamol', 'Cough Syrup'],
        aov: 300,
        deliveryEnabled: false,
        tone: 'formal',
        primaryLanguage: 'hi',
        creditEnabled: false,
        operatingHours: { open: '09:00', close: '21:00' }
      };

      const persona = service.generatePersona(questionnaire);

      expect(persona.businessType).toBe('PHARMACY');
      expect(persona.insightConfig.expiryAlerts).toBe(true);
      expect(persona.toneProfile.formalityLevel).toBe(75);
      expect(persona.toneProfile.honorificStyle).toBe('ji');
      expect(persona.systemPrompt).toContain('prescription');
      expect(persona.systemPrompt).toContain('pickup-only');
      expect(persona.systemPrompt).toContain('cash/UPI only');
      expect(persona.quickReplyDefaults).toContain('Upload Prescription');
    });

    it('should generate a bakery persona with pre-order alerts', () => {
      const questionnaire = {
        storeName: 'Sweet Crust Bakery',
        businessType: 'bakery',
        topProducts: ['Cake', 'Bread'],
        aov: 400,
        deliveryEnabled: true,
        deliveryRadius: 5,
        tone: 'casual',
        primaryLanguage: 'en',
        creditEnabled: false,
        operatingHours: { open: '06:00', close: '20:00' }
      };

      const persona = service.generatePersona(questionnaire);

      expect(persona.businessType).toBe('BAKERY');
      expect(persona.insightConfig.preOrderAlerts).toBe(true);
      expect(persona.insightConfig.expiryAlerts).toBe(true);
      expect(persona.toneProfile.formalityLevel).toBe(15);
      expect(persona.toneProfile.emojiDensity).toBe(4);
      expect(persona.systemPrompt).toContain('pre-orders');
      expect(persona.systemPrompt).toContain('perishable');
    });

    it('should handle minimal questionnaire with defaults', () => {
      const questionnaire = {
        storeName: 'Test Store',
        businessType: 'general store'
      };

      const persona = service.generatePersona(questionnaire);

      expect(persona.businessType).toBe('GENERAL STORE');
      expect(persona.deliveryEnabled).toBe(false);
      expect(persona.creditEnabled).toBe(false);
      expect(persona.primaryLanguage).toBe('hinglish');
      expect(persona.toneProfile.formalityLevel).toBe(45);
    });

    it('should seed default catalog when topProducts not provided', () => {
      const questionnaire = {
        storeName: 'Kirana',
        businessType: 'kirana'
      };

      const persona = service.generatePersona(questionnaire);

      expect(persona.defaultCatalog).toBeDefined();
      expect(persona.defaultCatalog.length).toBe(5);
      expect(persona.defaultCatalog[0].name).toBe('Atta');
    });

    it('should use provided topProducts for catalog', () => {
      const questionnaire = {
        storeName: 'Custom',
        businessType: 'kirana',
        topProducts: ['Maggi', 'Pasta']
      };

      const persona = service.generatePersona(questionnaire);

      expect(persona.defaultCatalog.length).toBe(2);
      expect(persona.defaultCatalog[0].name).toBe('Maggi');
    });
  });

  describe('buildToneProfile', () => {
    it('should return friendly profile for unknown tone', () => {
      const profile = service.buildToneProfile('unknown');
      expect(profile.formalityLevel).toBe(45);
      expect(profile.emojiDensity).toBe(2);
    });

    it('should return very_formal profile', () => {
      const profile = service.buildToneProfile('very_formal');
      expect(profile.formalityLevel).toBe(95);
      expect(profile.honorificStyle).toBe('Sir/Madam');
    });
  });

  describe('buildInsightConfig', () => {
    it('should include expiry alerts for pharmacy', () => {
      const config = service.buildInsightConfig('pharmacy');
      expect(config.expiryAlerts).toBe(true);
      expect(config.preOrderAlerts).toBe(false);
    });

    it('should include both alerts for bakery', () => {
      const config = service.buildInsightConfig('bakery');
      expect(config.expiryAlerts).toBe(true);
      expect(config.preOrderAlerts).toBe(true);
    });

    it('should return base config for unknown type', () => {
      const config = service.buildInsightConfig('unknown');
      expect(config.morningBriefing).toBe(true);
      expect(config.expiryAlerts).toBeUndefined();
    });
  });

  describe('getGreetingTemplate', () => {
    it('should return Vanakkam for tamil', () => {
      expect(service.getGreetingTemplate('tamil')).toBe('Vanakkam');
    });

    it('should return Namaste as default', () => {
      expect(service.getGreetingTemplate('unknown')).toBe('Namaste');
    });
  });
});
