"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Chỉ thêm cột video vì image đã có sẵn trong bảng rồi
    await queryInterface.addColumn("posts", "video", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Khi rollback thì chỉ xóa cột video
    await queryInterface.removeColumn("posts", "video");
  },
};
