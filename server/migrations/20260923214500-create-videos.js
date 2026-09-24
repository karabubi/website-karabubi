"use strict";

module.exports = {
  async up(
    queryInterface,
    Sequelize
  ) {
    const tables =
      await queryInterface.showAllTables();

    const normalized =
      tables.map((table) =>
        typeof table === "string"
          ? table
          : table.tableName ||
            table.name
      );

    if (
      normalized.includes("videos")
    ) {
      return;
    }

    await queryInterface.createTable(
      "videos",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },

        title: {
          allowNull: false,
          type: Sequelize.STRING(200),
        },

        description: {
          allowNull: true,
          type: Sequelize.TEXT,
        },

        videoFilename: {
          allowNull: false,
          type: Sequelize.STRING(255),
        },

        videoMimeType: {
          allowNull: false,
          type: Sequelize.STRING(100),
        },

        videoSize: {
          allowNull: false,
          type: Sequelize.BIGINT,
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

  async down(queryInterface) {
    const tables =
      await queryInterface.showAllTables();

    const normalized =
      tables.map((table) =>
        typeof table === "string"
          ? table
          : table.tableName ||
            table.name
      );

    if (
      normalized.includes("videos")
    ) {
      await queryInterface.dropTable(
        "videos"
      );
    }
  },
};
