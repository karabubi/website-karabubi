module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "literary_reflections",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        title: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        author: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        reflection: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue:
            Sequelize.literal(
              "CURRENT_TIMESTAMP"
            ),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue:
            Sequelize.literal(
              "CURRENT_TIMESTAMP"
            ),
        },
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(
      "literary_reflections"
    );
  },
};
