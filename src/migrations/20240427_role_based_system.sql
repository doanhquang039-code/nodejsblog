-- Migration: Role-Based Access Control System
-- Date: 2024-04-27
-- Description: Mở rộng database với 4 role và permissions system

-- ============================================
-- 1. UPDATE USERS TABLE
-- ============================================

-- Cập nhật role enum trong users table
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'editor', 'author', 'reader') DEFAULT 'reader';

-- Thêm các cột mới cho users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'active' AFTER role,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE AFTER email,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL AFTER email_verified,
ADD COLUMN IF NOT EXISTS department VARCHAR(100) NULL AFTER phone,
ADD COLUMN IF NOT EXISTS position VARCHAR(100) NULL AFTER department,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL AFTER position,
ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0 AFTER last_login,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE AFTER login_count,
ADD COLUMN IF NOT EXISTS preferences JSON NULL AFTER profile_completed,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ============================================
-- 2. ROLES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_display_name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    level INT NOT NULL COMMENT 'Priority level: 1=Admin, 2=Editor, 3=Author, 4=Reader',
    color VARCHAR(20) DEFAULT '#3b82f6',
    icon VARCHAR(50) DEFAULT '👤',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_name (role_name),
    INDEX idx_level (level),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT INTO roles (role_name, role_display_name, description, level, color, icon) VALUES
('admin', 'Quản trị viên', 'Toàn quyền quản lý hệ thống', 1, '#ef4444', '👑'),
('editor', 'Biên tập viên', 'Quản lý và duyệt nội dung', 2, '#8b5cf6', '✏️'),
('author', 'Tác giả', 'Tạo và quản lý bài viết của mình', 3, '#10b981', '📝'),
('reader', 'Độc giả', 'Đọc và tương tác với nội dung', 4, '#3b82f6', '👁️')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- 3. PERMISSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    permission_display_name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    module VARCHAR(50) NOT NULL COMMENT 'posts, users, comments, settings, etc.',
    action VARCHAR(50) NOT NULL COMMENT 'create, read, update, delete, publish, etc.',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_permission_name (permission_name),
    INDEX idx_module (module),
    INDEX idx_action (action),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default permissions
INSERT INTO permissions (permission_name, permission_display_name, description, module, action) VALUES
-- Posts permissions
('posts.create', 'Tạo bài viết', 'Tạo bài viết mới', 'posts', 'create'),
('posts.read', 'Xem bài viết', 'Xem tất cả bài viết', 'posts', 'read'),
('posts.update', 'Sửa bài viết', 'Chỉnh sửa bài viết', 'posts', 'update'),
('posts.delete', 'Xóa bài viết', 'Xóa bài viết', 'posts', 'delete'),
('posts.publish', 'Xuất bản bài viết', 'Xuất bản/Hủy xuất bản bài viết', 'posts', 'publish'),
('posts.manage_all', 'Quản lý tất cả bài viết', 'Quản lý bài viết của mọi người', 'posts', 'manage'),

-- Users permissions
('users.create', 'Tạo người dùng', 'Tạo tài khoản người dùng mới', 'users', 'create'),
('users.read', 'Xem người dùng', 'Xem thông tin người dùng', 'users', 'read'),
('users.update', 'Sửa người dùng', 'Chỉnh sửa thông tin người dùng', 'users', 'update'),
('users.delete', 'Xóa người dùng', 'Xóa tài khoản người dùng', 'users', 'delete'),
('users.manage_roles', 'Quản lý vai trò', 'Gán và thay đổi vai trò người dùng', 'users', 'manage'),

-- Comments permissions
('comments.create', 'Tạo bình luận', 'Viết bình luận', 'comments', 'create'),
('comments.read', 'Xem bình luận', 'Xem tất cả bình luận', 'comments', 'read'),
('comments.update', 'Sửa bình luận', 'Chỉnh sửa bình luận', 'comments', 'update'),
('comments.delete', 'Xóa bình luận', 'Xóa bình luận', 'comments', 'delete'),
('comments.moderate', 'Kiểm duyệt bình luận', 'Duyệt/Từ chối bình luận', 'comments', 'moderate'),

-- Categories permissions
('categories.create', 'Tạo danh mục', 'Tạo danh mục mới', 'categories', 'create'),
('categories.read', 'Xem danh mục', 'Xem danh mục', 'categories', 'read'),
('categories.update', 'Sửa danh mục', 'Chỉnh sửa danh mục', 'categories', 'update'),
('categories.delete', 'Xóa danh mục', 'Xóa danh mục', 'categories', 'delete'),

-- Media permissions
('media.upload', 'Tải lên media', 'Tải lên hình ảnh/video', 'media', 'upload'),
('media.read', 'Xem media', 'Xem thư viện media', 'media', 'read'),
('media.delete', 'Xóa media', 'Xóa file media', 'media', 'delete'),
('media.manage_all', 'Quản lý tất cả media', 'Quản lý media của mọi người', 'media', 'manage'),

-- Settings permissions
('settings.read', 'Xem cài đặt', 'Xem cài đặt hệ thống', 'settings', 'read'),
('settings.update', 'Sửa cài đặt', 'Thay đổi cài đặt hệ thống', 'settings', 'update'),

-- Analytics permissions
('analytics.read', 'Xem thống kê', 'Xem báo cáo và thống kê', 'analytics', 'read'),
('analytics.export', 'Xuất báo cáo', 'Xuất báo cáo ra file', 'analytics', 'export'),

-- Dashboard permissions
('dashboard.admin', 'Dashboard Admin', 'Truy cập dashboard quản trị', 'dashboard', 'access'),
('dashboard.editor', 'Dashboard Editor', 'Truy cập dashboard biên tập', 'dashboard', 'access'),
('dashboard.author', 'Dashboard Author', 'Truy cập dashboard tác giả', 'dashboard', 'access')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- 4. ROLE_PERMISSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INT NULL COMMENT 'User ID who granted this permission',
    UNIQUE KEY unique_role_permission (role_name, permission_name),
    INDEX idx_role_name (role_name),
    INDEX idx_permission_name (permission_name),
    FOREIGN KEY (role_name) REFERENCES roles(role_name) ON DELETE CASCADE,
    FOREIGN KEY (permission_name) REFERENCES permissions(permission_name) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assign permissions to roles

-- ADMIN: Full permissions
INSERT INTO role_permissions (role_name, permission_name) 
SELECT 'admin', permission_name FROM permissions
ON DUPLICATE KEY UPDATE granted_at = CURRENT_TIMESTAMP;

-- EDITOR: Manage content and moderate
INSERT INTO role_permissions (role_name, permission_name) VALUES
('editor', 'posts.create'),
('editor', 'posts.read'),
('editor', 'posts.update'),
('editor', 'posts.delete'),
('editor', 'posts.publish'),
('editor', 'posts.manage_all'),
('editor', 'comments.read'),
('editor', 'comments.update'),
('editor', 'comments.delete'),
('editor', 'comments.moderate'),
('editor', 'categories.create'),
('editor', 'categories.read'),
('editor', 'categories.update'),
('editor', 'categories.delete'),
('editor', 'media.upload'),
('editor', 'media.read'),
('editor', 'media.delete'),
('editor', 'media.manage_all'),
('editor', 'analytics.read'),
('editor', 'dashboard.editor')
ON DUPLICATE KEY UPDATE granted_at = CURRENT_TIMESTAMP;

-- AUTHOR: Create and manage own content
INSERT INTO role_permissions (role_name, permission_name) VALUES
('author', 'posts.create'),
('author', 'posts.read'),
('author', 'posts.update'),
('author', 'posts.delete'),
('author', 'comments.create'),
('author', 'comments.read'),
('author', 'comments.update'),
('author', 'comments.delete'),
('author', 'categories.read'),
('author', 'media.upload'),
('author', 'media.read'),
('author', 'media.delete'),
('author', 'analytics.read'),
('author', 'dashboard.author')
ON DUPLICATE KEY UPDATE granted_at = CURRENT_TIMESTAMP;

-- READER: Basic read and interact
INSERT INTO role_permissions (role_name, permission_name) VALUES
('reader', 'posts.read'),
('reader', 'comments.create'),
('reader', 'comments.read'),
('reader', 'comments.update'),
('reader', 'categories.read'),
('reader', 'media.read')
ON DUPLICATE KEY UPDATE granted_at = CURRENT_TIMESTAMP;

-- ============================================
-- 5. USER_PERMISSIONS TABLE (Override)
-- ============================================

CREATE TABLE IF NOT EXISTS user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    granted BOOLEAN DEFAULT TRUE COMMENT 'TRUE=granted, FALSE=revoked',
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INT NULL COMMENT 'User ID who granted/revoked',
    expires_at TIMESTAMP NULL COMMENT 'Permission expiration',
    reason TEXT NULL,
    UNIQUE KEY unique_user_permission (user_id, permission_name),
    INDEX idx_user_id (user_id),
    INDEX idx_permission_name (permission_name),
    INDEX idx_granted (granted),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_name) REFERENCES permissions(permission_name) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. ACTIVITY_LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NULL COMMENT 'post, user, comment, etc.',
    target_id INT NULL,
    description TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_module (module),
    INDEX idx_target (target_type, target_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. USER_SESSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    device_type VARCHAR(50) NULL COMMENT 'desktop, mobile, tablet',
    browser VARCHAR(50) NULL,
    os VARCHAR(50) NULL,
    location VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'post_published, comment_reply, mention, etc.',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255) NULL,
    icon VARCHAR(50) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. DASHBOARD_WIDGETS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    widget_name VARCHAR(100) UNIQUE NOT NULL,
    widget_display_name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    widget_type VARCHAR(50) NOT NULL COMMENT 'stats, chart, list, etc.',
    component_path VARCHAR(255) NULL,
    default_config JSON NULL,
    roles JSON NOT NULL COMMENT 'Array of roles that can see this widget',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_widget_name (widget_name),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default dashboard widgets
INSERT INTO dashboard_widgets (widget_name, widget_display_name, description, widget_type, roles, display_order) VALUES
('total_users', 'Tổng người dùng', 'Hiển thị tổng số người dùng', 'stats', '["admin"]', 1),
('total_posts', 'Tổng bài viết', 'Hiển thị tổng số bài viết', 'stats', '["admin", "editor", "author"]', 2),
('total_comments', 'Tổng bình luận', 'Hiển thị tổng số bình luận', 'stats', '["admin", "editor"]', 3),
('total_views', 'Tổng lượt xem', 'Hiển thị tổng lượt xem', 'stats', '["admin", "editor", "author"]', 4),
('recent_posts', 'Bài viết gần đây', 'Danh sách bài viết mới nhất', 'list', '["admin", "editor", "author"]', 5),
('pending_comments', 'Bình luận chờ duyệt', 'Bình luận cần kiểm duyệt', 'list', '["admin", "editor"]', 6),
('popular_posts', 'Bài viết phổ biến', 'Bài viết có nhiều lượt xem nhất', 'list', '["admin", "editor", "author"]', 7),
('user_activity', 'Hoạt động người dùng', 'Biểu đồ hoạt động người dùng', 'chart', '["admin"]', 8),
('post_analytics', 'Phân tích bài viết', 'Biểu đồ thống kê bài viết', 'chart', '["admin", "editor", "author"]', 9),
('my_posts', 'Bài viết của tôi', 'Danh sách bài viết của tác giả', 'list', '["author"]', 10)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- 10. USER_DASHBOARD_PREFERENCES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    widget_name VARCHAR(100) NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    position INT DEFAULT 0,
    size VARCHAR(20) DEFAULT 'medium' COMMENT 'small, medium, large',
    custom_config JSON NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_widget (user_id, widget_name),
    INDEX idx_user_id (user_id),
    INDEX idx_widget_name (widget_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Users table indexes
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_last_login ON users(last_login DESC);

-- Posts table indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_posts_author_status ON posts(author_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Comments table indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id, status);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

-- ============================================
-- 12. CREATE VIEWS FOR QUICK ACCESS
-- ============================================

-- View: User with role details
CREATE OR REPLACE VIEW v_users_with_roles AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    r.role_display_name,
    r.level as role_level,
    r.color as role_color,
    r.icon as role_icon,
    u.status,
    u.email_verified,
    u.last_login,
    u.login_count,
    u.created_at
FROM users u
LEFT JOIN roles r ON u.role = r.role_name;

-- View: User permissions (combined role + user specific)
CREATE OR REPLACE VIEW v_user_all_permissions AS
SELECT DISTINCT
    u.id as user_id,
    u.name as user_name,
    u.role,
    p.permission_name,
    p.permission_display_name,
    p.module,
    p.action,
    'role' as source
FROM users u
JOIN role_permissions rp ON u.role = rp.role_name
JOIN permissions p ON rp.permission_name = p.permission_name
WHERE p.is_active = TRUE

UNION

SELECT DISTINCT
    u.id as user_id,
    u.name as user_name,
    u.role,
    p.permission_name,
    p.permission_display_name,
    p.module,
    p.action,
    'user' as source
FROM users u
JOIN user_permissions up ON u.id = up.user_id
JOIN permissions p ON up.permission_name = p.permission_name
WHERE up.granted = TRUE 
AND p.is_active = TRUE
AND (up.expires_at IS NULL OR up.expires_at > NOW());

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

SELECT '✅ Migration completed successfully!' as status;
SELECT COUNT(*) as total_roles FROM roles;
SELECT COUNT(*) as total_permissions FROM permissions;
SELECT COUNT(*) as total_role_permissions FROM role_permissions;
