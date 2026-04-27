# 🚀 User Profile & Chatbot System - Quick Start

## 📦 Tính năng mới đã triển khai

### ✅ Hoàn thành 100%

1. **👤 User Profile System**
   - Profile page với avatar, cover image, bio
   - Follow/Unfollow functionality
   - User statistics (posts, followers, following, likes)
   - Badge system (huy hiệu)
   - Skills & Interests tags
   - Social media links
   - Activity timeline
   - Profile editing
   - Password change

2. **🤖 Enhanced Chatbot**
   - AI-powered chatbot với intent detection
   - Smart responses (search, recommendations, FAQ)
   - Session management
   - Message history
   - Typing indicators
   - Quick reply suggestions
   - Feedback system
   - Modern floating widget

## 🚀 Cài đặt nhanh

### Bước 1: Chạy Migration

```bash
node run-migrations.js
```

### Bước 2: Test hệ thống

```bash
node test-profile-chatbot.js
```

### Bước 3: Khởi động server

```bash
npm start
```

### Bước 4: Truy cập

- **Profile**: http://localhost:8080/profile/:username
- **Edit Profile**: http://localhost:8080/profile/edit
- **Chatbot**: Tự động xuất hiện ở góc phải màn hình

## 📁 Files đã tạo

### Controllers (2 files)
- ✅ `src/controllers/userProfileController.js` - Profile logic
- ✅ `src/controllers/enhancedChatbotController.js` - Chatbot logic

### Models (4 files)
- ✅ `src/models/UserFollower.js` - Follow relationships
- ✅ `src/models/UserBadge.js` - User badges
- ✅ `src/models/ChatSession.js` - Chat sessions
- ✅ `src/models/ChatMessage.js` - Chat messages

### Routes (2 files)
- ✅ `src/routes/userProfileRoutes.js` - Profile endpoints
- ✅ `src/routes/chatbotRoutes.js` - Chatbot endpoints

### Views (2 files)
- ✅ `src/views/profile.ejs` - Profile page
- ✅ `src/views/profile-edit.ejs` - Edit profile page

### Frontend (4 files)
- ✅ `public/js/profile.js` - Profile interactions
- ✅ `public/js/chatbot-widget.js` - Chatbot widget
- ✅ `public/css/profile.css` - Profile styles
- ✅ `public/css/chatbot-widget.css` - Chatbot styles

### Database (2 files)
- ✅ `src/migrations/20240427_create_user_profile_tables.sql`
- ✅ `src/migrations/20240427_create_chatbot_tables.sql`

### Scripts & Docs (4 files)
- ✅ `run-migrations.js` - Migration runner
- ✅ `test-profile-chatbot.js` - Test script
- ✅ `USER_PROFILE_CHATBOT_GUIDE.md` - Full documentation
- ✅ `PROFILE_CHATBOT_README.md` - Quick start guide

### Updated Files (1 file)
- ✅ `app.js` - Added routes

## 🎯 API Endpoints

### Profile APIs

```javascript
// View profile
GET /profile/:username
GET /api/profile/:username

// Update profile
PUT /api/profile/update
Body: { name, bio, avatar, coverImage, location, website, twitter, github, linkedin, skills, interests }

// Change password
POST /api/profile/change-password
Body: { currentPassword, newPassword }

// Follow/Unfollow
POST /api/profile/:userId/follow

// Get followers
GET /api/profile/:username/followers?page=1&limit=20

// Get following
GET /api/profile/:username/following?page=1&limit=20

// Get user posts
GET /api/profile/:username/posts?page=1&limit=10

// Get user activity
GET /api/profile/:username/activity?page=1&limit=20

// Get user stats
GET /api/profile/:username/stats?period=30d
```

### Chatbot APIs

```javascript
// Initialize chat
POST /api/chatbot/init
Body: { initialMessage?, context? }

// Send message
POST /api/chatbot/message
Body: { sessionId, message, attachments? }

// Get chat history
GET /api/chatbot/history/:sessionId?page=1&limit=50

// Get user sessions
GET /api/chatbot/sessions?status=active&page=1&limit=10

// Close session
POST /api/chatbot/sessions/:sessionId/close

// Rate message
POST /api/chatbot/messages/:messageId/rate
Body: { rating: 'helpful' | 'not_helpful', feedback? }
```

## 🎨 UI Components

### Profile Page Features
- Modern card-based layout
- Responsive design (mobile, tablet, desktop)
- Interactive tabs (Posts, Activity, About)
- Hover effects and animations
- Badge display with colors
- Social media integration
- Stats with icons

### Chatbot Widget Features
- Floating button with notification badge
- Smooth slide-in animation
- Typing indicators
- Message bubbles (user/bot)
- Quick reply buttons
- Feedback buttons (👍👎)
- Auto-scroll to latest message
- Session persistence

## 🔧 Customization

### Thêm Badge Type mới

```javascript
// Trong userProfileController.js hoặc admin panel
await UserBadge.create({
    userId: 1,
    badgeName: 'Expert Coder',
    badgeDescription: 'Đã viết 100+ bài về lập trình',
    badgeIcon: '💻',
    badgeColor: '#8b5cf6',
    badgeType: 'achievement'
});
```

### Thêm Chatbot Intent

```javascript
// Trong enhancedChatbotController.js
static async detectIntent(message) {
    if (message.includes('pricing')) {
        return { type: 'pricing' };
    }
}

static async handlePricing() {
    return {
        message: 'Thông tin về giá...',
        suggestions: ['Xem gói Premium', 'So sánh gói']
    };
}
```

## 📊 Database Tables

### user_followers
- Quản lý quan hệ follow giữa users
- Indexes: follower_id, following_id

### user_badges
- Lưu trữ huy hiệu của users
- Types: achievement, milestone, special, verified

### chat_sessions
- Quản lý phiên chat
- Status: active, closed, expired

### chat_messages
- Lưu trữ tin nhắn chat
- Types: text, rich, mixed
- Rating: helpful, not_helpful

## 🐛 Troubleshooting

### Migration fails
```bash
# Kiểm tra MySQL đang chạy
mysql -u root -p

# Kiểm tra database tồn tại
SHOW DATABASES;

# Chạy lại migration
node run-migrations.js
```

### Chatbot không hiển thị
```html
<!-- Thêm vào layout hoặc base template -->
<link rel="stylesheet" href="/css/chatbot-widget.css">
<script src="/js/chatbot-widget.js"></script>
```

### Profile 404 error
```javascript
// Kiểm tra routes trong app.js
app.use("/api/profile", userProfileRoutes);
app.use("/profile", userProfileRoutes);
```

## 📈 Performance Tips

1. **Caching**: Cache user profiles với Redis
2. **Pagination**: Luôn sử dụng pagination cho lists
3. **Indexes**: Database đã có indexes tối ưu
4. **Image Optimization**: Compress avatars và covers
5. **Lazy Loading**: Load posts khi scroll

## 🔐 Security Checklist

- ✅ Password hashing (bcrypt)
- ✅ SQL injection protection (Sequelize)
- ✅ Input validation
- ✅ XSS protection
- ⚠️ CSRF tokens (recommended to add)
- ⚠️ Rate limiting (recommended to add)

## 🎉 Tổng kết

**Đã triển khai:**
- ✅ 2 Controllers
- ✅ 4 Models  
- ✅ 2 Route files
- ✅ 2 EJS Views
- ✅ 4 Frontend files (JS + CSS)
- ✅ 2 Migration files
- ✅ 3 Utility scripts
- ✅ 2 Documentation files

**Tổng cộng: 21 files mới + 1 file updated**

## 📞 Support

Nếu gặp vấn đề:
1. Đọc `USER_PROFILE_CHATBOT_GUIDE.md` để biết chi tiết
2. Chạy `node test-profile-chatbot.js` để kiểm tra
3. Kiểm tra console logs trong browser (F12)
4. Kiểm tra server logs

---

**Happy Coding! 🚀**
