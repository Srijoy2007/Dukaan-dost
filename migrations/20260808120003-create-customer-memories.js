module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('customer_memories', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      merchant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'merchants', key: 'id' }, onDelete: 'CASCADE' },
      customer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'customers', key: 'id' }, onDelete: 'CASCADE' },
      total_orders: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_spent: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0.00 },
      credit_balance: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      preferred_products: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      notes: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      last_order_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('customer_memories');
  }
};
