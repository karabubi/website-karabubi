const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const SiteVisit = sequelize.define(
  "SiteVisit",
  {
    visitorId: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },

    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: "/",
    },
  },
  {
    tableName: "site_visits",
    timestamps: true,
    indexes: [
      {
        fields: ["visitorId"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

module.exports = SiteVisit;
