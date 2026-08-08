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

    let merchant;
    if (merchantId) {
      merchant = await Merchant.findByPk(merchantId);
    } else {
      merchant = await Merchant.findOne({ where: { phoneNumber } });
    }

    if (!merchant && message.toLowerCase().includes('start')) {
      merchant = await Merchant.create({
        phoneNumber: phoneNumber,
        businessName: 'My Kirana Store',
        language: detectLanguage(message),
        whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID
      });

      const sampleProducts = [
        { name: 'Atta', nameHindi: 'आटा', price: 45, unit: 'kg', stockQuantity: 50, merchantId: merchant.id },
        { name: 'Oil', nameHindi: 'तेल', price: 120, unit: 'litre', stockQuantity: 30, merchantId: merchant.id },
        { name: 'Sugar', nameHindi: 'चीनी', price: 42, unit: 'kg', stockQuantity: 40, merchantId: merchant.id },
        { name: 'Rice', nameHindi: 'चावल', price: 60, unit: 'kg', stockQuantity: 35, merchantId: merchant.id },
        { name: 'Dal', nameHindi: 'दाल', price: 90, unit: 'kg', stockQuantity: 25, merchantId: merchant.id }
      ];

      for (const product of sampleProducts) {
        await Product.create(product);
      }

      return res.json({
        success: true,
        merchantId: merchant.id,
        message: ' Merchant registered! 5 sample products added. Send "2kg atta bhej do" to place an order.',
        language: merchant.language
      });
    }

    if (!merchant) {
      return res.status(404).json({
        error: 'Merchant not found. Send "START" to register.'
      });
    }

    const language = merchant.language || 'hinglish';
    const parsed = parseMessage(message);

    let response = { parsed, merchantId: merchant.id };

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
          ? ' मुझे समझ नहीं आया।'
          : 'Samajh nahi aaya. Aap "2kg atta bhej do" ya "aaj kitna bikaa" pooch sakte hain.'
      };
    }

    res.json(response);
  } catch (error) {
    console.error(' Bot message error:', error);
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
    console.error(' Insight error:', error);
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
