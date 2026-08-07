const Merchant = require('./Merchant');
const Customer = require('./Customer');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Define associations
Merchant.hasMany(Customer, { foreignKey: 'merchantId', as: 'customers' });
Customer.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Merchant.hasMany(Product, { foreignKey: 'merchantId', as: 'products' });
Product.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Merchant.hasMany(Order, { foreignKey: 'merchantId', as: 'orders' });
Order.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });

module.exports = {
  Merchant,
  Customer,
  Product,
  Order,
  OrderItem
};
