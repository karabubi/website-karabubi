module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table =
      await queryInterface.describeTable(
        "wisdom_poems"
      );

    if (!table.imageFilename) {
      await queryInterface.addColumn(
        "wisdom_poems",
        "imageFilename",
        {
          type: Sequelize.STRING(255),
          allowNull: true,
        }
      );
    }
  },

  down: async (queryInterface) => {
    const table =
      await queryInterface.describeTable(
        "wisdom_poems"
      );

    if (table.imageFilename) {
      await queryInterface.removeColumn(
        "wisdom_poems",
        "imageFilename"
      );
    }
  },
};
