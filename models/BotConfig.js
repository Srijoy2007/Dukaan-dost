
module.exports = (sequelize, DataTypes) => {
  const BotConfig = sequelize.define('BotConfig', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    merchantId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    wabaId: {
      type: DataTypes.STRING(100)
    },
    phoneNumberId: {
      type: DataTypes.STRING(100)
    },
    displayName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    botPhoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    webhookUrl: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    verifyToken: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'PENDING',
      validate: {
        isIn: [['PENDING', 'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'FAILED']]
      }
    },
    metaAccessTokenEncrypted: {
      type: DataTypes.TEXT
    },
    activatedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'bot_configs',
    timestamps: true,
    underscored: true
  });

  BotConfig.associate = (models) => {
    BotConfig.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'merchant'
    });
  };

  return BotConfig;
};
