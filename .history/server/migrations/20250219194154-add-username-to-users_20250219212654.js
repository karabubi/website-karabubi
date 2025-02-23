// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     /**
//      * Add altering commands here.
//      *
//      * Example:
//      * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
//      */
//   },

//   async down (queryInterface, Sequelize) {
//     /**
//      * Add reverting commands here.
//      *
//      * Example:
//      * await queryInterface.dropTable('users');
//      */
//   }
// };


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "username", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("Users", "username");
  },
};