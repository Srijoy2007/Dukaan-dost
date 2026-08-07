const express = require('express');
const router = express.Router();
const { parseMessage, detectLanguage } = require('../services/nlpService');
const { createOrder, getOrderConfirmationMessage } = require('../services/orderService');
const { getInsight } = require('../services/insightService');
const { createUPIPayment } = require('../services/paymentService');
const { sendTextMessage, sendImageMessage } = require('../services/whatsappService');
const { Merchant, Order, Product } = require('../models');

router.post('/message', async (req, res) => {
  try {
    const { phoneNumber, message, merchantId } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'phoneNumber and message required' });
    }

    const merchant = await Merchant.findByPk(merchantId || (await Merchant.findOne()).id);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    const language = merchant.language || 'hinglish';
    const parsed = parseMessage(message);

    let response = { parsed };

    if (parsed.intent === 'order') {
      const { order, orderItems } = await createOrder(merchant.id, phoneNumber, parsed);
      const payment = await createUPIPayment(order.id, order.totalAmount, phoneNumber, merchant.upiId);
      
      await Order.update(
        { upiQrUrl: payment.qrCodeUrl },
        { where: { id: order.id } }
      );

      response = {
        ...response,
        order,
        confirmationMessage: getOrderConfirmationMessage(order, orderItems, language),
        paymentUrl: payment.qrCodeUrl
      };
    } else if (parsed.intent === 'inquiry') {
      const insight = await getInsight(merchant.id, parsed.inquiryType, language);
      response = { ...response, insight };
    } else {
      response = {
        ...response,
        message: language === 'hindi'
          ? '❓ मुझे समझ नहीं आया।'
          : '❓ Samajh nahi aaya.'
      };
    }

    res.json(response);
  } catch (error) {
    console.error('❌ Bot message error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/insight', async (req, res) => {
  try {
    const { merchantId, inquiryType, language } = req.body;
    
    if (!merchantId || !inquiryType) {
      return res.status(400).json({ error: 'merchantId and inquiryType required' });
    }

    const insight = await getInsight(merchantId, inquiryType, language || 'hinglish');
    res.json({ insight, inquiryType, language: language || 'hinglish' });
  } catch (error) {
    console.error('❌ Insight error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/parse', (req, res) => {
  const { message } = req.query;
  if (!message) {
    return res.status(400).json({ error: 'message query param required' });
  }

  const parsed = parseMessage(message);
  const language = detectLanguage(message);

  res.json({ message, parsed, detectedLanguage: language });
});

module.exports = router;
