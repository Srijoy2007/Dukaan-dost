const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  lastOrderDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  merchantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'merchants',
      key: 'id'
    }
  }
}, {
  tableName: 'customers',
  timestamps: true
});

module.exports = Customer;
