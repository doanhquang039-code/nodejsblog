# 🚀 HƯỚNG DẪN CHẠY MY-BLOG-NODE

## ✅ BƯỚC 1: CÀI ĐẶT DEPENDENCIES

```bash
cd my-blog-node
npm install ws web-push sharp multer
```

## 📦 BƯỚC 2: CHẠY MIGRATION DATABASE

```bash
# Chạy migration script
node run-phase2-migration.js
```

Hoặc chạy thủ công:
```bash
mysql -u root -p my_blog_db < src/migrations/20260427_advanced_features_phase2.sql
```

## ⚙️ BƯỚC 3: CẤU HÌNH ENVIRONMENT

Tạo/cập nhật file `.env`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=my_blog_db

# Server
PORT=8080
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key

# WebSocket
WS_PORT=8081
WS_PATH=/ws

# Web Push (Generate keys: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your@email.com

# Media Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,video/mp4,application/pdf

# Search
SEARCH_RESULTS_LIMIT=20
SEARCH_HISTORY_LIMIT=50

# Draft Auto-save
DRAFT_AUTOSAVE_INTERVAL=30000

# Default Language
DEFAULT_LANGUAGE=vi
FALLBACK_LANGUAGE=en
```

## 🔑 BƯỚC 4: GENERATE VAPID KEYS

```bash
npx web-push generate-vapid-keys
```

Copy keys vào `.env`:
```env
VAPID_PUBLIC_KEY=BKxxx...
VAPID_PRIVATE_KEY=xxx...
```

## 📁 BƯỚC 5: TẠO THƯ MỤC UPLOADS

```bash
mkdir -p public/uploads
```

## 🔧 BƯỚC 6: CẬP NHẬT APP.JS

Cần cập nhật `app.js` để thêm routes mới và WebSocket:

```javascript
const express = require('express');
const http = require('http');
const path = require('path');
const setupWebSocketServer = require('./src/utils/websocketServer');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Existing routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/posts', require('./src/routes/postRoutes'));
// ... other existing routes

// NEW ROUTES - Phase 2
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/themes', require('./src/routes/themeRoutes'));
app.use('/api/conversations', require('./src/routes/messagingRoutes'));
app.use('/api/achievements', require('./src/routes/achievementRoutes'));
// app.use('/api/dashboard', require('./src/routes/advancedDashboardRoutes'));
// app.use('/api/push', require('./src/routes/pushRoutes'));
// app.use('/api/media', require('./src/routes/mediaRoutes'));
// app.use('/api/search', require('./src/routes/advancedSearchRoutes'));
// app.use('/api/drafts', require('./src/routes/draftRoutes'));
// app.use('/api/i18n', require('./src/routes/i18nRoutes'));

// View routes
app.get('/notifications', (req, res) => {
    res.render('notifications', { siteName: 'My Blog' });
});

app.get('/themes', (req, res) => {
    res.render('themes', { siteName: 'My Blog' });
});

app.get('/messaging', (req, res) => {
    res.render('messaging', { siteName: 'My Blog' });
});

app.get('/achievements', (req, res) => {
    res.render('achievements', { siteName: 'My Blog' });
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { siteName: 'My Blog' });
});

app.get('/media-gallery', (req, res) => {
    res.render('media-gallery', { siteName: 'My Blog' });
});

app.get('/search', (req, res) => {
    res.render('search', { siteName: 'My Blog' });
});

app.get('/drafts', (req, res) => {
    res.render('drafts', { siteName: 'My Blog' });
});

app.get('/settings', (req, res) => {
    res.render('settings', { siteName: 'My Blog' });
});

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket
const wss = setupWebSocketServer(server);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ WebSocket available at ws://localhost:${PORT}${process.env.WS_PATH || '/ws'}`);
});

module.exports = app;
```

## ▶️ BƯỚC 7: CHẠY SERVER

```bash
npm start
```

Hoặc với nodemon:
```bash
npm run dev
```

## 🌐 BƯỚC 8: TRUY CẬP GIAO DIỆN

Mở trình duyệt và truy cập:

### Trang chính:
- http://localhost:8080

### Các tính năng mới:
1. **Notifications:** http://localhost:8080/notifications
2. **Themes:** http://localhost:8080/themes
3. **Messaging:** http://localhost:8080/messaging
4. **Achievements:** http://localhost:8080/achievements
5. **Dashboard:** http://localhost:8080/dashboard
6. **Media Gallery:** http://localhost:8080/media-gallery
7. **Search:** http://localhost:8080/search
8. **Drafts:** http://localhost:8080/drafts
9. **Settings:** http://localhost:8080/settings

### API Endpoints:
- **Notifications:** http://localhost:8080/api/notifications
- **Themes:** http://localhost:8080/api/themes
- **Messaging:** http://localhost:8080/api/conversations
- **Achievements:** http://localhost:8080/api/achievements

### WebSocket:
- ws://localhost:8080/ws

## 🧪 BƯỚC 9: TEST FEATURES

### Test WebSocket:
```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:8080/ws

# Send auth message
{"type":"auth","token":"your_jwt_token"}
```

### Test API:
```bash
# Get notifications
curl http://localhost:8080/api/notifications \
  -H "Authorization: Bearer your_jwt_token"

# Get themes
curl http://localhost:8080/api/themes/user \
  -H "Authorization: Bearer your_jwt_token"

# Get achievements
curl http://localhost:8080/api/achievements/user \
  -H "Authorization: Bearer your_jwt_token"
```

## 📊 KIỂM TRA DATABASE

```bash
mysql -u root -p my_blog_db

# Check tables
SHOW TABLES;

# Check notifications
SELECT * FROM realtime_notifications LIMIT 5;

# Check themes
SELECT * FROM theme_presets;

# Check achievements
SELECT * FROM achievements;
```

## 🐛 TROUBLESHOOTING

### Lỗi: Cannot find module
```bash
npm install
```

### Lỗi: Database connection
- Kiểm tra MySQL đang chạy
- Kiểm tra thông tin trong `.env`
- Kiểm tra database đã tạo chưa

### Lỗi: WebSocket not connecting
- Kiểm tra WS_PORT trong `.env`
- Kiểm tra firewall
- Thử browser khác

### Lỗi: Migration failed
```bash
# Drop và tạo lại database
mysql -u root -p
DROP DATABASE my_blog_db;
CREATE DATABASE my_blog_db;
exit

# Chạy lại migration
node run-phase2-migration.js
```

## 📝 NOTES

### Hiện tại đã có:
- ✅ Database schema (26 tables)
- ✅ 8 Models
- ✅ 4 Services
- ✅ 4 Controllers (documented)
- ✅ 4 Routes (documented)
- ✅ 9 CSS files
- ✅ 10 EJS views
- ✅ WebSocket utility

### Chưa có (cần tạo):
- ❌ 18 Models còn lại
- ❌ 6 Services còn lại
- ❌ 6 Controllers còn lại
- ❌ 6 Routes còn lại
- ❌ 10 JavaScript files
- ❌ Service Worker

### Tính năng hoạt động:
- ✅ Notifications (partial - cần JS)
- ✅ Themes (partial - cần JS)
- ✅ Messaging (partial - cần JS)
- ✅ Achievements (partial - cần JS)
- ✅ UI hiển thị đầy đủ

### Tính năng cần hoàn thiện:
- 🔄 Dashboard widgets
- 🔄 Push notifications
- 🔄 Media gallery
- 🔄 Advanced search
- 🔄 Draft system
- 🔄 i18n

## 🎯 NEXT STEPS

1. Tạo JavaScript files cho interactivity
2. Tạo các Models, Services, Controllers còn lại
3. Test từng tính năng
4. Fix bugs
5. Deploy

## 📚 DOCUMENTATION

- `NEW_FEATURES_PHASE2_COMPLETE.md` - Feature docs
- `IMPLEMENTATION_GUIDE_PHASE2.md` - Implementation guide
- `ALL_SERVICES_CONTROLLERS_ROUTES.md` - Code reference
- `UI_COMPLETION_SUMMARY.md` - UI summary
- `PHASE2_FINAL_SUMMARY.md` - Project summary

---

**Created by: Kiro AI Assistant**  
**Date: April 27, 2026**  
**Status: Ready to run! 🚀**
