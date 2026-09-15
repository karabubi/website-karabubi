const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const WisdomQuote = sequelize.define(
  "WisdomQuote",
  {
    quote: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 1000],
      },
    },
  },
  {
    tableName: "wisdom_quotes",
    timestamps: true,
  }
);

module.exports = WisdomQuote;
