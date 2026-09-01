const { Sequelize } = require("sequelize");

require("dotenv").config();

const isProduction =
  process.env.NODE_ENV === "production";

const useSsl =
  process.env.DB_SSL === "true";

const commonOptions = {
  dialect: "postgres",
  logging: false,
  ...(isProduction && useSsl
    ? {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      }
    : {}),
};

const sequelize =
  process.env.DATABASE_URL
    ? new Sequelize(
        process.env.DATABASE_URL,
        commonOptions
      )
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
          ...commonOptions,
          host: process.env.DB_HOST,
          port: Number(
            process.env.DB_PORT || 5432
          ),
          dialect:
            process.env.DB_DIALECT ||
            "postgres",
        }
      );

module.exports = sequelize;
