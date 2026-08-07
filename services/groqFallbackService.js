const axios = require('axios');
const { PRODUCT_SYNONYMS } = require('./nlpService');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
// Fast + cheap model, good fit for a structured-JSON classification task.
// Check console.groq.com/docs/models for the current list if this gets deprecated.
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const PRODUCT_KEYS = Object.keys(PRODUCT_SYNONYMS);
const INQUIRY_TYPES = [
  'daily_sales', 'stock_check', 'pending_payments',
  'weekly_report', 'customer_count', 'top_products'
];

const SYSTEM_PROMPT = `You are a message parser for an Indian kirana (grocery) store WhatsApp bot.
Customers place orders, merchants ask business questions. Messages come in Hindi, Hinglish, or English.

Return ONLY valid JSON, no markdown fences, no explanation. Match this exact shape:

{
  "intent": "order" | "inquiry" | "negation" | "unknown",
  "items": [{ "product": "<one of: ${PRODUCT_KEYS.join(', ')}>", "quantity": <number>, "unit": "kg"|"gram"|"litre"|"ml"|"piece"|"dozen" }],
  "inquiryType": "<one of: ${INQUIRY_TYPES.join(', ')}>" | null,
  "needsClarification": <boolean>,
  "clarificationQuestion": "<short Hinglish question, or null>",
  "confidence": <number between 0 and 1>
}

Rules:
- "product" must be one of the listed keys only. If the product isn't in that list, omit the item and set needsClarification true with a question asking what they want.
- If quantity is genuinely unclear or missing, set needsClarification true.
- "negation" is for messages cancelling/declining an order ("nahi chahiye", "cancel karo").
- "unknown" is for greetings, small talk, or anything unrelated to ordering/business queries.
- Multiple items in one message should each be a separate entry in "items".
- Respond with nothing but the JSON object.`;

/**
 * Calls Groq (Llama 3.3 70B) to parse a message the local regex/keyword
 * parser couldn't handle confidently. Returns the same shape as
 * nlpService.parseMessage() so callers don't need to branch on which
 * parser ran.
 *
 * Returns null on any failure (missing key, network error, bad JSON) so the
 * caller can gracefully fall back to the generic "didn't understand" reply
 * instead of crashing the webhook handler.
 */
const parseWithGroq = async (text) => {
  if (!GROQ_API_KEY) {
    console.warn('⚠️  GROQ_API_KEY not set — skipping Groq fallback.');
    return null;
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: 'json_object' } // Groq supports OpenAI-style JSON mode
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 6000 // Groq is fast (LPU inference) but don't let a network hiccup stall the demo
      }
    );

    const rawText = response.data?.choices?.[0]?.message?.content || '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Basic shape validation — don't trust the model blindly
    if (!parsed.intent || !['order', 'inquiry', 'negation', 'unknown'].includes(parsed.intent)) {
      console.warn('⚠️  Groq returned unexpected shape:', cleaned);
      return null;
    }

    return {
      ...parsed,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      originalText: text,
      source: 'groq_fallback'
    };
  } catch (err) {
    console.error('❌ Groq fallback failed:', err.response?.data || err.message);
    return null;
  }
};

module.exports = { parseWithGroq };
