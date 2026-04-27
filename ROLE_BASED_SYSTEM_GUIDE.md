# 🎭 ROLE-BASED ACCESS CONTROL SYSTEM

## 📋 Tổng quan

Hệ thống phân quyền 4 role với dashboard riêng biệt và permissions chi tiết.

---

## 👥 4 ROLES

### 1. 👑 ADMIN (Quản trị viên)
**Level**: 1 (Cao nhất)
**Color**: #ef4444 (Red)
**Icon**: 👑

**Quyền hạn:**
- ✅ Toàn quyền quản lý hệ thống
- ✅ Quản lý người dùng (CRUD, gán role)
- ✅ Quản lý tất cả bài viết
- ✅ Quản lý tất cả bình luận
- ✅ Quản lý danh mục
- ✅ Quản lý media
- ✅ Cài đặt hệ thống
- ✅ Xem analytics đầy đủ
- ✅ Quản lý permissions

**Dashboard Features:**
- Tổng quan hệ thống
- Thống kê người dùng
- Biểu đồ tăng trưởng
- Phân bố vai trò
- Hoạt động gần đây
- Top tác giả
- Bài viết phổ biến

### 2. ✏️ EDITOR (Biên tập viên)
**Level**: 2
**Color**: #8b5cf6 (Purple)
**Icon**: ✏️

**Quyền hạn:**
- ✅ Tạo, sửa, xóa bài viết (tất cả)
- ✅ Xuất bản/Hủy xuất bản bài viết
- ✅ Kiểm duyệt bình luận
- ✅ Quản lý danh mục
- ✅ Quản lý media (tất cả)
- ✅ Xem analytics
- ❌ Không quản lý người dùng
- ❌ Không thay đổi cài đặt

**Dashboard Features:**
- Thống kê nội dung
- Bài viết chờ duyệt
- Bình luận chờ kiểm duyệt
- Bài viết mới xuất bản
- Phân tích theo danh mục
- Timeline hoạt động

### 3. 📝 AUTHOR (Tác giả)
**Level**: 3
**Color**: #10b981 (Green)
**Icon**: 📝

**Quyền hạn:**
- ✅ Tạo bài viết mới
- ✅ Sửa bài viết của mình
- ✅ Xóa bài viết của mình
- ✅ Quản lý bình luận trên bài viết của mình
- ✅ Upload media
- ✅ Xem analytics của mình
- ❌ Không sửa bài viết người khác
- ❌ Không xuất bản trực tiếp (cần Editor duyệt)

**Dashboard Features:**
- Thống kê cá nhân
- Bài viết của tôi
- Bài viết phổ biến
- Bình luận gần đây
- Biểu đồ hiệu suất
- Engagement rate

### 4. 👁️ READER (Độc giả)
**Level**: 4 (Thấp nhất)
**Color**: #3b82f6 (Blue)
**Icon**: 👁️

**Quyền hạn:**
- ✅ Đọc bài viết
- ✅ Viết bình luận
- ✅ Sửa/Xóa bình luận của mình
- ✅ Like bài viết
- ✅ Bookmark bài viết
- ✅ Follow tác giả
- ❌ Không tạo bài viết
- ❌ Không truy cập admin panel

**Dashboard Features:**
- Bài viết đã bookmark
- Bình luận của tôi
- Bài viết gợi ý
- Bài viết từ người theo dõi
- Lịch sử đọc
- Thống kê cá nhân

---

## 🔐 PERMISSIONS SYSTEM

### Modules & Actions

#### Posts Module
```javascript
posts.create        // Tạo bài viết
posts.read          // Xem bài viết
posts.update        // Sửa bài viết
posts.delete        // Xóa bài viết
posts.publish       // Xuất bản bài viết
posts.manage_all    // Quản lý tất cả bài viết
```

#### Users Module
```javascript
users.create        // Tạo người dùng
users.read          // Xem người dùng
users.update        // Sửa người dùng
users.delete        // Xóa người dùng
users.manage_roles  // Quản lý vai trò
```

#### Comments Module
```javascript
comments.create     // Tạo bình luận
comments.read       // Xem bình luận
comments.update     // Sửa bình luận
comments.delete     // Xóa bình luận
comments.moderate   // Kiểm duyệt bình luận
```

#### Categories Module
```javascript
categories.create   // Tạo danh mục
categories.read     // Xem danh mục
categories.update   // Sửa danh mục
categories.delete   // Xóa danh mục
```

#### Media Module
```javascript
media.upload        // Tải lên media
media.read          // Xem media
media.delete        // Xóa media
media.manage_all    // Quản lý tất cả media
```

#### Settings Module
```javascript
settings.read       // Xem cài đặt
settings.update     // Sửa cài đặt
```

#### Analytics Module
```javascript
analytics.read      // Xem thống kê
analytics.export    // Xuất báo cáo
```

#### Dashboard Module
```javascript
dashboard.admin     // Dashboard Admin
dashboard.editor    // Dashboard Editor
dashboard.author    // Dashboard Author
```

---

## 🗄️ DATABASE TABLES

### 1. roles
```sql
- id (PK)
- role_name (UNIQUE)
- role_display_name
- description
- level (1-4)
- color
- icon
- is_active
- created_at, updated_at
```

### 2. permissions
```sql
- id (PK)
- permission_name (UNIQUE)
- permission_display_name
- description
- module
- action
- is_active
- created_at, updated_at
```

### 3. role_permissions
```sql
- id (PK)
- role_name (FK)
- permission_name (FK)
- granted_at
- granted_by
```

### 4. user_permissions
```sql
- id (PK)
- user_id (FK)
- permission_name (FK)
- granted (TRUE/FALSE)
- granted_at
- granted_by
- expires_at
- reason
```

### 5. activity_logs
```sql
- id (PK)
- user_id (FK)
- action
- module
- target_type
- target_id
- description
- ip_address
- user_agent
- metadata (JSON)
- created_at
```

### 6. notifications
```sql
- id (PK)
- user_id (FK)
- type
- title
- message
- link
- icon
- is_read
- read_at
- priority
- metadata (JSON)
- created_at
```

### 7. user_sessions
```sql
- id (PK)
- user_id (FK)
- session_token
- ip_address
- user_agent
- device_type
- browser
- os
- location
- is_active
- last_activity
- expires_at
- created_at
```

### 8. dashboard_widgets
```sql
- id (PK)
- widget_name
- widget_display_name
- description
- widget_type
- component_path
- default_config (JSON)
- roles (JSON)
- is_active
- display_order
- created_at, updated_at
```

### 9. user_dashboard_preferences
```sql
- id (PK)
- user_id (FK)
- widget_name (FK)
- is_visible
- position
- size
- custom_config (JSON)
- updated_at
```

---

## 📡 API ENDPOINTS

### Dashboard APIs
```javascript
GET  /api/dashboard              // Get dashboard by role
GET  /api/dashboard/admin        // Admin dashboard
GET  /api/dashboard/editor       // Editor dashboard
GET  /api/dashboard/author       // Author dashboard
GET  /api/dashboard/reader       // Reader dashboard
```

### Notifications APIs
```javascript
GET  /api/dashboard/notifications                    // Get notifications
PUT  /api/dashboard/notifications/:id/read           // Mark as read
PUT  /api/dashboard/notifications/read-all           // Mark all as read
```

### Permissions APIs
```javascript
GET  /api/permissions                                // List all permissions
GET  /api/permissions/user/:userId                   // Get user permissions
POST /api/permissions/grant                          // Grant permission
POST /api/permissions/revoke                         // Revoke permission
```

### Roles APIs
```javascript
GET  /api/roles                                      // List all roles
GET  /api/roles/:roleName                            // Get role details
GET  /api/roles/:roleName/permissions                // Get role permissions
POST /api/roles/:roleName/permissions                // Add permission to role
DELETE /api/roles/:roleName/permissions/:permission  // Remove permission
```

---

## 🔧 MIDDLEWARE USAGE

### Check Permission
```javascript
const { checkPermission } = require('../middleware/permissionMiddleware');

router.post('/posts', 
    checkPermission('posts.create'),
    PostController.create
);
```

### Check Multiple Permissions (ANY)
```javascript
const { checkAnyPermission } = require('../middleware/permissionMiddleware');

router.put('/posts/:id',
    checkAnyPermission(['posts.update', 'posts.manage_all']),
    PostController.update
);
```

### Check Multiple Permissions (ALL)
```javascript
const { checkAllPermissions } = require('../middleware/permissionMiddleware');

router.post('/users',
    checkAllPermissions(['users.create', 'users.manage_roles']),
    UserController.create
);
```

### Check Role
```javascript
const { checkRole } = require('../middleware/permissionMiddleware');

router.get('/admin/dashboard',
    checkRole('admin'),
    DashboardController.getAdminDashboard
);

// Multiple roles
router.get('/editor/dashboard',
    checkRole(['admin', 'editor']),
    DashboardController.getEditorDashboard
);
```

### Check Ownership
```javascript
const { checkOwnership } = require('../middleware/permissionMiddleware');

router.put('/posts/:id',
    checkOwnership('post'),
    PostController.update
);
```

---

## 🚀 INSTALLATION

### 1. Run Migration
```bash
node run-role-migration.js
```

### 2. Verify Tables
```bash
node test-role-system.js
```

### 3. Update app.js
```javascript
const dashboardRoutes = require('./src/routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);
```

### 4. Start Server
```bash
npm start
```

---

## 💻 USAGE EXAMPLES

### Grant Permission to User
```javascript
const { UserPermission } = require('./models');

await UserPermission.create({
    user_id: 123,
    permission_name: 'posts.publish',
    granted: true,
    granted_by: 1, // Admin ID
    expires_at: new Date('2025-12-31')
});
```

### Revoke Permission
```javascript
await UserPermission.update(
    { granted: false },
    { where: { user_id: 123, permission_name: 'posts.publish' } }
);
```

### Check User Permission
```javascript
const { userHasPermission } = require('./middleware/permissionMiddleware');

const hasPermission = await userHasPermission(userId, 'posts.create');
```

### Log Activity
```javascript
const { ActivityLog } = require('./models');

await ActivityLog.create({
    user_id: req.user.id,
    action: 'create',
    module: 'posts',
    target_type: 'post',
    target_id: post.id,
    description: `Created post: ${post.title}`,
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
});
```

### Send Notification
```javascript
const { Notification } = require('./models');

await Notification.create({
    user_id: authorId,
    type: 'post_published',
    title: 'Bài viết đã được xuất bản',
    message: `Bài viết "${post.title}" đã được xuất bản`,
    link: `/posts/${post.slug}`,
    icon: '📝',
    priority: 'normal'
});
```

---

## 📊 DASHBOARD WIDGETS

### Admin Widgets
- total_users
- total_posts
- total_comments
- total_views
- user_activity (chart)
- post_analytics (chart)
- recent_posts
- pending_comments

### Editor Widgets
- total_posts
- pending_posts
- pending_comments
- post_analytics
- recent_published
- comments_moderation

### Author Widgets
- my_posts
- my_views
- my_likes
- my_comments
- performance_chart
- recent_comments

### Reader Widgets
- my_bookmarks
- my_comments
- recommended_posts
- following_posts
- reading_history

---

## 🎨 UI CUSTOMIZATION

### Role Colors
```css
.role-admin { --role-color: #ef4444; }
.role-editor { --role-color: #8b5cf6; }
.role-author { --role-color: #10b981; }
.role-reader { --role-color: #3b82f6; }
```

### Dashboard Themes
Each role has custom dashboard theme with:
- Role-specific color scheme
- Custom widgets
- Tailored navigation
- Personalized stats

---

## 🔒 SECURITY FEATURES

1. **Permission Inheritance**: Role-based + User-specific
2. **Permission Expiration**: Temporary permissions
3. **Activity Logging**: All actions logged
4. **Session Management**: Track user sessions
5. **IP Tracking**: Monitor access locations
6. **Ownership Check**: Resource-level security

---

## 📝 TODO / ENHANCEMENTS

- [ ] Two-factor authentication
- [ ] Permission templates
- [ ] Bulk permission management
- [ ] Advanced audit logs
- [ ] Real-time notifications
- [ ] Custom dashboard layouts
- [ ] Widget marketplace
- [ ] Role hierarchy
- [ ] Permission groups

---

## 🎉 SUMMARY

**Đã triển khai:**
- ✅ 4 Roles với permissions chi tiết
- ✅ 9 Database tables mới
- ✅ Permission middleware
- ✅ Dashboard cho từng role
- ✅ Activity logging
- ✅ Notifications system
- ✅ Session management
- ✅ Modern UI/UX

**Files created: 15+**
**Database tables: 9**
**Permissions: 30+**
**API endpoints: 15+**

---

**Ready to use! 🚀**
