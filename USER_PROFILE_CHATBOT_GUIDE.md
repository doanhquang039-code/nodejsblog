# 🎯 Hướng dẫn User Profile & Chatbot System

## 📋 Tổng quan

Hệ thống User Profile và Chatbot đã được triển khai đầy đủ với các tính năng hiện đại và giao diện đẹp mắt.

## ✨ Tính năng đã triển khai

### 1. 👤 User Profile System

#### Tính năng chính:
- ✅ Profile đầy đủ với avatar, cover image, bio
- ✅ Thống kê: posts, followers, following, likes received
- ✅ Follow/Unfollow system
- ✅ Social links (Twitter, GitHub, LinkedIn)
- ✅ Skills và Interests
- ✅ User badges (huy hiệu)
- ✅ Activity timeline
- ✅ Recent posts display
- ✅ Profile editing
- ✅ Password change

#### API Endpoints:

```javascript
// Xem profile
GET /profile/:username
GET /api/profile/:username

// Cập nhật profile
PUT /api/profile/update

// Đổi mật khẩu
POST /api/profile/change-password

// Follow/Unfollow
POST /api/profile/:userId/follow

// Lấy followers
GET /api/profile/:username/followers

// Lấy following
GET /api/profile/:username/following

// Lấy user posts
GET /api/profile/:username/posts

// Lấy user activity
GET /api/profile/:username/activity

// Lấy user stats
GET /api/profile/:username/stats
```

### 2. 🤖 Enhanced Chatbot System

#### Tính năng chính:
- ✅ AI-powered chatbot với intent detection
- ✅ Session management
- ✅ Message history
- ✅ Smart responses (search, recommendation, FAQ)
- ✅ Typing indicators
- ✅ Quick reply suggestions
- ✅ Message feedback system
- ✅ Modern chat widget UI

#### Intent Detection:
- 🔍 **Search**: Tìm kiếm bài viết
- 💡 **Recommendation**: Gợi ý bài viết trending
- ❓ **Question**: Trả lời câu hỏi FAQ
- 📚 **Help**: Hướng dẫn sử dụng
- 👋 **Greeting**: Chào hỏi

#### API Endpoints:

```javascript
// Khởi tạo chat session
POST /api/chatbot/init

// Gửi message
POST /api/chatbot/message

// Lấy lịch sử chat
GET /api/chatbot/history/:sessionId

// Lấy danh sách sessions
GET /api/chatbot/sessions

// Đóng session
POST /api/chatbot/sessions/:sessionId/close

// Rate message
POST /api/chatbot/messages/:messageId/rate
```

## 🗄️ Database Schema

### User Followers Table
```sql
CREATE TABLE user_followers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id)
);
```

### User Badges Table
```sql
CREATE TABLE user_badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    badge_icon VARCHAR(50),
    badge_color VARCHAR(20),
    badge_type ENUM('achievement', 'milestone', 'special', 'verified'),
    is_active BOOLEAN DEFAULT TRUE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INT,
    status ENUM('active', 'closed', 'expired'),
    context TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP,
    ended_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) NOT NULL,
    user_id INT,
    sender ENUM('user', 'bot') NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'rich', 'mixed'),
    metadata JSON,
    attachments JSON,
    suggestions JSON,
    rating ENUM('helpful', 'not_helpful'),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📁 File Structure

```
my-blog-node/
├── src/
│   ├── controllers/
│   │   ├── userProfileController.js       ✅ Profile controller
│   │   └── enhancedChatbotController.js   ✅ Chatbot controller
│   ├── models/
│   │   ├── UserFollower.js                ✅ Follow model
│   │   ├── UserBadge.js                   ✅ Badge model
│   │   ├── ChatSession.js                 ✅ Chat session model
│   │   └── ChatMessage.js                 ✅ Chat message model
│   ├── routes/
│   │   ├── userProfileRoutes.js           ✅ Profile routes
│   │   └── chatbotRoutes.js               ✅ Chatbot routes
│   ├── views/
│   │   ├── profile.ejs                    ✅ Profile view
│   │   └── profile-edit.ejs               ✅ Profile edit view
│   └── migrations/
│       ├── 20240427_create_user_profile_tables.sql  ✅
│       └── 20240427_create_chatbot_tables.sql       ✅
├── public/
│   ├── js/
│   │   ├── profile.js                     ✅ Profile JavaScript
│   │   └── chatbot-widget.js              ✅ Chatbot widget
│   └── css/
│       ├── profile.css                    ✅ Profile styles
│       └── chatbot-widget.css             ✅ Chatbot styles
└── app.js                                 ✅ Updated with routes
```

## 🚀 Cài đặt và Chạy

### 1. Chạy Migration

```bash
# Kết nối MySQL và chạy migration
mysql -u root -p your_database < src/migrations/20240427_create_user_profile_tables.sql
mysql -u root -p your_database < src/migrations/20240427_create_chatbot_tables.sql
```

### 2. Khởi động Server

```bash
npm start
```

### 3. Truy cập

- Profile: `http://localhost:8080/profile/:username`
- Edit Profile: `http://localhost:8080/profile/edit`
- Chatbot widget sẽ tự động xuất hiện ở góc phải màn hình

## 🎨 UI/UX Features

### Profile Page:
- ✨ Modern card-based design
- 📊 Interactive stats (posts, followers, following, likes)
- 🏷️ Badge system với icons và colors
- 📑 Tabbed interface (Posts, Activity, About)
- 🎯 Skills và interests tags
- 🔗 Social media links
- 📱 Fully responsive

### Chatbot Widget:
- 💬 Floating chat button với badge notification
- 🎭 Smooth animations
- ⌨️ Typing indicators
- 💡 Quick reply suggestions
- 👍👎 Message feedback
- 🎨 Modern gradient design
- 📱 Mobile-friendly

## 🔧 Customization

### Thêm Badge mới:

```javascript
await UserBadge.create({
    userId: 1,
    badgeName: 'Top Contributor',
    badgeDescription: 'Đóng góp nhiều bài viết chất lượng',
    badgeIcon: '🏆',
    badgeColor: '#fbbf24',
    badgeType: 'achievement'
});
```

### Thêm Intent mới cho Chatbot:

```javascript
// Trong enhancedChatbotController.js
static async detectIntent(message) {
    // Thêm intent mới
    if (lowerMessage.includes('your-keyword')) {
        return { type: 'your-intent' };
    }
}

static async handleYourIntent() {
    return {
        message: 'Your response',
        suggestions: ['Option 1', 'Option 2']
    };
}
```

## 📊 Analytics & Monitoring

### User Stats:
- Total views
- Total likes
- Total comments
- Posts published
- Engagement rate

### Chatbot Stats:
- Active sessions
- Messages sent/received
- User satisfaction (ratings)
- Popular intents

## 🔐 Security

- ✅ Password hashing với bcrypt
- ✅ Input validation
- ✅ SQL injection protection (Sequelize ORM)
- ✅ XSS protection
- ✅ CSRF protection (recommended to add)

## 🐛 Troubleshooting

### Lỗi kết nối database:
```bash
# Kiểm tra .env file
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
```

### Chatbot không hiển thị:
```javascript
// Thêm vào layout/header
<link rel="stylesheet" href="/css/chatbot-widget.css">
<script src="/js/chatbot-widget.js"></script>
```

### Profile không load:
```bash
# Kiểm tra routes trong app.js
app.use("/api/profile", userProfileRoutes);
app.use("/profile", userProfileRoutes);
```

## 📝 TODO / Future Enhancements

- [ ] Real-time notifications
- [ ] Private messaging system
- [ ] Advanced chatbot with OpenAI integration
- [ ] Profile verification system
- [ ] Achievement system
- [ ] Leaderboard
- [ ] Profile themes
- [ ] Export profile data

## 🎉 Kết luận

Hệ thống User Profile và Chatbot đã được triển khai hoàn chỉnh với:
- ✅ 2 Controllers
- ✅ 4 Models
- ✅ 2 Route files
- ✅ 2 Views (EJS)
- ✅ 2 JavaScript files
- ✅ 2 CSS files
- ✅ 2 Migration files
- ✅ Full documentation

Tất cả đã sẵn sàng để sử dụng! 🚀
