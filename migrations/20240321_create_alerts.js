module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('alerts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      user_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      latitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      longitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      accuracy: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'processed', 'closed'),
        defaultValue: 'active'
      },
      messages: {
        type: Sequelize.JSON,
        defaultValue: '[]'
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Ajouter les index
    await queryInterface.addIndex('alerts', ['status']);
    await queryInterface.addIndex('alerts', ['user_id']);
    await queryInterface.addIndex('alerts', ['timestamp']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('alerts');
  }
}; 