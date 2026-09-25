"use strict";

module.exports = {
  async up(
    queryInterface,
    Sequelize
  ) {
    const tables =
      await queryInterface
        .showAllTables();

    const tableExists =
      tables.some(
        (table) => {
          if (
            typeof table ===
            "string"
          ) {
            return (
              table ===
              "gallery_images"
            );
          }

          return (
            table?.tableName ===
            "gallery_images"
          );
        }
      );

    if (tableExists) {
      console.log(
        "gallery_images table already exists; skipping creation."
      );

      return;
    }

    await queryInterface
      .createTable(
        "gallery_images",
        {
          id: {
            type:
              Sequelize.INTEGER,

            allowNull:
              false,

            autoIncrement:
              true,

            primaryKey:
              true,
          },

          titleEn: {
            type:
              Sequelize.STRING(200),

            allowNull:
              false,
          },

          titleDe: {
            type:
              Sequelize.STRING(200),

            allowNull:
              true,
          },

          titleAr: {
            type:
              Sequelize.STRING(200),

            allowNull:
              true,
          },

          descriptionEn: {
            type:
              Sequelize.TEXT,

            allowNull:
              true,
          },

          descriptionDe: {
            type:
              Sequelize.TEXT,

            allowNull:
              true,
          },

          descriptionAr: {
            type:
              Sequelize.TEXT,

            allowNull:
              true,
          },

          imageFilename: {
            type:
              Sequelize.STRING(255),

            allowNull:
              false,
          },

          imageMimeType: {
            type:
              Sequelize.STRING(100),

            allowNull:
              false,
          },

          imageSize: {
            type:
              Sequelize.BIGINT,

            allowNull:
              false,
          },

          createdAt: {
            type:
              Sequelize.DATE,

            allowNull:
              false,

            defaultValue:
              Sequelize.fn(
                "NOW"
              ),
          },

          updatedAt: {
            type:
              Sequelize.DATE,

            allowNull:
              false,

            defaultValue:
              Sequelize.fn(
                "NOW"
              ),
          },
        }
      );
  },

  async down(
    queryInterface
  ) {
    const tables =
      await queryInterface
        .showAllTables();

    const tableExists =
      tables.some(
        (table) => {
          if (
            typeof table ===
            "string"
          ) {
            return (
              table ===
              "gallery_images"
            );
          }

          return (
            table?.tableName ===
            "gallery_images"
          );
        }
      );

    if (tableExists) {
      await queryInterface
        .dropTable(
          "gallery_images"
        );
    }
  },
};
