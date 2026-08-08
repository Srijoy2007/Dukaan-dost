const Merchant = require('./Merchant');
const Customer = require('./Customer');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
// Add these lines alongside your existing models
const BusinessPersona = require('./BusinessPersona');
const BotConfig = require('./BotConfig');
const CustomerMemory = require('./CustomerMemory');
// At the top, with your other requires:
const BusinessPersona = require('./BusinessPersona');
const BotConfig = require('./BotConfig');
const CustomerMemory = require('./CustomerMemory');

// In your models object (where you define db.Merchant, db.Customer, etc.):
const db = {
  Merchant: Merchant,
  Customer: Customer,
  Order: Order,
  OrderItem: OrderItem,
  Product: Product,
  // ADD THESE THREE:
  BusinessPersona: BusinessPersona(sequelize, Sequelize.DataTypes),
  BotConfig: BotConfig(sequelize, Sequelize.DataTypes),
  CustomerMemory: CustomerMemory(sequelize, Sequelize.DataTypes)
};

// After the models object, add this loop (if not already there):
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
// In your models object, add:
BusinessPersona: BusinessPersona(sequelize, DataTypes),
BotConfig: BotConfig(sequelize, DataTypes),
CustomerMemory: CustomerMemory(sequelize, DataTypes)

// Run associations:
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});
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
