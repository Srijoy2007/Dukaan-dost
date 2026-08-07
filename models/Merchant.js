const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Merchant = sequelize.define('Merchant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  businessName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'My Store'
  },
  ownerName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  language: {
    type: DataTypes.ENUM('hindi', 'english', 'hinglish'),
    defaultValue: 'hinglish'
  },
  upiId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  whatsappPhoneNumberId: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'merchants',
  timestamps: true
});

module.exports = Merchant;
