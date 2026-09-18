const { DataTypes } = require("sequelize");

const sequelize = require("../db");

const WisdomPoem = sequelize.define(
  "WisdomPoem",
  {
    title: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    author: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    poem: {
      type: DataTypes.TEXT,
      allowNull: false,

      validate: {
        notEmpty: true,
        len: [1, 5000],
      },
    },

    imageFilename: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "wisdom_poems",
    timestamps: true,
  }
);

module.exports = WisdomPoem;
