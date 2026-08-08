
class PromptEngineService {
  generateSystemPrompt(persona) {
    const parts = [
      this.buildIdentity(persona),
      this.buildBusinessContext(persona),
      this.buildCommunicationStyle(persona),
      this.buildOperationalRules(persona),
      this.buildInsights(persona),
      this.buildBehavioralConstraints(persona)
    ];
    return parts.filter(Boolean).join('\n\n');
  }

  buildIdentity(persona) {
    return `You are ${persona.businessTypeDisplay}, a ${persona.businessType.toLowerCase()} owner's digital business assistant.`;
  }

  buildBusinessContext(persona) {
    const lines = [
      'BUSINESS CONTEXT:',
      `- You manage a ${persona.businessType.toLowerCase()} in India.`,
      `- Your store ${persona.deliveryEnabled ? 'offers home delivery within ' + persona.deliveryRadiusKm + 'km' : 'is pickup-only'}.`,
      `- ${persona.creditEnabled ? 'You extend credit to trusted customers up to ₹' + persona.maxCreditLimit + '.' : 'You operate on cash/UPI only, no credit.'}`,
      `- Your primary language is ${persona.primaryLanguage}.`
    ];
    return lines.join('\n');
  }

  buildCommunicationStyle(persona) {
    const tone = persona.toneProfile;
    if (!tone) return '';

    let style = 'COMMUNICATION STYLE:\n';

    if (tone.formalityLevel < 30) {
      style += `- Very casual and friendly. Use "${tone.honorificStyle}" freely.\n`;
      style += `- Use ${tone.emojiDensity} emojis per message.\n`;
      style += '- Talk like a neighbor, not a software.';
    } else if (tone.formalityLevel < 70) {
      style += `- Friendly but professional.\n`;
      style += `- Use "${tone.honorificStyle}" with respect.\n`;
      style += `- Use ${Math.floor(tone.emojiDensity / 2)} emojis per message.`;
    } else {
      style += `- Very formal and respectful.\n`;
      style += `- Use "${tone.honorificStyle}" or "Sir/Madam".\n`;
      style += '- Minimal emoji usage (0-1 per message).';
    }

    return style;
  }

  buildOperationalRules(persona) {
    const rules = [];

    if (persona.deliveryEnabled) {
      rules.push('- Track delivery status: Received → Confirmed → Packed → Out for Delivery → Delivered.');
    } else {
      rules.push('- Track pickup status: Received → Confirmed → Packed → Ready for Pickup → Picked Up.');
    }

    if (persona.creditEnabled) {
      rules.push('- Maintain an "udhaar book". Flag customers nearing their credit limit.');
    }

    if (persona.businessType === 'PHARMACY') {
      rules.push('- NEVER sell prescription medicines without valid prescription mention.');
      rules.push('- Track medicine expiry dates. Alert 30 days before expiry.');
    }

    if (persona.businessType === 'BAKERY') {
      rules.push('- Track pre-orders with pickup time slots.');
      rules.push('- Flag perishable items with short shelf life.');
    }

    if (persona.businessType === 'TAILOR') {
      rules.push('- Maintain measurement logs for each customer.');
      rules.push('- Track alteration deadlines strictly.');
    }

    return 'OPERATIONAL RULES:\n' + rules.join('\n');
  }

  buildInsights(persona) {
    if (!persona.insightConfig) return '';
    const active = Object.entries(persona.insightConfig)
      .filter(([_, v]) => v === true)
      .map(([k]) => `- ${k.replace(/([A-Z])/g, ' $1').trim()}`);

    if (active.length === 0) return '';
    return 'INSIGHTS YOU PROVIDE:\n' + active.join('\n');
  }

  buildBehavioralConstraints(persona) {
    return `BEHAVIORAL CONSTRAINTS:
- NEVER ask the merchant to download an app. Everything happens on WhatsApp.
- If a customer asks for business insights (sales, stock, payments), politely redirect them to the merchant.
- Keep responses under 3 WhatsApp bubbles (max 400 characters each).
- Use the merchant's preferred greeting style: "${persona.greetingTemplate}".
- For unknown queries, use your best judgment but stay within the business context.`;
  }
}

module.exports = { PromptEngineService };
