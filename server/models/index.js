const sequelize = require("../db");
const User = require("./User");
const SiteVisit = require("./SiteVisit");
const WisdomQuote = require("./WisdomQuote");
const WisdomPoem = require("./WisdomPoem");
const Video = require("./Video");
const GalleryImage = require("./GalleryImage");

module.exports = {
  sequelize,
  User,
  SiteVisit,
  WisdomQuote,
  WisdomPoem,
  Video,
  GalleryImage,
};
