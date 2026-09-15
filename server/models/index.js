const sequelize = require("../db");
const User = require("./User");
const SiteVisit = require("./SiteVisit");
const WisdomQuote = require("./WisdomQuote");

module.exports = {
  sequelize,
  User,
  SiteVisit,
  WisdomQuote,
};
