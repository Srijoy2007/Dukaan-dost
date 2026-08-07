const axios = require('axios');

const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

const sendTextMessage = async (to, text) => {
  try {
    await axios.post(WHATSAPP_API_URL, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text }
    }, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('WhatsApp sendText failed:', err.response?.data || err.message);
  }
};

const sendButtonMessage = async (to, text, buttons) => {
  try {
    await axios.post(WHATSAPP_API_URL, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text },
        action: {
          buttons: buttons.map((b, i) => ({
            type: 'reply',
            reply: { id: b.id || `btn_${i}`, title: b.title }
          }))
        }
      }
    }, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('WhatsApp sendButton failed:', err.response?.data || err.message);
  }
};

const sendTemplateMessage = async (to, templateName, languageCode = 'en') => {
  try {
    await axios.post(WHATSAPP_API_URL, {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: { name: templateName, language: { code: languageCode } }
    }, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('WhatsApp sendTemplate failed:', err.response?.data || err.message);
  }
};

module.exports = {
  sendTextMessage,
  sendButtonMessage,
  sendTemplateMessage
};
