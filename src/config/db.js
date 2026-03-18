const { Sequelize } = require("sequelize");
require("dotenv").config();

// Khởi tạo thực thể kết nối
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // Tắt log SQL cho đỡ rối terminal
  },
);
// Kiểm tra kết nối
const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("--- Kết nối Database MySQL thành công! ---");
  } catch (error) {
    console.error("--- Không thể kết nối Database: ---", error);
  }
};

checkConnection();

module.exports = sequelize;
