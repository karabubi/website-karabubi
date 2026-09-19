module.exports = {
  up: async (
    queryInterface,
    Sequelize
  ) => {
    const table =
      await queryInterface.describeTable(
        "wisdom_quotes"
      );

    if (!table.imageFilename) {
      await queryInterface.addColumn(
        "wisdom_quotes",
        "imageFilename",
        {
          type: Sequelize.STRING(255),
          allowNull: true,
        }
      );
    }
  },

  down: async (
    queryInterface
  ) => {
    const table =
      await queryInterface.describeTable(
        "wisdom_quotes"
      );

    if (table.imageFilename) {
      await queryInterface.removeColumn(
        "wisdom_quotes",
        "imageFilename"
      );
    }
  },
};
