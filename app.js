require("dotenv").config(); // ✅ THÊM DÒNG NÀY LÊN ĐẦU TIÊN

const express = require("express");
const http = require("http");
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

// Phase 2 Routes (Comment tạm vì chưa tạo files)
// const notificationRoutes = require("./src/routes/notificationRoutes");
// const themeRoutes = require("./src/routes/themeRoutes");
// const messagingRoutes = require("./src/routes/messagingRoutes");
// const achievementRoutes = require("./src/routes/achievementRoutes");

// WebSocket Setup (Comment tạm vì chưa tạo file)
// const setupWebSocketServer = require("./src/utils/websocketServer");

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

// Phase 2 API Routes (Comment tạm vì chưa tạo routes)
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/themes", themeRoutes);
// app.use("/api/conversations", messagingRoutes);
// app.use("/api/achievements", achievementRoutes);

// Phase 2 View Routes
app.get("/notifications", (req, res) => {
  res.render("notifications", { siteName: "My Blog" });
});

app.get("/themes", (req, res) => {
  res.render("themes", { siteName: "My Blog" });
});

app.get("/messaging", (req, res) => {
  res.render("messaging", { siteName: "My Blog" });
});

app.get("/achievements", (req, res) => {
  res.render("achievements", { siteName: "My Blog" });
});

app.get("/media-gallery", (req, res) => {
  res.render("media-gallery", { siteName: "My Blog" });
});

app.get("/search-advanced", (req, res) => {
  res.render("search", { siteName: "My Blog" });
});

app.get("/drafts", (req, res) => {
  res.render("drafts", { siteName: "My Blog" });
});

app.get("/settings", (req, res) => {
  res.render("settings", { siteName: "My Blog" });
});

// Role-based Dashboards
app.get("/admin/dashboard", (req, res) => {
  res.render("dashboards/admin", { 
    siteName: "My Blog",
    user: { name: "Admin" },
    categories: []
  });
});

app.get("/admin/users", (req, res) => {
  res.render("dashboards/admin_users", { 
    siteName: "My Blog",
    user: { name: "Admin" }
  });
});

app.get("/admin/posts", (req, res) => {
  res.render("dashboards/admin_posts", { 
    siteName: "My Blog",
    user: { name: "Admin" }
  });
});

app.get("/author/dashboard", (req, res) => {
  res.render("dashboards_editor/editor", { siteName: "My Blog" });
});

app.get("/user/dashboard", (req, res) => {
  res.render("dashboards_user/user", { siteName: "My Blog" });
});

app.get("/manager/dashboard", (req, res) => {
  res.render("dashboards_manager/manager", { siteName: "My Blog" });
});

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket (Comment tạm vì chưa tạo file)
// const wss = setupWebSocketServer(server);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`🎨 UI Pages available:`);
  console.log(`   - Notifications: http://localhost:${PORT}/notifications`);
  console.log(`   - Themes: http://localhost:${PORT}/themes`);
  console.log(`   - Messaging: http://localhost:${PORT}/messaging`);
  console.log(`   - Achievements: http://localhost:${PORT}/achievements`);
  console.log(`   - Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`   - Media Gallery: http://localhost:${PORT}/media-gallery`);
  console.log(`   - Search: http://localhost:${PORT}/search-advanced`);
  console.log(`   - Drafts: http://localhost:${PORT}/drafts`);
  console.log(`   - Settings: http://localhost:${PORT}/settings`);
  // console.log(`✅ WebSocket available at ws://localhost:${PORT}${process.env.WS_PATH || '/ws'}`);
});