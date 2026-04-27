/**
 * Role-Based System Migration Runner
 * Chạy migration cho hệ thống 4 role
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'node_blog_db',
    multipleStatements: true
};

async function runRoleMigration() {
    let connection;

    try {
        console.log('🚀 Bắt đầu migration hệ thống 4 role...\n');
        
        console.log('🔌 Đang kết nối database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Kết nối thành công!\n');

        // Read migration file
        const migrationPath = path.join(__dirname, 'src', 'migrations', '20240427_fix_role_migration.sql');
        console.log(`📄 Đọc file migration: ${migrationPath}`);
        
        const sql = await fs.readFile(migrationPath, 'utf8');
        console.log('✅ Đọc file thành công!\n');

        // Execute migration
        console.log('⚙️  Đang thực thi migration...');
        await connection.query(sql);
        console.log('✅ Migration thành công!\n');

        // Verify tables
        console.log('🔍 Kiểm tra các bảng đã tạo...');
        const [tables] = await connection.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME IN (
                'roles', 
                'permissions', 
                'role_permissions', 
                'user_permissions',
                'activity_logs',
                'notifications',
                'user_sessions',
                'dashboard_widgets',
                'user_dashboard_preferences'
            )
        `, [config.database]);

        console.log('\n📊 Các bảng đã tạo:');
        tables.forEach(table => {
            console.log(`  ✓ ${table.TABLE_NAME}`);
        });

        // Check roles
        console.log('\n🔍 Kiểm tra roles...');
        const [roles] = await connection.query('SELECT role_name, role_display_name, level FROM roles ORDER BY level');
        
        console.log('\n👥 Roles:');
        roles.forEach(role => {
            console.log(`  ${role.level}. ${role.role_display_name} (${role.role_name})`);
        });

        // Check permissions
        console.log('\n🔍 Kiểm tra permissions...');
        const [permissionCount] = await connection.query('SELECT COUNT(*) as count FROM permissions');
        console.log(`\n🔐 Tổng số permissions: ${permissionCount[0].count}`);

        // Check role permissions
        console.log('\n🔍 Kiểm tra role permissions...');
        const [rolePermissions] = await connection.query(`
            SELECT r.role_name, COUNT(rp.permission_name) as permission_count
            FROM roles r
            LEFT JOIN role_permissions rp ON r.role_name = rp.role_name
            GROUP BY r.role_name
            ORDER BY r.level
        `);

        console.log('\n📋 Permissions theo role:');
        rolePermissions.forEach(rp => {
            console.log(`  ${rp.role_name}: ${rp.permission_count} permissions`);
        });

        // Check users table columns
        console.log('\n🔍 Kiểm tra cột mới trong bảng users...');
        const [userColumns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'users'
            AND COLUMN_NAME IN ('status', 'email_verified', 'phone', 'department', 'position', 'last_login', 'login_count', 'profile_completed', 'preferences')
        `, [config.database]);

        console.log('\n📊 Cột mới trong users:');
        userColumns.forEach(col => {
            console.log(`  ✓ ${col.COLUMN_NAME}`);
        });

        // Check views
        console.log('\n🔍 Kiểm tra views...');
        const [views] = await connection.query(`
            SELECT TABLE_NAME 
            FROM information_schema.VIEWS 
            WHERE TABLE_SCHEMA = ?
            AND TABLE_NAME LIKE 'v_%'
        `, [config.database]);

        console.log('\n👁️  Views:');
        views.forEach(view => {
            console.log(`  ✓ ${view.TABLE_NAME}`);
        });

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 MIGRATION HOÀN TẤT THÀNH CÔNG!');
        console.log('='.repeat(60));
        console.log(`✅ Tables: ${tables.length}/9`);
        console.log(`✅ Roles: ${roles.length}/4`);
        console.log(`✅ Permissions: ${permissionCount[0].count}`);
        console.log(`✅ Views: ${views.length}`);
        console.log('='.repeat(60));

        console.log('\n📝 Các bước tiếp theo:');
        console.log('  1. Test hệ thống: node test-role-system.js');
        console.log('  2. Cập nhật app.js với dashboard routes');
        console.log('  3. Khởi động server: npm start');
        console.log('  4. Truy cập dashboard: http://localhost:8080/api/dashboard');
        console.log('\n📚 Xem thêm: ROLE_BASED_SYSTEM_GUIDE.md\n');

    } catch (error) {
        console.error('\n❌ Lỗi migration:', error.message);
        console.error('\n💡 Giải pháp:');
        console.error('  1. Kiểm tra file .env');
        console.error('  2. Kiểm tra MySQL đang chạy');
        console.error('  3. Kiểm tra quyền truy cập database');
        console.error('  4. Kiểm tra file migration tồn tại\n');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Đã đóng kết nối database\n');
        }
    }
}

// Run migration
runRoleMigration();
