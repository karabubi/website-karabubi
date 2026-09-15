module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "wisdom_quotes",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        quote: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP"
          ),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP"
          ),
        },
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(
      "wisdom_quotes"
    );
  },
};
