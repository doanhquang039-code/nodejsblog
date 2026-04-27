/**
 * Test Script for User Profile & Chatbot System
 * Kiểm tra các tính năng đã triển khai
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blog_db'
};

async function testSystem() {
    let connection;

    try {
        console.log('🧪 Bắt đầu kiểm tra hệ thống...\n');
        
        connection = await mysql.createConnection(config);
        console.log('✅ Kết nối database thành công\n');

        // Test 1: Check tables exist
        console.log('📋 Test 1: Kiểm tra các bảng...');
        const [tables] = await connection.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME IN ('users', 'user_followers', 'user_badges', 'chat_sessions', 'chat_messages')
        `, [config.database]);

        const tableNames = tables.map(t => t.TABLE_NAME);
        const requiredTables = ['users', 'user_followers', 'user_badges', 'chat_sessions', 'chat_messages'];
        
        requiredTables.forEach(table => {
            if (tableNames.includes(table)) {
                console.log(`  ✅ ${table}`);
            } else {
                console.log(`  ❌ ${table} - MISSING!`);
            }
        });

        // Test 2: Check users table columns
        console.log('\n📋 Test 2: Kiểm tra cột trong bảng users...');
        const [userColumns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
        `, [config.database]);

        const userColumnNames = userColumns.map(c => c.COLUMN_NAME);
        const requiredColumns = ['bio', 'avatar', 'cover_image', 'location', 'website', 'social_links', 'skills', 'interests'];
        
        requiredColumns.forEach(col => {
            if (userColumnNames.includes(col)) {
                console.log(`  ✅ ${col}`);
            } else {
                console.log(`  ⚠️  ${col} - Not found (might need to run migration)`);
            }
        });

        // Test 3: Check indexes
        console.log('\n📋 Test 3: Kiểm tra indexes...');
        const [indexes] = await connection.query(`
            SELECT DISTINCT TABLE_NAME, INDEX_NAME 
            FROM information_schema.STATISTICS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME IN ('user_followers', 'user_badges', 'chat_sessions', 'chat_messages')
            AND INDEX_NAME != 'PRIMARY'
        `, [config.database]);

        console.log(`  ✅ Tìm thấy ${indexes.length} indexes`);
        indexes.slice(0, 5).forEach(idx => {
            console.log(`     - ${idx.TABLE_NAME}.${idx.INDEX_NAME}`);
        });

        // Test 4: Sample data
        console.log('\n📋 Test 4: Kiểm tra dữ liệu mẫu...');
        
        const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
        console.log(`  ℹ️  Users: ${userCount[0].count}`);

        const [followerCount] = await connection.query('SELECT COUNT(*) as count FROM user_followers');
        console.log(`  ℹ️  Followers: ${followerCount[0].count}`);

        const [badgeCount] = await connection.query('SELECT COUNT(*) as count FROM user_badges');
        console.log(`  ℹ️  Badges: ${badgeCount[0].count}`);

        const [sessionCount] = await connection.query('SELECT COUNT(*) as count FROM chat_sessions');
        console.log(`  ℹ️  Chat Sessions: ${sessionCount[0].count}`);

        const [messageCount] = await connection.query('SELECT COUNT(*) as count FROM chat_messages');
        console.log(`  ℹ️  Chat Messages: ${messageCount[0].count}`);

        // Test 5: Create sample data if needed
        if (userCount[0].count > 0 && badgeCount[0].count === 0) {
            console.log('\n📋 Test 5: Tạo dữ liệu mẫu...');
            
            // Create sample badges
            const [users] = await connection.query('SELECT id FROM users LIMIT 5');
            
            for (const user of users) {
                await connection.query(`
                    INSERT INTO user_badges (user_id, badge_name, badge_description, badge_icon, badge_color, badge_type)
                    VALUES (?, 'Thành viên mới', 'Chào mừng bạn đến với cộng đồng!', '🎉', '#10b981', 'milestone')
                    ON DUPLICATE KEY UPDATE user_id = user_id
                `, [user.id]);
            }
            
            console.log(`  ✅ Đã tạo ${users.length} badges mẫu`);
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 KẾT QUẢ KIỂM TRA');
        console.log('='.repeat(50));
        console.log('✅ Database: Connected');
        console.log(`✅ Tables: ${tableNames.length}/${requiredTables.length}`);
        console.log(`✅ User Columns: ${requiredColumns.filter(c => userColumnNames.includes(c)).length}/${requiredColumns.length}`);
        console.log(`✅ Indexes: ${indexes.length}`);
        console.log('='.repeat(50));

        console.log('\n🎯 HƯỚNG DẪN SỬ DỤNG:');
        console.log('1. Khởi động server: npm start');
        console.log('2. Truy cập profile: http://localhost:8080/profile/:username');
        console.log('3. Edit profile: http://localhost:8080/profile/edit');
        console.log('4. Chatbot widget tự động xuất hiện ở góc phải');
        console.log('\n📚 Xem thêm: USER_PROFILE_CHATBOT_GUIDE.md\n');

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        console.error('\n💡 Giải pháp:');
        console.error('1. Kiểm tra file .env');
        console.error('2. Chạy migration: node run-migrations.js');
        console.error('3. Kiểm tra MySQL đang chạy');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testSystem();
