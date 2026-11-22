module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table =
      await queryInterface.describeTable(
        "literary_reflections"
      );

    if (!table.imageFilename) {
      await queryInterface.addColumn(
        "literary_reflections",
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
        "literary_reflections"
      );

    if (table.imageFilename) {
      await queryInterface.removeColumn(
        "literary_reflections",
        "imageFilename"
      );
    }
  },
};
