"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("Chatbots", "userId", "user_id");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("Chatbots", "user_id", "userId");
  },
};
