# 🚀 QUICK START - Role System

## ⚡ Khởi động nhanh (3 bước)

### Bước 1: Chạy Migration
```bash
node run-role-migration.js
```

**Kết quả mong đợi:**
```
✅ Kết nối thành công!
✅ Migration thành công!
✅ Tables: 9/9
✅ Roles: 4/4
✅ Permissions: 30+
```

### Bước 2: Test System (Optional)
```bash
node test-role-system.js
```

### Bước 3: Khởi động Server
```bash
npm start
# hoặc
nodemon app.js
```

---

## 🔧 Troubleshooting

### Lỗi: Cannot find module 'authMiddleware'
✅ **ĐÃ FIX** - File `src/middleware/authMiddleware.js` đã được tạo

### Lỗi: Cannot find module 'Role', 'Permission', etc.
✅ **ĐÃ FIX** - File `src/models/index.js` đã được cập nhật

### Lỗi: Table doesn't exist
```bash
# Chạy lại migration
node run-role-migration.js
```

### Lỗi: Connection refused
```bash
# Kiểm tra MySQL đang chạy
mysql -u root -p

# Kiểm tra .env
cat .env
```

---

## 📡 Test APIs

### 1. Test Dashboard (cần authentication)
```bash
# Get dashboard (auto-detect role)
curl http://localhost:8080/api/dashboard

# Admin dashboard
curl http://localhost:8080/api/dashboard/admin

# Editor dashboard
curl http://localhost:8080/api/dashboard/editor

# Author dashboard
curl http://localhost:8080/api/dashboard/author

# Reader dashboard
curl http://localhost:8080/api/dashboard/reader
```

### 2. Test Notifications
```bash
# Get notifications
curl http://localhost:8080/api/dashboard/notifications

# Mark as read
curl -X PUT http://localhost:8080/api/dashboard/notifications/1/read

# Mark all as read
curl -X PUT http://localhost:8080/api/dashboard/notifications/read-all
```

---

## 🔑 Authentication

### Tạo token test (temporary)
```javascript
// Trong Node.js console hoặc tạo route test
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { id: 1, email: 'admin@example.com', role: 'admin' },
    'your-secret-key',
    { expiresIn: '7d' }
);

console.log(token);
```

### Sử dụng token
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/dashboard
```

---

## 📊 Kiểm tra Database

### Kiểm tra tables
```sql
USE node_blog_db;

SHOW TABLES;

-- Kiểm tra roles
SELECT * FROM roles;

-- Kiểm tra permissions
SELECT COUNT(*) FROM permissions;

-- Kiểm tra role permissions
SELECT r.role_name, COUNT(rp.permission_name) as count
FROM roles r
LEFT JOIN role_permissions rp ON r.role_name = rp.role_name
GROUP BY r.role_name;
```

### Kiểm tra user role
```sql
-- Xem user với role
SELECT * FROM v_users_with_roles;

-- Xem permissions của user
SELECT * FROM v_user_all_permissions WHERE user_id = 1;
```

---

## 🎯 Sử dụng trong Code

### 1. Protect Route với Permission
```javascript
const { checkPermission } = require('./src/middleware/permissionMiddleware');

router.post('/posts', 
    checkPermission('posts.create'),
    PostController.create
);
```

### 2. Protect Route với Role
```javascript
const { checkRole } = require('./src/middleware/permissionMiddleware');

router.get('/admin/dashboard',
    checkRole('admin'),
    DashboardController.getAdminDashboard
);
```

### 3. Check Ownership
```javascript
const { checkOwnership } = require('./src/middleware/permissionMiddleware');

router.put('/posts/:id',
    checkOwnership('post'),
    PostController.update
);
```

### 4. Log Activity
```javascript
const { ActivityLog } = require('./src/models');

await ActivityLog.create({
    user_id: req.user.id,
    action: 'create',
    module: 'posts',
    target_type: 'post',
    target_id: post.id,
    description: `Created post: ${post.title}`,
    ip_address: req.ip
});
```

### 5. Send Notification
```javascript
const { Notification } = require('./src/models');

await Notification.create({
    user_id: authorId,
    type: 'post_published',
    title: 'Bài viết đã được xuất bản',
    message: `Bài viết "${post.title}" đã được xuất bản`,
    link: `/posts/${post.slug}`,
    priority: 'normal'
});
```

---

## 📝 Cấu trúc Files

```
my-blog-node/
├── src/
│   ├── middleware/
│   │   ├── authMiddleware.js          ✅ NEW
│   │   └── permissionMiddleware.js    ✅ NEW
│   ├── models/
│   │   ├── Role.js                    ✅ NEW
│   │   ├── Permission.js              ✅ NEW
│   │   ├── RolePermission.js          ✅ NEW
│   │   ├── UserPermission.js          ✅ NEW
│   │   ├── ActivityLog.js             ✅ NEW
│   │   ├── Notification.js            ✅ NEW
│   │   └── index.js                   ✅ UPDATED
│   ├── controllers/
│   │   └── dashboardController.js     ✅ NEW
│   ├── routes/
│   │   └── dashboardRoutes.js         ✅ NEW
│   ├── views/
│   │   └── dashboard-admin.ejs        ✅ NEW
│   └── migrations/
│       └── 20240427_role_based_system.sql  ✅ NEW
├── public/
│   ├── css/
│   │   └── dashboard.css              ✅ NEW
│   └── js/
│       └── dashboard-admin.js         ✅ NEW
├── run-role-migration.js              ✅ NEW
├── test-role-system.js                ✅ NEW
├── ROLE_BASED_SYSTEM_GUIDE.md         ✅ NEW
└── app.js                             ✅ UPDATED
```

---

## ✅ Checklist

- [x] Migration file created
- [x] Models created (6 models)
- [x] Middleware created (2 files)
- [x] Controller created
- [x] Routes created
- [x] Views created
- [x] Frontend CSS/JS created
- [x] Scripts created
- [x] Documentation created
- [x] app.js updated
- [x] models/index.js updated

---

## 🎉 Hoàn tất!

Server đã sẵn sàng chạy với hệ thống 4 role:

```bash
npm start
```

Truy cập:
- Dashboard: http://localhost:8080/api/dashboard
- Admin: http://localhost:8080/api/dashboard/admin
- Editor: http://localhost:8080/api/dashboard/editor
- Author: http://localhost:8080/api/dashboard/author
- Reader: http://localhost:8080/api/dashboard/reader

---

## 📚 Tài liệu

- **Full Guide**: `ROLE_BASED_SYSTEM_GUIDE.md`
- **Summary**: `ROLE_SYSTEM_SUMMARY.md`
- **Quick Start**: `QUICK_START_ROLE_SYSTEM.md` (this file)

---

**Happy Coding! 🚀**
