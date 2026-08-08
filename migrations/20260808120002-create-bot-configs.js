module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bot_configs', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      merchant_id: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'merchants', key: 'id' }, onDelete: 'CASCADE' },
      waba_id: { type: Sequelize.STRING(100) },
      phone_number_id: { type: Sequelize.STRING(100) },
      display_name: { type: Sequelize.STRING(100), allowNull: false },
      bot_phone_number: { type: Sequelize.STRING(15), allowNull: false },
      webhook_url: { type: Sequelize.TEXT, allowNull: false },
      verify_token: { type: Sequelize.STRING(100), allowNull: false },
      status: { type: Sequelize.STRING(20), defaultValue: 'PENDING' },
      meta_access_token_encrypted: { type: Sequelize.TEXT },
      activated_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bot_configs');
  }
};
