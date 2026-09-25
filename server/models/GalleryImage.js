const {
  DataTypes,
} = require("sequelize");

const sequelize =
  require("../db");

const GalleryImage =
  sequelize.define(
    "GalleryImage",
    {
      id: {
        type:
          DataTypes.INTEGER,

        autoIncrement:
          true,

        primaryKey:
          true,

        allowNull:
          false,
      },

      titleEn: {
        type:
          DataTypes.STRING(200),

        allowNull:
          false,
      },

      titleDe: {
        type:
          DataTypes.STRING(200),

        allowNull:
          true,
      },

      titleAr: {
        type:
          DataTypes.STRING(200),

        allowNull:
          true,
      },

      descriptionEn: {
        type:
          DataTypes.TEXT,

        allowNull:
          true,
      },

      descriptionDe: {
        type:
          DataTypes.TEXT,

        allowNull:
          true,
      },

      descriptionAr: {
        type:
          DataTypes.TEXT,

        allowNull:
          true,
      },

      imageFilename: {
        type:
          DataTypes.STRING(255),

        allowNull:
          false,
      },

      imageMimeType: {
        type:
          DataTypes.STRING(100),

        allowNull:
          false,
      },

      imageSize: {
        type:
          DataTypes.BIGINT,

        allowNull:
          false,
      },
    },

    {
      tableName:
        "gallery_images",

      timestamps:
        true,
    }
  );

module.exports =
  GalleryImage;
