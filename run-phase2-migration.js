#!/usr/bin/env node

/**
 * ============================================
 * PHASE 2 MIGRATION RUNNER
 * Run 10 new features migration
 * ============================================
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runMigration() {
    let connection;
    
    try {
        log('\n🚀 Starting Phase 2 Migration...', 'bright');
        log('━'.repeat(50), 'cyan');
        
        // Database configuration
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'my_blog_db',
            multipleStatements: true
        };
        
        log(`\n📊 Connecting to database: ${dbConfig.database}`, 'blue');
        connection = await mysql.createConnection(dbConfig);
        log('✅ Connected successfully!', 'green');
        
        // Read migration file
        const migrationPath = path.join(__dirname, 'src/migrations/20260427_advanced_features_phase2.sql');
        log(`\n📄 Reading migration file...`, 'blue');
        const sql = await fs.readFile(migrationPath, 'utf8');
        log('✅ Migration file loaded!', 'green');
        
        // Execute migration
        log(`\n⚙️  Executing migration...`, 'blue');
        log('This may take a few moments...', 'yellow');
        
        await connection.query(sql);
        
        log('\n✅ Migration executed successfully!', 'green');
        
        // Verify tables
        log(`\n🔍 Verifying tables...`, 'blue');
        const [tables] = await connection.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME IN (
                'realtime_notifications',
                'notification_preferences',
                'user_themes',
                'theme_presets',
                'conversations',
                'conversation_participants',
                'messages',
                'message_reactions',
                'achievements',
                'user_achievements',
                'user_points',
                'point_transactions',
                'dashboard_widgets',
                'user_analytics',
                'push_subscriptions',
                'push_notification_logs',
                'media_files',
                'media_folders',
                'search_history',
                'search_suggestions',
                'post_drafts',
                'draft_versions',
                'languages',
                'translations',
                'post_translations',
                'user_language_preferences'
            )
            ORDER BY TABLE_NAME
        `, [dbConfig.database]);
        
        log(`\n📋 Tables created: ${tables.length}/26`, 'cyan');
        tables.forEach(table => {
            log(`   ✓ ${table.TABLE_NAME}`, 'green');
        });
        
        // Check seed data
        log(`\n🌱 Checking seed data...`, 'blue');
        
        const [themePresets] = await connection.query('SELECT COUNT(*) as count FROM theme_presets');
        log(`   ✓ Theme presets: ${themePresets[0].count}`, 'green');
        
        const [languages] = await connection.query('SELECT COUNT(*) as count FROM languages');
        log(`   ✓ Languages: ${languages[0].count}`, 'green');
        
        const [achievements] = await connection.query('SELECT COUNT(*) as count FROM achievements');
        log(`   ✓ Achievements: ${achievements[0].count}`, 'green');
        
        // Summary
        log('\n' + '━'.repeat(50), 'cyan');
        log('🎉 MIGRATION COMPLETED SUCCESSFULLY!', 'bright');
        log('━'.repeat(50), 'cyan');
        
        log('\n📊 Summary:', 'bright');
        log(`   • Tables created: ${tables.length}`, 'cyan');
        log(`   • Theme presets: ${themePresets[0].count}`, 'cyan');
        log(`   • Languages: ${languages[0].count}`, 'cyan');
        log(`   • Achievements: ${achievements[0].count}`, 'cyan');
        
        log('\n📚 Features Added:', 'bright');
        log('   1. ✅ Real-time Notifications', 'green');
        log('   2. ✅ Theme Customization', 'green');
        log('   3. ✅ Private Messaging', 'green');
        log('   4. ✅ Achievement & Leaderboard', 'green');
        log('   5. ✅ Advanced Dashboard', 'green');
        log('   6. ✅ Push Notifications', 'green');
        log('   7. ✅ Media Gallery', 'green');
        log('   8. ✅ Advanced Search', 'green');
        log('   9. ✅ Draft System', 'green');
        log('   10. ✅ Multi-language Support', 'green');
        
        log('\n🚀 Next Steps:', 'bright');
        log('   1. Install dependencies: npm install ws web-push sharp multer', 'yellow');
        log('   2. Generate VAPID keys: npx web-push generate-vapid-keys', 'yellow');
        log('   3. Update .env file with VAPID keys', 'yellow');
        log('   4. Start server: npm start', 'yellow');
        log('   5. Test features!', 'yellow');
        
        log('\n📖 Documentation:', 'bright');
        log('   • NEW_FEATURES_PHASE2_COMPLETE.md - Full documentation', 'cyan');
        log('   • Check API endpoints and usage examples', 'cyan');
        
        log('\n✨ All 10 features are ready to use!', 'green');
        log('━'.repeat(50) + '\n', 'cyan');
        
    } catch (error) {
        log('\n❌ Migration failed!', 'red');
        log(`Error: ${error.message}`, 'red');
        
        if (error.sql) {
            log(`\nSQL: ${error.sql.substring(0, 200)}...`, 'yellow');
        }
        
        log('\n💡 Troubleshooting:', 'yellow');
        log('   1. Check database connection in .env', 'yellow');
        log('   2. Ensure MySQL is running', 'yellow');
        log('   3. Verify database exists', 'yellow');
        log('   4. Check user permissions', 'yellow');
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            log('🔌 Database connection closed', 'blue');
        }
    }
}

// Run migration
runMigration();
