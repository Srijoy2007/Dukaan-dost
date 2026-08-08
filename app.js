
const express = require('express');
const app = express();

app.use(express.json());

// Mount your routes
const merchantRoutes = require('../routes/merchant');
app.use('/v1/merchants', merchantRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// WhatsApp webhook endpoint
app.post('/webhooks/whatsapp/:merchantId', async (req, res) => {
  const { merchantId } = req.params;
  const { from, message } = req.body;

  console.log(`📩 Message from ${from} to merchant ${merchantId}: ${message}`);

  // Simple echo + persona-aware response
  res.json({
    success: true,
    merchantId,
    from,
    message,
    reply: `Namaste! Aapne kaha: "${message}". Main aapki madad kar sakta hoon.`
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 DukaanDost server running on http://localhost:${PORT}`);
  console.log(`📋 Merchant registration: POST http://localhost:${PORT}/v1/merchants/register`);
  console.log(`💬 Chat with bot: POST http://localhost:${PORT}/webhooks/whatsapp/{merchantId}`);
});

module.exports = app;
EOF
