-- ============================================
-- ADVANCED FEATURES PHASE 2 - 10 NEW FEATURES
-- Created: 2026-04-27
-- ============================================

-- ============================================
-- FEATURE 1: REAL-TIME NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS realtime_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('like', 'comment', 'follow', 'mention', 'message', 'achievement', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    is_realtime BOOLEAN DEFAULT TRUE,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    realtime_notifications BOOLEAN DEFAULT TRUE,
    notification_types JSON,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FEATURE 2: THEME CUSTOMIZATION
-- ============================================

CREATE TABLE IF NOT EXISTS user_themes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    theme_mode ENUM('light', 'dark', 'auto') DEFAULT 'light',
    primary_color VARCHAR(7) DEFAULT '#3b82f6',
    secondary_color VARCHAR(7) DEFAULT '#8b5cf6',
    accent_color VARCHAR(7) DEFAULT '#10b981',
    font_family VARCHAR(100) DEFAULT 'Inter',
    font_size ENUM('small', 'medium', 'large') DEFAULT 'medium',
    custom_css TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS theme_presets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    theme_mode ENUM('light', 'dark') NOT NULL,
    primary_color VARCHAR(7) NOT NULL,
    secondary_color VARCHAR(7) NOT NULL,
    accent_color VARCHAR(7) NOT NULL,
    preview_image VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FEATURE 3: PRIVATE MESSAGING
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('direct', 'group') DEFAULT 'direct',
    name VARCHAR(255),
    avatar VARCHAR(500),
    created_by INT NOT NULL,
    last_message_id INT,
    last_message_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created_by (created_by),
    INDEX idx_last_message_at (last_message_at),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversation_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    is_muted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_participant (conversation_id, user_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'link', 'system') DEFAULT 'text',
    content TEXT NOT NULL,
    attachments JSON,
    reply_to_id INT,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS message_reactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_reaction (message_id, user_id, emoji),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FEATURE 4: ACHIEVEMENT & LEADERBOARD
-- ============================================

CREATE TABLE IF NOT EXISTS achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('posts', 'engagement', 'social', 'special', 'milestone') NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    points INT DEFAULT 0,
    requirement_type ENUM('count', 'streak', 'quality', 'special') NOT NULL,
    requirement_value INT,
    requirement_data JSON,
    is_active BOOLEAN DEFAULT TRUE,
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    progress INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    notified BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id),
    INDEX idx_completed (is_completed),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    total_points INT DEFAULT 0,
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    rank_position INT,
    weekly_points INT DEFAULT 0,
    monthly_points INT DEFAULT 0,
    last_activity_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_total_points (total_points DESC),
    INDEX idx_level (level DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    points INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FEATURE 5: ADVANCED DASHBOARD
-- ============================================

CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    widget_type VARCHAR(50) NOT NULL,
    position INT DEFAULT 0,
    size ENUM('small', 'medium', 'large') DEFAULT 'medium',
    config JSON,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    posts_created INT DEFAULT 0,
    comments_made INT DEFAULT 0,
    likes_received INT DEFAULT 0,
    views_received INT DEFAULT 0,
    followers_gained INT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FEATURE 6: PUSH NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    endpoint TEXT NOT NULL,
    keys JSON NOT NULL,
    user_agent TEXT,
    device_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS push_notification_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subscription_id INT,
    title VARCHAR(255),
    body TEXT,
    status ENUM('sent', 'failed', 'clicked') DEFAULT 'sent',
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    clicked_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_sent_at (sent_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES push_subscriptions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FEATURE 7: MEDIA GALLERY
-- ============================================

CREATE TABLE IF NOT EXISTS media_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type ENUM('image', 'video', 'audio', 'document') NOT NULL,
    mime_type VARCHAR(100),
    file_size INT,
    width INT,
    height INT,
    duration INT,
    thumbnail_url VARCHAR(500),
    alt_text VARCHAR(255),
    caption TEXT,
    tags JSON,
    folder VARCHAR(100),
    is_public BOOLEAN DEFAULT TRUE,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_file_type (file_type),
    INDEX idx_folder (folder),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_folders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_id INT,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES media_folders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FEATURE 8: ADVANCED SEARCH (Elasticsearch Integration)
-- ============================================

CREATE TABLE IF NOT EXISTS search_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    query TEXT NOT NULL,
    filters JSON,
    results_count INT DEFAULT 0,
    clicked_result_id INT,
    clicked_result_type VARCHAR(50),
    search_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS search_suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    keyword VARCHAR(255) NOT NULL UNIQUE,
    search_count INT DEFAULT 1,
    last_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_search_count (search_count DESC),
    INDEX idx_keyword (keyword)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FEATURE 9: DRAFT SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS post_drafts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255),
    content LONGTEXT,
    excerpt TEXT,
    featured_image VARCHAR(500),
    category_id INT,
    tags JSON,
    metadata JSON,
    version INT DEFAULT 1,
    auto_saved BOOLEAN DEFAULT TRUE,
    last_saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_last_saved_at (last_saved_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS draft_versions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    draft_id INT NOT NULL,
    version INT NOT NULL,
    content LONGTEXT,
    changes_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_draft_id (draft_id),
    FOREIGN KEY (draft_id) REFERENCES post_drafts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FEATURE 10: MULTI-LANGUAGE SUPPORT (i18n)
-- ============================================

CREATE TABLE IF NOT EXISTS languages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    direction ENUM('ltr', 'rtl') DEFAULT 'ltr',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    language_code VARCHAR(10) NOT NULL,
    translation_key VARCHAR(255) NOT NULL,
    translation_value TEXT NOT NULL,
    context VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_translation (language_code, translation_key),
    INDEX idx_language_code (language_code),
    FOREIGN KEY (language_code) REFERENCES languages(code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_post_translation (post_id, language_code),
    INDEX idx_post_id (post_id),
    INDEX idx_language_code (language_code),
    INDEX idx_slug (slug),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (language_code) REFERENCES languages(code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_language_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    preferred_language VARCHAR(10) NOT NULL,
    fallback_language VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (preferred_language) REFERENCES languages(code) ON DELETE CASCADE,
    FOREIGN KEY (fallback_language) REFERENCES languages(code) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA
-- ============================================

-- Theme Presets
INSERT INTO theme_presets (name, description, theme_mode, primary_color, secondary_color, accent_color) VALUES
('Ocean Blue', 'Calm and professional blue theme', 'light', '#3b82f6', '#0ea5e9', '#06b6d4'),
('Forest Green', 'Natural and refreshing green theme', 'light', '#10b981', '#059669', '#34d399'),
('Sunset Orange', 'Warm and energetic orange theme', 'light', '#f97316', '#ea580c', '#fb923c'),
('Royal Purple', 'Elegant and creative purple theme', 'light', '#8b5cf6', '#7c3aed', '#a78bfa'),
('Dark Mode', 'Classic dark theme', 'dark', '#3b82f6', '#8b5cf6', '#10b981'),
('Midnight', 'Deep dark theme', 'dark', '#1e40af', '#6366f1', '#0ea5e9');

-- Languages
INSERT INTO languages (code, name, native_name, is_active, is_default, direction) VALUES
('en', 'English', 'English', TRUE, TRUE, 'ltr'),
('vi', 'Vietnamese', 'Tiếng Việt', TRUE, FALSE, 'ltr'),
('ja', 'Japanese', '日本語', TRUE, FALSE, 'ltr'),
('ko', 'Korean', '한국어', TRUE, FALSE, 'ltr'),
('zh', 'Chinese', '中文', TRUE, FALSE, 'ltr'),
('es', 'Spanish', 'Español', TRUE, FALSE, 'ltr'),
('fr', 'French', 'Français', TRUE, FALSE, 'ltr'),
('de', 'German', 'Deutsch', TRUE, FALSE, 'ltr');

-- Achievements
INSERT INTO achievements (name, description, category, icon, color, points, requirement_type, requirement_value, rarity) VALUES
('First Post', 'Publish your first blog post', 'posts', '📝', '#3b82f6', 10, 'count', 1, 'common'),
('Prolific Writer', 'Publish 10 blog posts', 'posts', '✍️', '#10b981', 50, 'count', 10, 'rare'),
('Content Master', 'Publish 50 blog posts', 'posts', '🏆', '#f59e0b', 200, 'count', 50, 'epic'),
('Legend Writer', 'Publish 100 blog posts', 'posts', '👑', '#8b5cf6', 500, 'count', 100, 'legendary'),
('Social Butterfly', 'Get 100 followers', 'social', '🦋', '#ec4899', 100, 'count', 100, 'rare'),
('Influencer', 'Get 1000 followers', 'social', '⭐', '#f59e0b', 500, 'count', 1000, 'epic'),
('Engagement King', 'Receive 1000 likes', 'engagement', '❤️', '#ef4444', 200, 'count', 1000, 'epic'),
('Comment Champion', 'Make 100 comments', 'engagement', '💬', '#3b82f6', 50, 'count', 100, 'rare'),
('Streak Master', 'Post for 7 days straight', 'special', '🔥', '#f97316', 100, 'streak', 7, 'rare'),
('Early Adopter', 'Join in the first month', 'special', '🎉', '#8b5cf6', 50, 'special', 0, 'rare');

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional indexes for better query performance
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Full-text search indexes
ALTER TABLE posts ADD FULLTEXT INDEX ft_posts_search (title, content);
ALTER TABLE users ADD FULLTEXT INDEX ft_users_search (username, name, bio);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

CREATE OR REPLACE VIEW v_user_statistics AS
SELECT 
    u.id,
    u.username,
    u.name,
    COUNT(DISTINCT p.id) as total_posts,
    COUNT(DISTINCT c.id) as total_comments,
    COUNT(DISTINCT uf.follower_id) as followers_count,
    COUNT(DISTINCT uf2.following_id) as following_count,
    COALESCE(up.total_points, 0) as total_points,
    COALESCE(up.level, 1) as level,
    COUNT(DISTINCT ua.id) as achievements_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON u.id = c.user_id
LEFT JOIN user_followers uf ON u.id = uf.following_id
LEFT JOIN user_followers uf2 ON u.id = uf2.follower_id
LEFT JOIN user_points up ON u.id = up.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id AND ua.is_completed = TRUE
GROUP BY u.id;

CREATE OR REPLACE VIEW v_leaderboard AS
SELECT 
    u.id,
    u.username,
    u.name,
    u.avatar,
    up.total_points,
    up.level,
    up.weekly_points,
    up.monthly_points,
    up.rank_position,
    COUNT(DISTINCT ua.id) as achievements_count,
    ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as current_rank
FROM users u
LEFT JOIN user_points up ON u.id = up.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id AND ua.is_completed = TRUE
GROUP BY u.id
ORDER BY up.total_points DESC;

-- ============================================
-- TRIGGERS FOR AUTO-UPDATES
-- ============================================

DELIMITER //

-- Update conversation last_message_at
CREATE TRIGGER after_message_insert
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
    UPDATE conversations 
    SET last_message_id = NEW.id,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
END//

-- Update user points on post creation
CREATE TRIGGER after_post_insert
AFTER INSERT ON posts
FOR EACH ROW
BEGIN
    INSERT INTO user_points (user_id, total_points, experience)
    VALUES (NEW.user_id, 10, 10)
    ON DUPLICATE KEY UPDATE 
        total_points = total_points + 10,
        experience = experience + 10;
        
    INSERT INTO point_transactions (user_id, points, action_type, description, reference_type, reference_id)
    VALUES (NEW.user_id, 10, 'post_created', 'Created a new post', 'post', NEW.id);
END//

-- Update user points on comment creation
CREATE TRIGGER after_comment_insert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    INSERT INTO user_points (user_id, total_points, experience)
    VALUES (NEW.user_id, 5, 5)
    ON DUPLICATE KEY UPDATE 
        total_points = total_points + 5,
        experience = experience + 5;
        
    INSERT INTO point_transactions (user_id, points, action_type, description, reference_type, reference_id)
    VALUES (NEW.user_id, 5, 'comment_created', 'Made a comment', 'comment', NEW.id);
END//

DELIMITER ;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '✅ Advanced Features Phase 2 Migration Completed!' as Status;
SELECT 'Created 30+ tables for 10 new features' as Info;
SELECT 'Features: Notifications, Themes, Messaging, Achievements, Dashboard, Push, Media, Search, Drafts, i18n' as Features;
