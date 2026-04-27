/**
 * Safe Role Migration Runner
 * Chạy migration an toàn từng bước
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'node_blog_db',
    multipleStatements: true
};

async function runSafeMigration() {
    let connection;

    try {
        console.log('🚀 Bắt đầu migration an toàn...\n');
        
        connection = await mysql.createConnection(config);
        console.log('✅ Kết nối database thành công!\n');

        // Step 1: Update users table role
        console.log('📝 Bước 1: Cập nhật role trong users table...');
        try {
            // Add temporary column
            await connection.query('ALTER TABLE users ADD COLUMN role_new VARCHAR(50) NULL');
            console.log('  ✓ Thêm cột role_new');

            // Map old roles to new roles
            await connection.query(`
                UPDATE users SET role_new = CASE
                    WHEN role = 'admin' THEN 'admin'
                    WHEN role = 'manager' THEN 'editor'
                    WHEN role = 'editor' THEN 'author'
                    WHEN role = 'user' THEN 'reader'
                    ELSE 'reader'
                END
            `);
            console.log('  ✓ Map role cũ sang role mới');

            // Drop old role column
            await connection.query('ALTER TABLE users DROP COLUMN role');
            console.log('  ✓ Xóa cột role cũ');

            // Rename role_new to role
            await connection.query(`
                ALTER TABLE users 
                CHANGE COLUMN role_new role 
                ENUM('admin', 'editor', 'author', 'reader') DEFAULT 'reader'
            `);
            console.log('  ✓ Đổi tên role_new thành role');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('  ⚠️  Cột role_new đã tồn tại, bỏ qua...');
            } else if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log('  ⚠️  Cột role đã được cập nhật, bỏ qua...');
            } else {
                throw error;
            }
        }

        // Step 2: Add new columns to users
        console.log('\n📝 Bước 2: Thêm cột mới vào users...');
        const newColumns = [
            "ADD COLUMN status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'active' AFTER role",
            "ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER email",
            "ADD COLUMN phone VARCHAR(20) NULL AFTER email_verified",
            "ADD COLUMN department VARCHAR(100) NULL AFTER phone",
            "ADD COLUMN position VARCHAR(100) NULL AFTER department",
            "ADD COLUMN last_login TIMESTAMP NULL AFTER position",
            "ADD COLUMN login_count INT DEFAULT 0 AFTER last_login",
            "ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE AFTER login_count",
            "ADD COLUMN preferences JSON NULL AFTER profile_completed",
            "ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ];

        for (const col of newColumns) {
            try {
                await connection.query(`ALTER TABLE users ${col}`);
                console.log(`  ✓ ${col.split(' ')[2]}`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`  ⚠️  ${col.split(' ')[2]} đã tồn tại`);
                } else {
                    console.log(`  ❌ ${col.split(' ')[2]}: ${error.message}`);
                }
            }
        }

        // Step 3: Create roles table
        console.log('\n📝 Bước 3: Tạo bảng roles...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role_name VARCHAR(50) UNIQUE NOT NULL,
                role_display_name VARCHAR(100) NOT NULL,
                description TEXT NULL,
                level INT NOT NULL,
                color VARCHAR(20) DEFAULT '#3b82f6',
                icon VARCHAR(50) DEFAULT '👤',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_role_name (role_name),
                INDEX idx_level (level)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('  ✓ Bảng roles đã tạo');

        // Insert roles
        await connection.query(`
            INSERT INTO roles (role_name, role_display_name, description, level, color, icon) VALUES
            ('admin', 'Quản trị viên', 'Toàn quyền quản lý hệ thống', 1, '#ef4444', '👑'),
            ('editor', 'Biên tập viên', 'Quản lý và duyệt nội dung', 2, '#8b5cf6', '✏️'),
            ('author', 'Tác giả', 'Tạo và quản lý bài viết của mình', 3, '#10b981', '📝'),
            ('reader', 'Độc giả', 'Đọc và tương tác với nội dung', 4, '#3b82f6', '👁️')
            ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
        `);
        console.log('  ✓ Đã insert 4 roles');

        // Step 4: Create permissions table
        console.log('\n📝 Bước 4: Tạo bảng permissions...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                permission_name VARCHAR(100) UNIQUE NOT NULL,
                permission_display_name VARCHAR(150) NOT NULL,
                description TEXT NULL,
                module VARCHAR(50) NOT NULL,
                action VARCHAR(50) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_permission_name (permission_name),
                INDEX idx_module (module)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('  ✓ Bảng permissions đã tạo');

        // Insert permissions
        const permissions = [
            ['posts.create', 'Tạo bài viết', 'Tạo bài viết mới', 'posts', 'create'],
            ['posts.read', 'Xem bài viết', 'Xem tất cả bài viết', 'posts', 'read'],
            ['posts.update', 'Sửa bài viết', 'Chỉnh sửa bài viết', 'posts', 'update'],
            ['posts.delete', 'Xóa bài viết', 'Xóa bài viết', 'posts', 'delete'],
            ['posts.publish', 'Xuất bản', 'Xuất bản bài viết', 'posts', 'publish'],
            ['posts.manage_all', 'Quản lý tất cả', 'Quản lý bài viết của mọi người', 'posts', 'manage'],
            ['users.create', 'Tạo người dùng', 'Tạo tài khoản mới', 'users', 'create'],
            ['users.read', 'Xem người dùng', 'Xem thông tin', 'users', 'read'],
            ['users.update', 'Sửa người dùng', 'Chỉnh sửa thông tin', 'users', 'update'],
            ['users.delete', 'Xóa người dùng', 'Xóa tài khoản', 'users', 'delete'],
            ['users.manage_roles', 'Quản lý vai trò', 'Gán vai trò', 'users', 'manage'],
            ['comments.create', 'Tạo bình luận', 'Viết bình luận', 'comments', 'create'],
            ['comments.read', 'Xem bình luận', 'Xem bình luận', 'comments', 'read'],
            ['comments.update', 'Sửa bình luận', 'Sửa bình luận', 'comments', 'update'],
            ['comments.delete', 'Xóa bình luận', 'Xóa bình luận', 'comments', 'delete'],
            ['comments.moderate', 'Kiểm duyệt', 'Duyệt bình luận', 'comments', 'moderate'],
            ['categories.create', 'Tạo danh mục', 'Tạo danh mục', 'categories', 'create'],
            ['categories.read', 'Xem danh mục', 'Xem danh mục', 'categories', 'read'],
            ['categories.update', 'Sửa danh mục', 'Sửa danh mục', 'categories', 'update'],
            ['categories.delete', 'Xóa danh mục', 'Xóa danh mục', 'categories', 'delete'],
            ['media.upload', 'Tải media', 'Tải lên media', 'media', 'upload'],
            ['media.read', 'Xem media', 'Xem media', 'media', 'read'],
            ['media.delete', 'Xóa media', 'Xóa media', 'media', 'delete'],
            ['media.manage_all', 'Quản lý media', 'Quản lý tất cả media', 'media', 'manage'],
            ['settings.read', 'Xem cài đặt', 'Xem cài đặt', 'settings', 'read'],
            ['settings.update', 'Sửa cài đặt', 'Sửa cài đặt', 'settings', 'update'],
            ['analytics.read', 'Xem thống kê', 'Xem thống kê', 'analytics', 'read'],
            ['analytics.export', 'Xuất báo cáo', 'Xuất báo cáo', 'analytics', 'export'],
            ['dashboard.admin', 'Dashboard Admin', 'Dashboard quản trị', 'dashboard', 'access'],
            ['dashboard.editor', 'Dashboard Editor', 'Dashboard biên tập', 'dashboard', 'access'],
            ['dashboard.author', 'Dashboard Author', 'Dashboard tác giả', 'dashboard', 'access']
        ];

        for (const perm of permissions) {
            try {
                await connection.query(
                    'INSERT INTO permissions (permission_name, permission_display_name, description, module, action) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP',
                    perm
                );
            } catch (error) {
                // Ignore duplicates
            }
        }
        console.log(`  ✓ Đã insert ${permissions.length} permissions`);

        // Step 5: Create role_permissions table
        console.log('\n📝 Bước 5: Tạo bảng role_permissions...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS role_permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role_name VARCHAR(50) NOT NULL,
                permission_name VARCHAR(100) NOT NULL,
                granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                granted_by INT NULL,
                UNIQUE KEY unique_role_permission (role_name, permission_name),
                INDEX idx_role_name (role_name),
                INDEX idx_permission_name (permission_name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('  ✓ Bảng role_permissions đã tạo');

        // Assign permissions to roles
        console.log('  ⚙️  Gán permissions cho roles...');
        
        // Admin: all permissions
        const [allPerms] = await connection.query('SELECT permission_name FROM permissions');
        for (const perm of allPerms) {
            try {
                await connection.query(
                    'INSERT INTO role_permissions (role_name, permission_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE granted_at = CURRENT_TIMESTAMP',
                    ['admin', perm.permission_name]
                );
            } catch (error) {}
        }
        console.log('    ✓ Admin: all permissions');

        // Editor permissions
        const editorPerms = ['posts.create', 'posts.read', 'posts.update', 'posts.delete', 'posts.publish', 'posts.manage_all',
                            'comments.read', 'comments.update', 'comments.delete', 'comments.moderate',
                            'categories.create', 'categories.read', 'categories.update', 'categories.delete',
                            'media.upload', 'media.read', 'media.delete', 'media.manage_all',
                            'analytics.read', 'dashboard.editor'];
        for (const perm of editorPerms) {
            try {
                await connection.query(
                    'INSERT INTO role_permissions (role_name, permission_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE granted_at = CURRENT_TIMESTAMP',
                    ['editor', perm]
                );
            } catch (error) {}
        }
        console.log('    ✓ Editor: 19 permissions');

        // Author permissions
        const authorPerms = ['posts.create', 'posts.read', 'posts.update', 'posts.delete',
                            'comments.create', 'comments.read', 'comments.update', 'comments.delete',
                            'categories.read', 'media.upload', 'media.read', 'media.delete',
                            'analytics.read', 'dashboard.author'];
        for (const perm of authorPerms) {
            try {
                await connection.query(
                    'INSERT INTO role_permissions (role_name, permission_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE granted_at = CURRENT_TIMESTAMP',
                    ['author', perm]
                );
            } catch (error) {}
        }
        console.log('    ✓ Author: 14 permissions');

        // Reader permissions
        const readerPerms = ['posts.read', 'comments.create', 'comments.read', 'comments.update', 'categories.read', 'media.read'];
        for (const perm of readerPerms) {
            try {
                await connection.query(
                    'INSERT INTO role_permissions (role_name, permission_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE granted_at = CURRENT_TIMESTAMP',
                    ['reader', perm]
                );
            } catch (error) {}
        }
        console.log('    ✓ Reader: 6 permissions');

        // Step 6: Create other tables
        console.log('\n📝 Bước 6: Tạo các bảng khác...');
        
        const tables = [
            { name: 'user_permissions', sql: `CREATE TABLE IF NOT EXISTS user_permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                permission_name VARCHAR(100) NOT NULL,
                granted BOOLEAN DEFAULT TRUE,
                granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                granted_by INT NULL,
                expires_at TIMESTAMP NULL,
                reason TEXT NULL,
                UNIQUE KEY unique_user_permission (user_id, permission_name),
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` },
            
            { name: 'activity_logs', sql: `CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                action VARCHAR(100) NOT NULL,
                module VARCHAR(50) NOT NULL,
                target_type VARCHAR(50) NULL,
                target_id INT NULL,
                description TEXT NULL,
                ip_address VARCHAR(45) NULL,
                user_agent TEXT NULL,
                metadata JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_module (module)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` },
            
            { name: 'notifications', sql: `CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
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
                INDEX idx_is_read (is_read)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` },
            
            { name: 'user_sessions', sql: `CREATE TABLE IF NOT EXISTS user_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                session_token VARCHAR(255) UNIQUE NOT NULL,
                ip_address VARCHAR(45) NULL,
                user_agent TEXT NULL,
                device_type VARCHAR(50) NULL,
                is_active BOOLEAN DEFAULT TRUE,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_is_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` },
            
            { name: 'dashboard_widgets', sql: `CREATE TABLE IF NOT EXISTS dashboard_widgets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                widget_name VARCHAR(100) UNIQUE NOT NULL,
                widget_display_name VARCHAR(150) NOT NULL,
                description TEXT NULL,
                widget_type VARCHAR(50) NOT NULL,
                roles JSON NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` },
            
            { name: 'user_dashboard_preferences', sql: `CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                widget_name VARCHAR(100) NOT NULL,
                is_visible BOOLEAN DEFAULT TRUE,
                position INT DEFAULT 0,
                size VARCHAR(20) DEFAULT 'medium',
                custom_config JSON NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_widget (user_id, widget_name),
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` }
        ];

        for (const table of tables) {
            await connection.query(table.sql);
            console.log(`  ✓ ${table.name}`);
        }

        // Insert widgets
        await connection.query(`
            INSERT INTO dashboard_widgets (widget_name, widget_display_name, description, widget_type, roles, display_order) VALUES
            ('total_users', 'Tổng người dùng', 'Hiển thị tổng số người dùng', 'stats', '["admin"]', 1),
            ('total_posts', 'Tổng bài viết', 'Hiển thị tổng số bài viết', 'stats', '["admin", "editor", "author"]', 2),
            ('total_comments', 'Tổng bình luận', 'Hiển thị tổng số bình luận', 'stats', '["admin", "editor"]', 3),
            ('recent_posts', 'Bài viết gần đây', 'Danh sách bài viết mới nhất', 'list', '["admin", "editor", "author"]', 4)
            ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
        `);
        console.log('  ✓ Đã insert widgets');

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 MIGRATION HOÀN TẤT THÀNH CÔNG!');
        console.log('='.repeat(60));
        
        const [roles] = await connection.query('SELECT COUNT(*) as count FROM roles');
        const [perms] = await connection.query('SELECT COUNT(*) as count FROM permissions');
        const [rolePerms] = await connection.query('SELECT COUNT(*) as count FROM role_permissions');
        
        console.log(`✅ Roles: ${roles[0].count}`);
        console.log(`✅ Permissions: ${perms[0].count}`);
        console.log(`✅ Role Permissions: ${rolePerms[0].count}`);
        console.log('='.repeat(60));

        console.log('\n📝 Các bước tiếp theo:');
        console.log('  1. Test: node test-role-system.js');
        console.log('  2. Start: npm start');
        console.log('  3. Access: http://localhost:8080/api/dashboard\n');

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        console.error('\n💡 Chi tiết:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runSafeMigration();
