const Razorpay = require('razorpay');
const { Order } = require('../models');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createUPIPayment = async (orderId, amount, customerPhone, merchantUpiId) => {
  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `order_${orderId.slice(0, 8)}`,
      notes: {
        orderId: orderId,
        customerPhone: customerPhone
      }
    });

    await Order.update(
      { razorpayOrderId: razorpayOrder.id },
      { where: { id: orderId } }
    );

    const upiUrl = `upi://pay?pa=${merchantUpiId || 'test@upi'}&pn=DukaanDost&am=${amount}&cu=INR&tn=Order_${orderId.slice(0, 8)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      upiUrl: upiUrl,
      qrCodeUrl: qrCodeUrl,
      expiryTime: 15 * 60
    };
  } catch (error) {
    console.error('❌ Payment creation failed:', error);
    throw error;
  }
};

const verifyPayment = async (razorpayPaymentId, razorpayOrderId, razorpaySignature) => {
  try {
    const crypto = require('crypto');
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    if (isValid) {
      await Order.update(
        { paymentStatus: 'paid', razorpayPaymentId },
        { where: { razorpayOrderId } }
      );
    }

    return { isValid, status: isValid ? 'paid' : 'failed' };
  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    throw error;
  }
};

const getPaymentStatus = async (razorpayOrderId) => {
  try {
    const order = await razorpay.orders.fetch(razorpayOrderId);
    return {
      status: order.status,
      amount: order.amount / 100,
      attempts: order.attempts
    };
  } catch (error) {
    console.error('❌ Fetch payment status failed:', error);
    throw error;
  }
};

module.exports = {
  createUPIPayment,
  verifyPayment,
  getPaymentStatus
};
