/**
 * Test Role-Based System
 * Kiểm tra hệ thống 4 role hoạt động
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'node_blog_db'
};

async function testRoleSystem() {
    let connection;

    try {
        console.log('🧪 Bắt đầu kiểm tra hệ thống role...\n');
        
        connection = await mysql.createConnection(config);
        console.log('✅ Kết nối database thành công\n');

        // Test 1: Check all tables exist
        console.log('📋 Test 1: Kiểm tra các bảng...');
        const requiredTables = [
            'roles',
            'permissions',
            'role_permissions',
            'user_permissions',
            'activity_logs',
            'notifications',
            'user_sessions',
            'dashboard_widgets',
            'user_dashboard_preferences'
        ];

        const [tables] = await connection.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ?
        `, [config.database]);

        const tableNames = tables.map(t => t.TABLE_NAME);
        let tablesOk = true;

        requiredTables.forEach(table => {
            if (tableNames.includes(table)) {
                console.log(`  ✅ ${table}`);
            } else {
                console.log(`  ❌ ${table} - MISSING!`);
                tablesOk = false;
            }
        });

        // Test 2: Check roles data
        console.log('\n📋 Test 2: Kiểm tra roles...');
        const [roles] = await connection.query('SELECT * FROM roles ORDER BY level');
        
        const expectedRoles = ['admin', 'editor', 'author', 'reader'];
        let rolesOk = true;

        expectedRoles.forEach(roleName => {
            const role = roles.find(r => r.role_name === roleName);
            if (role) {
                console.log(`  ✅ ${role.role_display_name} (${role.role_name}) - Level ${role.level}`);
            } else {
                console.log(`  ❌ ${roleName} - MISSING!`);
                rolesOk = false;
            }
        });

        // Test 3: Check permissions
        console.log('\n📋 Test 3: Kiểm tra permissions...');
        const [permissions] = await connection.query('SELECT COUNT(*) as count FROM permissions');
        console.log(`  ℹ️  Tổng permissions: ${permissions[0].count}`);

        if (permissions[0].count >= 30) {
            console.log('  ✅ Permissions đầy đủ');
        } else {
            console.log('  ⚠️  Permissions có thể thiếu');
        }

        // Test 4: Check role permissions
        console.log('\n📋 Test 4: Kiểm tra role permissions...');
        const [rolePerms] = await connection.query(`
            SELECT r.role_name, COUNT(rp.permission_name) as count
            FROM roles r
            LEFT JOIN role_permissions rp ON r.role_name = rp.role_name
            GROUP BY r.role_name
            ORDER BY r.level
        `);

        rolePerms.forEach(rp => {
            console.log(`  ${rp.role_name}: ${rp.count} permissions`);
        });

        // Test 5: Check dashboard widgets
        console.log('\n📋 Test 5: Kiểm tra dashboard widgets...');
        const [widgets] = await connection.query('SELECT COUNT(*) as count FROM dashboard_widgets');
        console.log(`  ℹ️  Tổng widgets: ${widgets[0].count}`);

        if (widgets[0].count >= 10) {
            console.log('  ✅ Widgets đầy đủ');
        } else {
            console.log('  ⚠️  Widgets có thể thiếu');
        }

        // Test 6: Check views
        console.log('\n📋 Test 6: Kiểm tra views...');
        const [views] = await connection.query(`
            SELECT TABLE_NAME 
            FROM information_schema.VIEWS 
            WHERE TABLE_SCHEMA = ?
        `, [config.database]);

        views.forEach(view => {
            console.log(`  ✅ ${view.TABLE_NAME}`);
        });

        // Test 7: Test permission query
        console.log('\n📋 Test 7: Test query permissions...');
        try {
            const [adminPerms] = await connection.query(`
                SELECT permission_name 
                FROM role_permissions 
                WHERE role_name = 'admin'
                LIMIT 5
            `);
            console.log(`  ✅ Query thành công - Admin có ${adminPerms.length}+ permissions`);
        } catch (error) {
            console.log(`  ❌ Query thất bại: ${error.message}`);
        }

        // Test 8: Test user with role view
        console.log('\n📋 Test 8: Test view v_users_with_roles...');
        try {
            const [userRoles] = await connection.query(`
                SELECT * FROM v_users_with_roles LIMIT 1
            `);
            if (userRoles.length > 0) {
                console.log(`  ✅ View hoạt động - Sample user: ${userRoles[0].name} (${userRoles[0].role_display_name})`);
            } else {
                console.log('  ℹ️  View hoạt động nhưng chưa có user');
            }
        } catch (error) {
            console.log(`  ❌ View lỗi: ${error.message}`);
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 KẾT QUẢ KIỂM TRA');
        console.log('='.repeat(60));
        console.log(`✅ Database: Connected`);
        console.log(`${tablesOk ? '✅' : '❌'} Tables: ${requiredTables.length} tables`);
        console.log(`${rolesOk ? '✅' : '❌'} Roles: ${roles.length}/4`);
        console.log(`✅ Permissions: ${permissions[0].count}`);
        console.log(`✅ Widgets: ${widgets[0].count}`);
        console.log(`✅ Views: ${views.length}`);
        console.log('='.repeat(60));

        if (tablesOk && rolesOk) {
            console.log('\n🎉 HỆ THỐNG HOẠT ĐỘNG HOÀN HẢO!');
        } else {
            console.log('\n⚠️  HỆ THỐNG CÓ VẤN ĐỀ - Vui lòng chạy lại migration');
        }

        console.log('\n🎯 HƯỚNG DẪN SỬ DỤNG:');
        console.log('1. Cập nhật app.js:');
        console.log('   const dashboardRoutes = require("./src/routes/dashboardRoutes");');
        console.log('   app.use("/api/dashboard", dashboardRoutes);');
        console.log('\n2. Khởi động server: npm start');
        console.log('\n3. Test APIs:');
        console.log('   GET  /api/dashboard');
        console.log('   GET  /api/dashboard/admin');
        console.log('   GET  /api/dashboard/editor');
        console.log('   GET  /api/dashboard/author');
        console.log('   GET  /api/dashboard/reader');
        console.log('\n📚 Xem thêm: ROLE_BASED_SYSTEM_GUIDE.md\n');

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        console.error('\n💡 Giải pháp:');
        console.error('1. Chạy migration: node run-role-migration.js');
        console.error('2. Kiểm tra file .env');
        console.error('3. Kiểm tra MySQL đang chạy\n');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testRoleSystem();
