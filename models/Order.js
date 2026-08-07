const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM('received', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'),
    defaultValue: 'received'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'upi', 'card'),
    defaultValue: 'upi'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  razorpayOrderId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  razorpayPaymentId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  upiQrUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  merchantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  }
}, {
  tableName: 'orders',
  timestamps: true
});

module.exports = Order;
