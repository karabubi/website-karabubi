const sequelize = require("../db");
const User = require("./User");
const SiteVisit = require("./SiteVisit");
const WisdomQuote = require("./WisdomQuote");
const WisdomPoem = require("./WisdomPoem");
const Video = require("./Video");

module.exports = {
  sequelize,
  User,
  SiteVisit,
  WisdomQuote,
  WisdomPoem,
  Video,
};
