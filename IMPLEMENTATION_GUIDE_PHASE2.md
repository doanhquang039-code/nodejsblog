# 🚀 IMPLEMENTATION GUIDE - PHASE 2

## 📋 HƯỚNG DẪN TRIỂN KHAI 10 TÍNH NĂNG MỚI

---

## 🎯 TỔNG QUAN

Tài liệu này hướng dẫn chi tiết cách triển khai 10 tính năng mới cho my-blog-node.

**Tổng số files cần tạo: ~60 files**
- Models: 26 files
- Services: 10 files
- Controllers: 10 files
- Routes: 10 files
- Middleware: 2 files
- Utils: 2 files

---

## 📁 CẤU TRÚC THƯ MỤC

```
my-blog-node/
├── src/
│   ├── models/
│   │   ├── RealtimeNotification.js
│   │   ├── NotificationPreference.js
│   │   ├── UserTheme.js
│   │   ├── ThemePreset.js
│   │   ├── Conversation.js
│   │   ├── ConversationParticipant.js
│   │   ├── Message.js
│   │   ├── MessageReaction.js
│   │   ├── Achievement.js
│   │   ├── UserAchievement.js
│   │   ├── UserPoint.js
│   │   ├── PointTransaction.js
│   │   ├── DashboardWidget.js
│   │   ├── UserAnalytics.js
│   │   ├── PushSubscription.js
│   │   ├── PushNotificationLog.js
│   │   ├── MediaFile.js
│   │   ├── MediaFolder.js
│   │   ├── SearchHistory.js
│   │   ├── SearchSuggestion.js
│   │   ├── PostDraft.js
│   │   ├── DraftVersion.js
│   │   ├── Language.js
│   │   ├── Translation.js
│   │   ├── PostTranslation.js
│   │   └── UserLanguagePreference.js
│   │
│   ├── services/
│   │   ├── realtimeNotificationService.js ✅ (Created)
│   │   ├── themeService.js
│   │   ├── messagingService.js
│   │   ├── achievementService.js
│   │   ├── dashboardService.js
│   │   ├── pushNotificationService.js
│   │   ├── mediaService.js
│   │   ├── advancedSearchService.js
│   │   ├── draftService.js
│   │   └── i18nService.js
│   │
│   ├── controllers/
│   │   ├── notificationController.js
│   │   ├── themeController.js
│   │   ├── messagingController.js
│   │   ├── achievementController.js
│   │   ├── advancedDashboardController.js
│   │   ├── pushController.js
│   │   ├── mediaController.js
│   │   ├── searchController.js
│   │   ├── draftController.js
│   │   └── i18nController.js
│   │
│   ├── routes/
│   │   ├── notificationRoutes.js
│   │   ├── themeRoutes.js
│   │   ├── messagingRoutes.js
│   │   ├── achievementRoutes.js
│   │   ├── advancedDashboardRoutes.js
│   │   ├── pushRoutes.js
│   │   ├── mediaRoutes.js
│   │   ├── advancedSearchRoutes.js
│   │   ├── draftRoutes.js
│   │   └── i18nRoutes.js
│   │
│   ├── middleware/
│   │   ├── websocketAuth.js
│   │   └── uploadMiddleware.js
│   │
│   └── utils/
│       ├── websocketServer.js
│       └── vapidKeys.js
│
├── public/
│   ├── js/
│   │   ├── notifications.js
│   │   ├── theme-switcher.js
│   │   ├── messaging.js
│   │   ├── achievements.js
│   │   ├── dashboard-widgets.js
│   │   ├── push-notifications.js
│   │   ├── media-gallery.js
│   │   ├── advanced-search.js
│   │   ├── draft-autosave.js
│   │   └── language-switcher.js
│   │
│   ├── css/
│   │   ├── notifications.css
│   │   ├── themes.css
│   │   ├── messaging.css
│   │   ├── achievements.css
│   │   ├── dashboard-widgets.css
│   │   ├── media-gallery.css
│   │   └── language-switcher.css
│   │
│   └── sw.js (Service Worker for Push)
│
├── src/migrations/
│   └── 20260427_advanced_features_phase2.sql ✅ (Created)
│
├── run-phase2-migration.js ✅ (Created)
├── NEW_FEATURES_PHASE2_COMPLETE.md ✅ (Created)
└── IMPLEMENTATION_GUIDE_PHASE2.md ✅ (This file)
```

---

## 🔧 BƯỚC 1: CHẠY MIGRATION

```bash
# Run migration script
node run-phase2-migration.js

# Or manually
mysql -u root -p my_blog_db < src/migrations/20260427_advanced_features_phase2.sql
```

**Expected Output:**
```
✅ 26 tables created
✅ 6 theme presets inserted
✅ 8 languages inserted
✅ 10 achievements inserted
✅ 2 views created
✅ 3 triggers created
```

---

## 📦 BƯỚC 2: CÀI ĐẶT DEPENDENCIES

```bash
npm install ws web-push sharp multer socket.io
```

**Dependencies:**
- `ws` - WebSocket server
- `web-push` - Push notifications
- `sharp` - Image processing
- `multer` - File upload
- `socket.io` - Real-time communication (alternative to ws)

---

## ⚙️ BƯỚC 3: CẤU HÌNH ENVIRONMENT

Thêm vào `.env`:

```env
# WebSocket
WS_PORT=8081
WS_PATH=/ws

# Web Push (Generate with: npx web-push generate-vapid-keys)
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
DEFAULT_LANGUAGE=en
FALLBACK_LANGUAGE=en
```

---

## 🔑 BƯỚC 4: GENERATE VAPID KEYS

```bash
npx web-push generate-vapid-keys
```

Copy keys vào `.env`:
```env
VAPID_PUBLIC_KEY=BKxxx...
VAPID_PRIVATE_KEY=xxx...
```

---

## 📝 BƯỚC 5: TẠO MODELS

### Example Model: RealtimeNotification.js

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RealtimeNotification = sequelize.define('RealtimeNotification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('like', 'comment', 'follow', 'mention', 'message', 'achievement', 'system'),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data: {
        type: DataTypes.JSON
    },
    link: {
        type: DataTypes.STRING(500)
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_realtime: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal'
    },
    read_at: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'realtime_notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = RealtimeNotification;
```

**Tạo tương tự cho 25 models còn lại.**

---

## 🎮 BƯỚC 6: TẠO CONTROLLERS

### Example Controller: notificationController.js

```javascript
const RealtimeNotificationService = require('../services/realtimeNotificationService');

class NotificationController {
    // Get user notifications
    static async getNotifications(req, res) {
        try {
            const userId = req.user.id;
            const { page, limit, isRead, type } = req.query;
            
            const result = await RealtimeNotificationService.getUserNotifications(userId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                isRead: isRead === 'true' ? true : isRead === 'false' ? false : null,
                type
            });
            
            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Get unread count
    static async getUnreadCount(req, res) {
        try {
            const userId = req.user.id;
            const count = await RealtimeNotificationService.getUnreadCount(userId);
            
            res.json({
                success: true,
                count
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Mark as read
    static async markAsRead(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            
            const notification = await RealtimeNotificationService.markAsRead(id, userId);
            
            res.json({
                success: true,
                notification
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Mark all as read
    static async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            await RealtimeNotificationService.markAllAsRead(userId);
            
            res.json({
                success: true,
                message: 'All notifications marked as read'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Delete notification
    static async deleteNotification(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            
            await RealtimeNotificationService.deleteNotification(id, userId);
            
            res.json({
                success: true,
                message: 'Notification deleted'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Get preferences
    static async getPreferences(req, res) {
        try {
            const userId = req.user.id;
            const preferences = await RealtimeNotificationService.getPreferences(userId);
            
            res.json({
                success: true,
                preferences
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Update preferences
    static async updatePreferences(req, res) {
        try {
            const userId = req.user.id;
            const preferences = await RealtimeNotificationService.updatePreferences(userId, req.body);
            
            res.json({
                success: true,
                preferences
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = NotificationController;
```

**Tạo tương tự cho 9 controllers còn lại.**

---

## 🛣️ BƯỚC 7: TẠO ROUTES

### Example Routes: notificationRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get notifications
router.get('/', NotificationController.getNotifications);

// Get unread count
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark as read
router.put('/:id/read', NotificationController.markAsRead);

// Mark all as read
router.put('/read-all', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:id', NotificationController.deleteNotification);

// Preferences
router.get('/preferences', NotificationController.getPreferences);
router.put('/preferences', NotificationController.updatePreferences);

module.exports = router;
```

**Tạo tương tự cho 9 routes còn lại.**

---

## 🔌 BƯỚC 8: SETUP WEBSOCKET SERVER

### Create: src/utils/websocketServer.js

```javascript
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const RealtimeNotificationService = require('../services/realtimeNotificationService');

function setupWebSocketServer(server) {
    const wss = new WebSocket.Server({ 
        server,
        path: process.env.WS_PATH || '/ws'
    });
    
    wss.on('connection', (ws, req) => {
        console.log('New WebSocket connection');
        
        let userId = null;
        
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                
                // Handle authentication
                if (data.type === 'auth') {
                    const token = data.token;
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    userId = decoded.id;
                    
                    // Register connection
                    RealtimeNotificationService.registerConnection(userId, ws);
                    
                    ws.send(JSON.stringify({
                        type: 'auth_success',
                        userId
                    }));
                }
                
                // Handle ping
                if (data.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                }
                
            } catch (error) {
                console.error('WebSocket error:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: error.message
                }));
            }
        });
        
        ws.on('close', () => {
            if (userId) {
                RealtimeNotificationService.unregisterConnection(userId, ws);
            }
            console.log('WebSocket connection closed');
        });
        
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
    
    console.log(`WebSocket server started on ${process.env.WS_PATH || '/ws'}`);
    
    return wss;
}

module.exports = setupWebSocketServer;
```

---

## 🚀 BƯỚC 9: CẬP NHẬT APP.JS

```javascript
const express = require('express');
const http = require('http');
const setupWebSocketServer = require('./src/utils/websocketServer');

// ... existing code ...

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket
const wss = setupWebSocketServer(server);

// Add routes
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/themes', require('./src/routes/themeRoutes'));
app.use('/api/conversations', require('./src/routes/messagingRoutes'));
app.use('/api/achievements', require('./src/routes/achievementRoutes'));
app.use('/api/dashboard', require('./src/routes/advancedDashboardRoutes'));
app.use('/api/push', require('./src/routes/pushRoutes'));
app.use('/api/media', require('./src/routes/mediaRoutes'));
app.use('/api/search', require('./src/routes/advancedSearchRoutes'));
app.use('/api/drafts', require('./src/routes/draftRoutes'));
app.use('/api/i18n', require('./src/routes/i18nRoutes'));

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket available at ws://localhost:${PORT}${process.env.WS_PATH || '/ws'}`);
});
```

---

## 🎨 BƯỚC 10: FRONTEND INTEGRATION

### Example: notifications.js

```javascript
class NotificationManager {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.init();
    }
    
    init() {
        this.connect();
        this.setupUI();
        this.loadNotifications();
    }
    
    connect() {
        const token = localStorage.getItem('token');
        const wsUrl = `ws://localhost:8080/ws`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            
            // Authenticate
            this.ws.send(JSON.stringify({
                type: 'auth',
                token
            }));
            
            // Start ping interval
            this.startPing();
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.reconnect();
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'notification':
                this.showNotification(data.data);
                this.updateBadge();
                break;
            case 'broadcast':
                this.showBroadcast(data.data);
                break;
            case 'auth_success':
                console.log('Authenticated as user:', data.userId);
                break;
        }
    }
    
    showNotification(notification) {
        // Show toast notification
        this.showToast(notification.title, notification.message);
        
        // Add to notification list
        this.addToList(notification);
        
        // Play sound
        this.playSound();
    }
    
    async loadNotifications() {
        const response = await fetch('/api/notifications', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        this.renderNotifications(data.notifications);
        this.updateBadge(data.unreadCount);
    }
    
    async markAsRead(notificationId) {
        await fetch(`/api/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        this.updateBadge();
    }
    
    // ... more methods ...
}

// Initialize
const notificationManager = new NotificationManager();
```

---

## ✅ TESTING CHECKLIST

### Feature 1: Notifications
- [ ] WebSocket connection works
- [ ] Notifications received in real-time
- [ ] Mark as read works
- [ ] Preferences saved
- [ ] Badge count updates

### Feature 2: Themes
- [ ] Theme switcher works
- [ ] Colors apply correctly
- [ ] Dark mode works
- [ ] Presets load
- [ ] Custom theme saves

### Feature 3: Messaging
- [ ] Send message works
- [ ] Receive message real-time
- [ ] Reactions work
- [ ] Read receipts work
- [ ] Typing indicator shows

### Feature 4: Achievements
- [ ] Achievements unlock
- [ ] Points awarded
- [ ] Leaderboard updates
- [ ] Progress tracks
- [ ] Notifications sent

### Feature 5: Dashboard
- [ ] Widgets load
- [ ] Charts render
- [ ] Analytics accurate
- [ ] Customization works
- [ ] Export works

### Feature 6: Push
- [ ] Permission requested
- [ ] Subscription works
- [ ] Notifications received
- [ ] Click tracking works
- [ ] Unsubscribe works

### Feature 7: Media
- [ ] Upload works
- [ ] Folders created
- [ ] Thumbnails generated
- [ ] Search works
- [ ] Download tracks

### Feature 8: Search
- [ ] Full-text search works
- [ ] Filters apply
- [ ] Suggestions show
- [ ] History saves
- [ ] Autocomplete works

### Feature 9: Drafts
- [ ] Auto-save works
- [ ] Versions saved
- [ ] Restore works
- [ ] Publish works
- [ ] Preview works

### Feature 10: i18n
- [ ] Language switches
- [ ] Translations load
- [ ] Post translations work
- [ ] Fallback works
- [ ] SEO URLs work

---

## 🐛 TROUBLESHOOTING

### WebSocket not connecting
```javascript
// Check if server is running
// Check WS_PORT in .env
// Check firewall settings
// Try different browser
```

### Push notifications not working
```bash
# Generate new VAPID keys
npx web-push generate-vapid-keys

# Check HTTPS (required for push)
# Check browser permissions
# Check service worker registration
```

### File upload fails
```bash
# Check UPLOAD_DIR exists
mkdir -p public/uploads

# Check permissions
chmod 755 public/uploads

# Check MAX_FILE_SIZE in .env
```

---

## 📚 DOCUMENTATION

- **NEW_FEATURES_PHASE2_COMPLETE.md** - Complete feature documentation
- **API Documentation** - Check each controller for endpoints
- **Database Schema** - See migration file for table structures

---

## 🎉 COMPLETION

Sau khi hoàn thành tất cả bước:

1. ✅ Migration chạy thành công
2. ✅ Dependencies installed
3. ✅ Environment configured
4. ✅ Models created
5. ✅ Services created
6. ✅ Controllers created
7. ✅ Routes created
8. ✅ WebSocket setup
9. ✅ Frontend integrated
10. ✅ All features tested

**Status: READY FOR PRODUCTION! 🚀**

---

**Created by: Kiro AI Assistant**
**Date: April 27, 2026**
**Version: 2.0.0**

