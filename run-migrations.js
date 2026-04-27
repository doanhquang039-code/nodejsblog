/**
 * Migration Runner Script
 * Chạy tất cả migrations cho User Profile và Chatbot System
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blog_db',
    multipleStatements: true
};

async function runMigrations() {
    let connection;

    try {
        console.log('🔌 Đang kết nối database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Kết nối thành công!\n');

        const migrationsDir = path.join(__dirname, 'src', 'migrations');
        const migrationFiles = [
            '20240427_create_user_profile_tables.sql',
            '20240427_create_chatbot_tables.sql'
        ];

        for (const file of migrationFiles) {
            const filePath = path.join(migrationsDir, file);
            
            try {
                console.log(`📄 Đang chạy migration: ${file}`);
                const sql = await fs.readFile(filePath, 'utf8');
                
                await connection.query(sql);
                console.log(`✅ Migration ${file} thành công!\n`);
            } catch (error) {
                console.error(`❌ Lỗi khi chạy ${file}:`, error.message);
                throw error;
            }
        }

        // Verify tables
        console.log('🔍 Kiểm tra các bảng đã tạo...');
        const [tables] = await connection.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME IN ('user_followers', 'user_badges', 'chat_sessions', 'chat_messages')
        `, [config.database]);

        console.log('\n📊 Các bảng đã tạo:');
        tables.forEach(table => {
            console.log(`  ✓ ${table.TABLE_NAME}`);
        });

        // Check users table columns
        console.log('\n🔍 Kiểm tra cột mới trong bảng users...');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'users'
            AND COLUMN_NAME IN ('bio', 'avatar', 'cover_image', 'location', 'website', 'social_links', 'skills', 'interests')
        `, [config.database]);

        console.log('\n📊 Các cột mới trong bảng users:');
        columns.forEach(col => {
            console.log(`  ✓ ${col.COLUMN_NAME}`);
        });

        console.log('\n🎉 Migration hoàn tất thành công!');
        console.log('\n📝 Các bước tiếp theo:');
        console.log('  1. Khởi động server: npm start');
        console.log('  2. Truy cập profile: http://localhost:8080/profile/:username');
        console.log('  3. Chatbot widget sẽ tự động xuất hiện');
        console.log('\n📚 Xem thêm: USER_PROFILE_CHATBOT_GUIDE.md');

    } catch (error) {
        console.error('\n❌ Lỗi migration:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Đã đóng kết nối database');
        }
    }
}

// Run migrations
console.log('🚀 Bắt đầu chạy migrations...\n');
runMigrations();
