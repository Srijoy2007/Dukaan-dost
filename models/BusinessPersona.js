
module.exports = (sequelize, DataTypes) => {
  const BusinessPersona = sequelize.define('BusinessPersona', {
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
    businessType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    businessTypeDisplay: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    toneProfile: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    primaryLanguage: {
      type: DataTypes.STRING(10),
      defaultValue: 'hinglish'
    },
    secondaryLanguages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    deliveryEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deliveryRadiusKm: {
      type: DataTypes.INTEGER
    },
    creditEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    maxCreditLimit: {
      type: DataTypes.DECIMAL(10, 2)
    },
    operatingHours: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    insightConfig: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    systemPrompt: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    greetingTemplate: {
      type: DataTypes.STRING(200),
      defaultValue: 'Namaste'
    },
    quickReplyDefaults: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    tableName: 'business_personas',
    timestamps: true,
    underscored: true
  });

  BusinessPersona.associate = (models) => {
    BusinessPersona.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'merchant'
    });
  };

  return BusinessPersona;
};
