require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const webhookRoutes = require('./routes/webhook');
const botRoutes = require('./routes/bot');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

app.get('/health', (req, res) => {
  res.json({
    status: '✅ DukaanDost API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0-hackathon'
  });
});

app.use('/webhook', webhookRoutes);
app.use('/bot', botRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'DukaanDost API',
    description: 'WhatsApp-first business management for Indian kirana stores',
    endpoints: {
      health: 'GET /health',
      webhook: 'GET/POST /webhook',
      bot: 'POST /bot/message',
      insight: 'POST /bot/insight',
      parse: 'GET /bot/parse?message=your+text'
    }
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║     🚀 DUKAANDOST API v1.0.0              ║');
    console.log('║     WhatsApp-first Kirana Platform        ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Webhook URL: ${process.env.NGROK_URL || 'Set NGROK_URL in .env'}/webhook`);
    console.log(`📋 Health Check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('🎯 Quick Test:');
    console.log(`   curl http://localhost:${PORT}/health`);
    console.log(`   curl "http://localhost:${PORT}/bot/parse?message=2kg+atta+bhej+do"`);
    console.log('');
  });
};

startServer();
