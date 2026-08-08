const express = require('express');
const router = express.Router();

const sessionStore = require('../services/sessionStore');
const { detectRole, getMerchantById, getMerchantByBusinessPhone } = require('../services/roleService');
const { parseMessageWithFallback } = require('../services/hybridNlpService');

const { 
  createOrder, 
  getMerchantApprovalMessage, 
  approveOrder, 
  rejectOrder, 
  getRecentOrders 
} = require('../services/orderService');

const { 
  getDailySales, 
  getStockCheck, 
  getPendingPayments, 
  getWeeklyReport, 
  getTopProducts, 
  getCustomerCount 
} = require('../services/insightService');

const { sendTextMessage, sendButtonMessage } = require('../services/whatsappService');

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// ─── META WEBHOOK VERIFICATION ─────────────────────────────────────────
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log(' Webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

router.post('/', async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== 'text') return;

    const from = message.from;           // Sender's phone (e.g., "91916297026779")
    const text = message.text.body.trim();
    const businessPhone = value?.metadata?.display_phone_number; // Your WABA number

    console.log(` ${from}: ${text}`);

    // ── 1. Get or create session ───────────────────────────────────────
    let session = sessionStore.get(from);
    if (!session) {
      session = sessionStore.create(from);
      const roleInfo = await detectRole(from);
      session.role = roleInfo.role;
      session.merchantId = roleInfo.merchantId;

      if (session.role === 'unknown' && businessPhone) {
        const merchant = await getMerchantByBusinessPhone(businessPhone);
        if (merchant) {
          session.merchantId = merchant.id;
          session.role = 'customer'; // They're messaging the merchant's business number
          console.log(` Linked unknown user to merchant ${merchant.id} via business phone ${businessPhone}`);
        }
      }
      
      sessionStore.set(from, session);
    }

    const lowerText = text.toLowerCase();
    const approvalKeywords = ['yes', 'haan', 'han', 'approve', 'confirm', 'ok', 'theek hai', 'h', 'hanji', 'y'];
    const rejectKeywords = ['no', 'nahi', 'reject', 'cancel', 'mat karo', 'n', 'na', 'nope'];

    if (approvalKeywords.some(k => lowerText === k || lowerText.startsWith(k + ' '))) {
      if (session.state === 'awaiting_approval_response' && session.context.pendingOrderId) {
        const orderId = session.context.pendingOrderId;
        try {
          await approveOrder(orderId);
          await sendTextMessage(from, ' Order approve kar diya! Customer ko confirm bhej diya.');
          session.state = 'idle';
          session.context.pendingOrderId = null;
          sessionStore.set(from, session);
          return;
        } catch (err) {
          await sendTextMessage(from, ` Approval failed: ${err.message}`);
          return;
        }
      }
    }

    if (rejectKeywords.some(k => lowerText === k || lowerText.startsWith(k + ' '))) {
      if (session.state === 'awaiting_approval_response' && session.context.pendingOrderId) {
        const orderId = session.context.pendingOrderId;
        try {
          await rejectOrder(orderId, 'Merchant ne reject kiya');
          await sendTextMessage(from, ' Order reject kar diya gaya.');
          session.state = 'idle';
          session.context.pendingOrderId = null;
          sessionStore.set(from, session);
          return;
        } catch (err) {
          await sendTextMessage(from, ` Reject failed: ${err.message}`);
          return;
        }
      }
    }

    const parsed = await parseMessageWithFallback(text, session);

    if (parsed.needsClarification) {
      session.state = parsed.clarificationType === 'quantity_missing' ? 'awaiting_quantity' 
                    : parsed.clarificationType === 'brand_missing' ? 'awaiting_brand' 
                    : 'awaiting_clarification';
      
      session.context.partialOrder = parsed;
      session.context.lastQuestion = parsed.clarificationQuestion;
      session.context.lastIntent = parsed.intent;
      session.context.originalText = text;
      sessionStore.set(from, session);

      await sendTextMessage(from, ` ${parsed.clarificationQuestion}`);
      return;
    }

    if (parsed.intent === 'negation') {
      session.state = 'idle';
      session.context = { partialOrder: null, pendingOrderId: null, lastQuestion: null, customerPhone: null };
      sessionStore.set(from, session);
      await sendTextMessage(from, parsed.response);
      return;
    }

    if (session.role === 'merchant') {
      await handleMerchantMessage(from, text, parsed, session);
      return;
    }

    if (session.role === 'customer') {
      await handleCustomerMessage(from, text, parsed, session);
      return;
    }

    await handleUnknownUser(from, text, parsed, session);

  } catch (err) {
    console.error('Webhook error:', err);
  }
});

async function handleMerchantMessage(from, text, parsed, session) {
  if (parsed.intent === 'inquiry') {
    const merchantId = session.merchantId;
    let result;

    switch (parsed.inquiryType) {
      case 'daily_sales':
        result = await getDailySales(merchantId);
        break;
      case 'stock_check':
        result = await getStockCheck(merchantId);
        break;
      case 'pending_payments':
        result = await getPendingPayments(merchantId);
        break;
      case 'weekly_report':
        result = await getWeeklyReport(merchantId);
        break;
      case 'top_products':
        result = await getTopProducts(merchantId);
        break;
      case 'customer_count':
        result = await getCustomerCount(merchantId);
        break;
      case 'order_status':
        const recent = await getRecentOrders(merchantId, 5);
        result = { message: formatRecentOrders(recent) };
        break;
      default:
        result = { message: 'Aap stock check, sales report, pending payments, ya customer count pooch sakte hain.' };
    }

    await sendTextMessage(from, result.message);
    return;
  }

  if (parsed.intent === 'order') {
    await sendTextMessage(from, ' Aap merchant hain. Aap "stock check", "aaj kitna bika", ya "pending payment" pooch sakte hain.');
    return;
  }

  await sendTextMessage(from, 'Namaste! Aap stock check, sales report, pending payments, ya customer count pooch sakte hain.');
}

async function handleCustomerMessage(from, text, parsed, session) {
  if (parsed.intent === 'order') {
    try {
      const { order, orderItems, customer } = await createOrder(session.merchantId, from, parsed);
      const merchant = await getMerchantById(session.merchantId);

      if (!merchant) {
        await sendTextMessage(from, ' Dukaan wale ka number set nahi hai.');
        return;
      }

      const approvalMsg = getMerchantApprovalMessage(order, orderItems, customer);
      
      try {
        await sendButtonMessage(merchant.phoneNumber, approvalMsg, [
          { id: `approve_${order.id}`, title: ' Approve' },
          { id: `reject_${order.id}`, title: ' Reject' }
        ]);
      } catch (btnErr) {
        await sendTextMessage(merchant.phoneNumber, approvalMsg + '\n\nReply: YES or NO');
      }

      const merchantSession = sessionStore.get(merchant.phoneNumber) || sessionStore.create(merchant.phoneNumber);
      merchantSession.state = 'awaiting_approval_response';
      merchantSession.context.pendingOrderId = order.id;
      merchantSession.role = 'merchant';
      merchantSession.merchantId = merchant.id;
      sessionStore.set(merchant.phoneNumber, merchantSession);

      await sendTextMessage(from, 
        `⏳ Order mil gaya! ${merchant.storeName || 'Dukaan wale'} bhaiya jald approve karenge.\n` +
        `Aapko confirm message aa jayega. `
      );

      // Clear customer session
      session.state = 'idle';
      sessionStore.set(from, session);

    } catch (err) {
      console.error('Order creation error:', err);
      await sendTextMessage(from, ` ${err.message}`);
    }
    return;
  }

  if (parsed.intent === 'inquiry' && parsed.inquiryType === 'order_status') {
    const recent = await getRecentOrders(session.merchantId, 3);
    const myOrders = recent.filter(o => o.customer?.phoneNumber === from.replace(/\D/g, ''));
    if (myOrders.length === 0) {
      await sendTextMessage(from, 'Aapka koi recent order nahi mila.');
    } else {
      await sendTextMessage(from, formatCustomerOrders(myOrders));
    }
    return;
  }

  await sendTextMessage(from, parsed.fallbackResponse || 'Samajh nahi aaya. "2kg atta bhej do" jaise likhein.');
}

async function handleUnknownUser(from, text, parsed, session) {
  await sendTextMessage(from, 
    ` Namaste! Aap DukaanDost se baat kar rahe hain.\n\n` +
    `Dukaan wale hain? "register merchant" likhein.\n` +
    `Customer hain? Seedha order dein: "2kg atta bhej do"`
  );
}

function formatRecentOrders(orders) {
  if (orders.length === 0) return 'Koi recent order nahi hai.';
  let msg = ` Recent Orders:\n\n`;
  orders.forEach(o => {
    const emoji = o.status === 'delivered' ? '✅' : o.status === 'pending_approval' ? '⏳' : o.status === 'rejected' ? '❌' : '📦';
    msg += `${emoji} ${o.id.slice(0,8)} | ${o.customer?.name || 'Unknown'} | ₹${o.totalAmount} | ${o.status}\n`;
  });
  return msg;
}

function formatCustomerOrders(orders) {
  let msg = ` Aapke Orders:\n\n`;
  orders.forEach(o => {
    const emoji = o.status === 'delivered' ? '✅' : o.status === 'pending_approval' ? '⏳' : o.status === 'rejected' ? '❌' : '📦';
    msg += `${emoji} Order ${o.id.slice(0,8)} | ₹${o.totalAmount} | ${o.status}\n`;
  });
  return msg;
}

module.exports = router;
