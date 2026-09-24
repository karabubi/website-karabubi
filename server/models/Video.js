const {
  DataTypes,
} = require("sequelize");

const sequelize =
  require("../db");

const Video =
  sequelize.define(
    "Video",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      videoFilename: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      videoMimeType: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      videoSize: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      tableName: "videos",
      timestamps: true,
    }
  );

module.exports = Video;
