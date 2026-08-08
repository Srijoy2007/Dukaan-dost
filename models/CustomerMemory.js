
module.exports = (sequelize, DataTypes) => {
  const CustomerMemory = sequelize.define('CustomerMemory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    merchantId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalSpent: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    },
    creditBalance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    preferredProducts: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    notes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    lastOrderAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'customer_memories',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['merchant_id', 'customer_id'] }
    ]
  });

  return CustomerMemory;
};
