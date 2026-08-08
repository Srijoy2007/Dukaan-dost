
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const merchantRoutes = require('./routes/merchant');
app.use('/v1/merchants', merchantRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// WhatsApp webhook
app.post('/webhooks/whatsapp/:merchantId', async (req, res) => {
  const { merchantId } = req.params;
  const { from, message } = req.body;

  console.log(`📩 [${merchantId}] ${from}: ${message}`);

  res.json({
    success: true,
    merchantId,
    from,
    message,
    reply: `Namaste! Aapne kaha: "${message}". Main aapki madad kar sakta hoon.`
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 DukaanDost server running on http://localhost:${PORT}`);
  console.log(`📋 Register: POST http://localhost:${PORT}/v1/merchants/register`);
  console.log(`💬 Webhook: POST http://localhost:${PORT}/webhooks/whatsapp/{merchantId}`);
});
// ============================================
// GENERIC /webhook route (for Meta/testing)
// ============================================

// Meta webhook verification (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WEBHOOK_SECRET) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Incoming messages (POST)
app.post('/webhook', async (req, res) => {
  const body = req.body;

  console.log('📩 Webhook received:', JSON.stringify(body, null, 2));

  // Meta sends messages in entry.changes[0].value.messages
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const messages = value?.messages;

  if (messages && messages.length > 0) {
    const msg = messages[0];
    const from = msg.from;
    const text = msg.text?.body || '';

    console.log(`💬 From ${from}: ${text}`);

    // Simple reply
    return res.json({
      success: true,
      reply: `Namaste! Aapne kaha: "${text}". Main aapki madad kar sakta hoon.`
    });
  }

  res.sendStatus(200);
});

module.exports = app;
