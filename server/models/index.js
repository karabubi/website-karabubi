const sequelize = require("../db");
const User = require("./User");
const SiteVisit = require("./SiteVisit");
const WisdomQuote = require("./WisdomQuote");
const WisdomPoem = require("./WisdomPoem");

module.exports = {
  sequelize,
  User,
  SiteVisit,
  WisdomQuote,
  WisdomPoem,
};
