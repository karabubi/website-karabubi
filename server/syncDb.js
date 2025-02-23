const sequelize = require("./db");
const User = require("./models/User");

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected...");

    await sequelize.sync({ force: false }); // Set `force: true` to drop and recreate tables
    console.log("Database synchronized...");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

syncDatabase();