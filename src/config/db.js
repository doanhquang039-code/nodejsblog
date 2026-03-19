const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "node_blog_db",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "123456", // Đảm bảo khớp với .env
  {
    host: process.env.DB_HOST || "127.0.0.1", // Dùng IP 127.0.0.1 ổn định hơn localhost
    dialect: "mysql",
    logging: false,
  },
);

const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối Database MySQL máy thật thành công!");
  } catch (error) {
    console.error("❌ Lỗi kết nối:", error.message);
  }
};

checkConnection();
module.exports = sequelize;
