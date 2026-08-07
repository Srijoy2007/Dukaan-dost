const { Op } = require('sequelize');
const { Order, OrderItem, Product, Customer, Merchant } = require('../models');
const { sendTextMessage, sendButtonMessage, sendTemplateMessage } = require('./whatsappService');

const createOrder = async (merchantId, customerPhone, parsedMessage) => {
  try {
    // Find or create customer
    let customer = await Customer.findOne({
      where: { phoneNumber: customerPhone, merchantId }
    });

    if (!customer) {
      customer = await Customer.create({
        phoneNumber: customerPhone,
        merchantId,
        name: customerPhone,
        totalOrders: 0,
        totalSpent: 0
      });
    }

    // Get merchant's active products
    const products = await Product.findAll({ where: { merchantId, isActive: true } });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of parsedMessage.items) {
      // Match by product name OR brand
      const product = products.find(p => {
        const nameMatch = p.name.toLowerCase() === item.product.toLowerCase() ||
          (p.nameHindi && p.nameHindi.toLowerCase() === item.product.toLowerCase());
        const brandMatch = item.brand && p.brand && p.brand.toLowerCase() === item.brand.toLowerCase();
        // If brand specified, both must match. If no brand, just name match.
        if (item.brand) return nameMatch && brandMatch;
        return nameMatch;
      });

      if (!product) {
        console.warn(`Product not found: ${item.product} (brand: ${item.brand})`);
        continue;
      }

      // Check stock
      if (product.stockQuantity < item.quantity) {
        throw new Error(`Stock kam hai! ${product.name} sirf ${product.stockQuantity} ${product.unit} bacha hai.`);
      }

      const unitPrice = parseFloat(product.price);
      const quantity = parseFloat(item.quantity);
      const totalPrice = unitPrice * quantity;

      orderItems.push({
        productId: product.id,
        quantity,
        unitPrice,
        totalPrice,
        product: { 
          name: product.name, 
          unit: product.unit,
          brand: product.brand 
        }
      });

      totalAmount += totalPrice;

      // Deduct stock (or do this after approval — your call. Doing it now prevents oversell)
      product.stockQuantity -= quantity;
      await product.save();
    }

    if (orderItems.length === 0) {
      throw new Error('Koi valid product nahi mila. Product naam ya brand check karein.');
    }

    // Create order with status 'pending_approval' instead of 'received'
    const order = await Order.create({
      merchantId,
      customerId: customer.id,
      totalAmount,
      status: 'pending_approval',  // ← Merchant must approve before confirming
      paymentStatus: 'pending',
      paymentMethod: 'upi'
    });

    for (const item of orderItems) {
      await OrderItem.create({
        productId: item.productId,
        orderId: order.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      });
    }

    // Update customer stats
    customer.totalOrders += 1;
    customer.totalSpent = parseFloat(customer.totalSpent || 0) + totalAmount;
    customer.lastOrderDate = new Date();
    await customer.save();

    return { order, orderItems, customer };
  } catch (error) {
    console.error('❌ Create order failed:', error);
    throw error; // Let webhook handle the error message
  }
};

const getOrderConfirmationMessage = (order, items, language = 'hinglish') => {
  const itemList = items.map(item =>
    `• ${item.product.brand ? item.product.brand + ' ' : ''}${item.product.name}: ${item.quantity} ${item.product.unit} × ₹${item.unitPrice} = ₹${item.totalPrice}`
  ).join('\n');

  if (language === 'hindi') {
    return `✅ आर्डर कन्फर्म!\n\n` +
      `ऑर्डर ID: ${order.id.slice(0, 8)}\n` +
      `${itemList}\n\n` +
      `कुल: ₹${order.totalAmount}\n` +
      `भुगतान: UPI QR भेजा जा रहा है\n` +
      `धन्यवाद! 🙏`;
  }

  return `✅ Order Confirmed!\n\n` +
    `Order ID: ${order.id.slice(0, 8)}\n` +
    `${itemList}\n\n` +
    `Total: ₹${order.totalAmount}\n` +
    `Payment: UPI QR bheja ja raha hai\n` +
    `Shukriya! 🙏`;
};

// Message sent to MERCHANT when a new order comes in (for approval)
const getMerchantApprovalMessage = (order, items, customer) => {
  const itemList = items.map(item =>
    `• ${item.product.brand ? item.product.brand + ' ' : ''}${item.product.name}: ${item.quantity} ${item.product.unit}`
  ).join('\n');

  return `🛒 *Naya Order Aaya!*\n\n` +
    `Customer: ${customer.name || customer.phoneNumber}\n` +
    `Order ID: ${order.id.slice(0, 8)}\n\n` +
    `${itemList}\n\n` +
    `💰 Total: ₹${order.totalAmount}\n\n` +
    `Approve karein? 👇`;
};

const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: Customer, as: 'customer' },
      { model: Merchant, as: 'merchant' },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
    ]
  });

  if (!order) throw new Error('Order not found');

  order.status = status;
  await order.save();

  // Notify customer on status change
  const statusMessages = {
    confirmed: 'Aapka order confirm ho gaya hai! 🎉 Ab UPI se payment kar sakte hain.',
    packed: 'Aapka order pack ho gaya hai! 📦 Jald delivery hogi.',
    out_for_delivery: 'Aapka order delivery ke liye nikal gaya hai! 🚚\n' + generateTrackingLink(order),
    delivered: 'Aapka order deliver ho gaya hai! Dhanyawad! 🙏\nAapka feedback bahut maayne rakhta hai.'
  };

  if (statusMessages[status]) {
    await sendTextMessage(order.customer.phoneNumber, statusMessages[status]);
  }

  return order;
};

// Generate a simple tracking map link (uses Google Maps with dummy coords or your own)
const generateTrackingLink = (order) => {
  // In production, you'd store lat/lng and generate a real map
  // For now, generate a branded tracking page link
  const baseUrl = process.env.TRACKING_BASE_URL || 'https://dukandost.in/track';
  return `\n📍 Track karein: ${baseUrl}/${order.id}`;
};

const approveOrder = async (orderId) => {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: Customer, as: 'customer' },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
    ]
  });

  if (!order) throw new Error('Order not found');
  if (order.status !== 'pending_approval') throw new Error('Order already processed');

  order.status = 'confirmed';
  await order.save();

  // Send confirmation to customer with UPI QR
  const msg = getOrderConfirmationMessage(order, order.items, 'hinglish');
  await sendTextMessage(order.customer.phoneNumber, msg);

  // Send UPI QR / payment link
  await sendPaymentLink(order);

  return order;
};

const rejectOrder = async (orderId, reason = '') => {
  const order = await Order.findByPk(orderId, {
    include: [{ model: Customer, as: 'customer' }]
  });

  if (!order) throw new Error('Order not found');

  // Restore stock
  const items = await OrderItem.findAll({ where: { orderId } });
  for (const item of items) {
    const product = await Product.findByPk(item.productId);
    if (product) {
      product.stockQuantity += item.quantity;
      await product.save();
    }
  }

  order.status = 'rejected';
  await order.save();

  const rejectMsg = reason 
    ? `Maaf kijiye, aapka order reject ho gaya hai. Reason: ${reason}`
    : `Maaf kijiye, aapka order abhi accept nahi kiya ja sakta. Kripya baad mein try karein.`;
  
  await sendTextMessage(order.customer.phoneNumber, rejectMsg);
  return order;
};

const sendPaymentLink = async (order) => {
  // Integrate Razorpay / Cashfree here to generate UPI intent + QR
  // For now, placeholder
  const paymentMsg = `💳 Payment karein:\nUPI ID: ${order.merchant.upiId || 'merchant@upi'}\nAmount: ₹${order.totalAmount}\n\nQR Code jald bheja jayega!`;
  await sendTextMessage(order.customer.phoneNumber, paymentMsg);
};

const getRecentOrders = async (merchantId, limit = 10) => {
  return await Order.findAll({
    where: { merchantId },
    include: [
      { model: Customer, as: 'customer', attributes: ['name', 'phoneNumber'] },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
    ],
    order: [['createdAt', 'DESC']],
    limit
  });
};

module.exports = {
  createOrder,
  getOrderConfirmationMessage,
  getMerchantApprovalMessage,
  updateOrderStatus,
  approveOrder,
  rejectOrder,
  sendPaymentLink,
  generateTrackingLink,
  getRecentOrders
};
