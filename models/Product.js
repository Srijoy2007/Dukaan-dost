const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nameHindi: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  unit: {
    type: DataTypes.ENUM('kg', 'litre', 'piece', 'dozen', 'gram', 'ml'),
    defaultValue: 'piece'
  },
  stockQuantity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  lowStockThreshold: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 5
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'products',
  timestamps: true
});

module.exports = Product;
