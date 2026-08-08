module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('business_personas', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      merchant_id: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'merchants', key: 'id' }, onDelete: 'CASCADE' },
      business_type: { type: Sequelize.STRING(50), allowNull: false },
      business_type_display: { type: Sequelize.STRING(100), allowNull: false },
      tone_profile: { type: Sequelize.JSONB, defaultValue: {} },
      primary_language: { type: Sequelize.STRING(10), defaultValue: 'hinglish' },
      secondary_languages: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      delivery_enabled: { type: Sequelize.BOOLEAN, defaultValue: false },
      delivery_radius_km: { type: Sequelize.INTEGER },
      credit_enabled: { type: Sequelize.BOOLEAN, defaultValue: false },
      max_credit_limit: { type: Sequelize.DECIMAL(10, 2) },
      operating_hours: { type: Sequelize.JSONB, defaultValue: {} },
      insight_config: { type: Sequelize.JSONB, defaultValue: {} },
      system_prompt: { type: Sequelize.TEXT, allowNull: false },
      greeting_template: { type: Sequelize.STRING(200), defaultValue: 'Namaste' },
      quick_reply_defaults: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('business_personas');
  }
};
