require("dotenv").config(); // ✅ THÊM DÒNG NÀY LÊN ĐẦU TIÊN

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();

const commentRoutes = require("./src/routes/commentRoutes");
const authRoutes = require("./src/routes/authRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const userRoutes = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");
const searchRoutes = require("./src/routes/searchRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const seoRoutes = require("./src/routes/seoRoutes");
const scheduleRoutes = require("./src/routes/scheduleRoutes");
const relatedPostsRoutes = require("./src/routes/relatedPostsRoutes");
const commentRatingRoutes = require("./src/routes/commentRatingRoutes");
const activityRoutes = require("./src/routes/activityRoutes");
const newsletterRoutes = require("./src/routes/newsletterRoutes");
const chatbotRoutes = require("./src/routes/chatbotRoutes");
const userProfileRoutes = require("./src/routes/userProfileRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");

require("./src/config/db");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log(`🚀 Có yêu cầu: ${req.method} ${req.url}`);
  next();
});

app.use("/", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/admin/users", userRoutes);
app.use("/admin/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/search", searchRoutes);
app.use("/api/search", searchRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/seo", seoRoutes);
app.use("/api/seo", seoRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/related-posts", relatedPostsRoutes);
app.use("/api/comment-ratings", commentRatingRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/profile", userProfileRoutes);
app.use("/profile", userProfileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`);
});