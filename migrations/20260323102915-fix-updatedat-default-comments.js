"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("comments", "updated_at", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal(
        "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      ),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("comments", "updated_at", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
  },
};
