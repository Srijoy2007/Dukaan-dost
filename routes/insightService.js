const { Op } = require('sequelize');
const { Order, OrderItem, Product, Customer } = require('../models');

const getDailySales = async (merchantId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // FIX: Removed Payment include — Order table already has paymentStatus & paymentMethod
  const orders = await Order.findAll({
    where: {
      merchantId,
      createdAt: { [Op.between]: [startOfDay, endOfDay] },
      status: { [Op.notIn]: ['rejected', 'pending_approval'] }
    }
  });

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
  const cashTotal = orders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
  const upiTotal = orders.filter(o => o.paymentMethod === 'upi').reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
  const pendingPayments = orders.filter(o => o.paymentStatus === 'pending').length;

  return {
    totalOrders,
    totalRevenue,
    cashTotal,
    upiTotal,
    pendingPayments,
    message: `📊 Aaj ka hisaab:\n` +
      `• Orders: ${totalOrders}\n` +
      `• Total: ₹${totalRevenue}\n` +
      `• Cash: ₹${cashTotal} | UPI: ₹${upiTotal}\n` +
      `• Pending Payments: ${pendingPayments}`
  };
};

const getStockCheck = async (merchantId) => {
  const products = await Product.findAll({
    where: { merchantId, isActive: true },
    order: [['stockQuantity', 'ASC']]
  });

  if (products.length === 0) return { message: 'Koi product nahi mila. Pehle catalog add karein.' };

  let msg = `📦 Stock Status:\n\n`;
  for (const p of products) {
    const status = p.stockQuantity <= (p.lowStockThreshold || 5) ? '⚠️ LOW' : '✅ OK';
    msg += `• ${p.name}: ${p.stockQuantity} ${p.unit} ${status}\n`;
  }
  return { message: msg };
};

const getPendingPayments = async (merchantId) => {
  const orders = await Order.findAll({
    where: {
      merchantId,
      paymentStatus: 'pending',
      status: { [Op.notIn]: ['rejected', 'pending_approval'] }
    },
    include: [{ model: Customer, as: 'customer' }],
    order: [['createdAt', 'ASC']]
  });

  if (orders.length === 0) return { message: '✅ Sab payment aa gaye! Koi pending nahi hai.' };

  let msg = `💰 Pending Payments:\n\n`;
  let totalPending = 0;
  for (const o of orders) {
    const days = Math.floor((Date.now() - new Date(o.createdAt)) / (1000 * 60 * 60 * 24));
    msg += `• ${o.customer?.name || o.customer?.phoneNumber || 'Unknown'}: ₹${o.totalAmount} (${days} din pending)\n`;
    totalPending += parseFloat(o.totalAmount);
  }
  msg += `\nTotal Pending: ₹${totalPending}`;
  return { message: msg };
};

const getWeeklyReport = async (merchantId) => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const orders = await Order.findAll({
    where: {
      merchantId,
      createdAt: { [Op.gte]: startOfWeek },
      status: { [Op.notIn]: ['rejected', 'pending_approval'] }
    }
  });

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const avgOrder = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

  return {
    message: `📈 Is hafte ka report:\n` +
      `• Total Orders: ${totalOrders}\n` +
      `• Total Revenue: ₹${totalRevenue}\n` +
      `• Average Order: ₹${avgOrder}\n` +
      `• Best Day: ${getBestDay(orders)}`
  };
};

const getTopProducts = async (merchantId) => {
  const items = await OrderItem.findAll({
    include: [
      { model: Product, as: 'product', where: { merchantId } },
      { 
        model: Order, 
        as: 'order', 
        where: { status: { [Op.notIn]: ['rejected', 'pending_approval'] } } 
      }
    ]
  });

  const productSales = {};
  for (const item of items) {
    const name = item.product.name;
    productSales[name] = (productSales[name] || 0) + item.quantity;
  }

  const sorted = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sorted.length === 0) return { message: 'Abhi koi sales data nahi hai.' };

  let msg = `🏆 Top Products:\n\n`;
  sorted.forEach(([name, qty], i) => {
    msg += `${i + 1}. ${name}: ${qty} sold\n`;
  });
  return { message: msg };
};

const getCustomerCount = async (merchantId) => {
  const total = await Customer.count({ where: { merchantId } });
  const regular = await Customer.count({ 
    where: { merchantId, totalOrders: { [Op.gte]: 3 } } 
  });
  const newThisMonth = await Customer.count({
    where: { 
      merchantId, 
      createdAt: { [Op.gte]: new Date(new Date().setDate(1)) } 
    }
  });

  return {
    message: `👥 Customer Report:\n` +
      `• Total: ${total}\n` +
      `• Regular (3+ orders): ${regular}\n` +
      `• New this month: ${newThisMonth}`
  };
};

const getBestDay = (orders) => {
  if (orders.length === 0) return 'N/A';
  const dayMap = {};
  for (const o of orders) {
    const day = o.createdAt.toLocaleDateString('en-IN', { weekday: 'long' });
    dayMap[day] = (dayMap[day] || 0) + parseFloat(o.totalAmount);
  }
  return Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0][0];
};

module.exports = {
  getDailySales,
  getStockCheck,
  getPendingPayments,
  getWeeklyReport,
  getTopProducts,
  getCustomerCount
};
