
const { PromptEngineService } = require('./promptEngineService');

class PersonaEngineService {
  constructor() {
    this.promptEngine = new PromptEngineService();
  }

  generatePersona(questionnaire) {
    const {
      storeName,
      businessType,
      topProducts = [],
      aov = 500,
      deliveryEnabled = false,
      deliveryRadius = 0,
      tone = 'friendly',
      primaryLanguage = 'hinglish',
      creditEnabled = false,
      creditLimit = 0,
      operatingHours = {}
    } = questionnaire;

    const normalizedType = businessType.toString().toLowerCase().trim();
    const toneProfile = this.buildToneProfile(tone);
    const insightConfig = this.buildInsightConfig(normalizedType);
    const greetingTemplate = this.getGreetingTemplate(primaryLanguage);

    const personaPayload = {
      businessType: normalizedType.toUpperCase(),
      businessTypeDisplay: storeName,
      deliveryEnabled: !!deliveryEnabled,
      deliveryRadiusKm: deliveryEnabled ? parseInt(deliveryRadius) || 1 : null,
      creditEnabled: !!creditEnabled,
      maxCreditLimit: creditEnabled ? parseFloat(creditLimit) || 0 : null,
      primaryLanguage: primaryLanguage.toLowerCase().trim(),
      toneProfile,
      operatingHours,
      insightConfig,
      greetingTemplate,
      quickReplyDefaults: this.getQuickReplies(normalizedType, tone),
      defaultCatalog: this.buildDefaultCatalog(normalizedType, topProducts)
    };

    // Generate the dynamic system prompt
    personaPayload.systemPrompt = this.promptEngine.generateSystemPrompt(personaPayload);

    return personaPayload;
  }

  buildToneProfile(tone) {
    const profiles = {
      casual: {
        formalityLevel: 15,
        emojiDensity: 4,
        honorificStyle: 'bhaiya',
        greetingStyle: 'Ram Ram'
      },
      friendly: {
        formalityLevel: 45,
        emojiDensity: 2,
        honorificStyle: 'bhaiya',
        greetingStyle: 'Namaste'
      },
      formal: {
        formalityLevel: 75,
        emojiDensity: 1,
        honorificStyle: 'ji',
        greetingStyle: 'Namaste'
      },
      very_formal: {
        formalityLevel: 95,
        emojiDensity: 0,
        honorificStyle: 'Sir/Madam',
        greetingStyle: 'Pranam'
      }
    };

    return profiles[tone] || profiles.friendly;
  }

  buildInsightConfig(businessType) {
    const base = {
      morningBriefing: true,
      midDayPulse: false,
      eveningSettlement: true,
      weeklyVoiceSummary: false,
      lowStockAlerts: true,
      paymentReminders: true
    };

    const specific = {
      pharmacy: { expiryAlerts: true, preOrderAlerts: false },
      bakery: { expiryAlerts: true, preOrderAlerts: true },
      tailor: { preOrderAlerts: true, expiryAlerts: false },
      kirana: { expiryAlerts: false, preOrderAlerts: false },
      stationery: { expiryAlerts: false, preOrderAlerts: false },
      'general store': { expiryAlerts: false, preOrderAlerts: false }
    };

    return { ...base, ...(specific[businessType] || {}) };
  }

  getGreetingTemplate(lang) {
    const map = {
      hi: 'Namaste',
      en: 'Hello',
      hinglish: 'Namaste',
      tamil: 'Vanakkam',
      telugu: 'Namaskaram',
      marathi: 'Namaskar',
      bengali: 'Nomoshkar',
      gujarati: 'Jai Shree Krishna'
    };
    return map[lang] || 'Namaste';
  }

  getQuickReplies(businessType, tone) {
    const isCasual = tone === 'casual' || tone === 'friendly';
    const casual = ['Haan bhaiya', 'Nahi', 'Thoda wait karo', 'Theek hai'];
    const formal = ['Yes', 'No', 'Please wait', 'Confirmed'];
    const replies = isCasual ? casual : formal;

    if (businessType === 'pharmacy') {
      return [...replies, isCasual ? 'Prescription upload karein' : 'Upload Prescription'];
    }
    if (businessType === 'bakery') {
      return [...replies, isCasual ? 'Pre-order karna hai' : 'Place Pre-order'];
    }

    return replies;
  }

  buildDefaultCatalog(businessType, topProducts) {
    if (topProducts && topProducts.length > 0) {
      return topProducts.map((name, idx) => ({
        id: `seed-${idx}`,
        name,
        normalizedName: name.toLowerCase().replace(/\s+/g, '_'),
        price: 50,
        unit: 'piece',
        stockQuantity: 100
      }));
    }

    const defaults = {
      kirana: ['Atta', 'Oil', 'Sugar', 'Dal', 'Rice'],
      pharmacy: ['Paracetamol', 'Cough Syrup', 'Bandages', 'Antiseptic', 'ORS'],
      bakery: ['Bread', 'Cake', 'Pastry', 'Biscuit', 'Cream Roll'],
      stationery: ['Notebook', 'Pen', 'Pencil', 'Eraser', 'Sharpener'],
      tailor: ['Stitching', 'Alteration', 'Button', 'Zip', 'Hemming']
    };

    const products = defaults[businessType] || defaults.kirana;
    return products.map((name, idx) => ({
      id: `seed-${idx}`,
      name,
      normalizedName: name.toLowerCase().replace(/\s+/g, '_'),
      price: 50,
      unit: 'piece',
      stockQuantity: 100
    }));
  }
}

module.exports = { PersonaEngineService };
