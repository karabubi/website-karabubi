//Users/salehalkarabubi/works/project/website-karabubi/server/migrations/20250315090057-add-isVerified-to-Users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "isVerified", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "isVerified");
  },
};