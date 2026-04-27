-- Migration: Create User Profile Tables
-- Date: 2024-04-27

-- User Followers Table
CREATE TABLE IF NOT EXISTS user_followers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (follower_id, following_id),
    INDEX idx_follower_id (follower_id),
    INDEX idx_following_id (following_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (follower_id != following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT NULL,
    badge_icon VARCHAR(50) NULL,
    badge_color VARCHAR(20) DEFAULT '#3b82f6',
    badge_type ENUM('achievement', 'milestone', 'special', 'verified') DEFAULT 'achievement',
    is_active BOOLEAN DEFAULT TRUE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_badge_type (badge_type),
    INDEX idx_is_active (is_active),
    INDEX idx_earned_at (earned_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add new columns to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT NULL AFTER email,
ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) NULL AFTER bio,
ADD COLUMN IF NOT EXISTS cover_image VARCHAR(255) NULL AFTER avatar,
ADD COLUMN IF NOT EXISTS location VARCHAR(100) NULL AFTER cover_image,
ADD COLUMN IF NOT EXISTS website VARCHAR(255) NULL AFTER location,
ADD COLUMN IF NOT EXISTS social_links JSON NULL AFTER website,
ADD COLUMN IF NOT EXISTS skills TEXT NULL AFTER social_links,
ADD COLUMN IF NOT EXISTS interests TEXT NULL AFTER skills;

-- Create indexes for better performance
CREATE INDEX idx_user_followers_follower_created ON user_followers(follower_id, created_at DESC);
CREATE INDEX idx_user_followers_following_created ON user_followers(following_id, created_at DESC);
CREATE INDEX idx_user_badges_user_earned ON user_badges(user_id, earned_at DESC);

-- Insert some default badges for testing
INSERT INTO user_badges (user_id, badge_name, badge_description, badge_icon, badge_color, badge_type)
SELECT 
    id,
    'Thành viên mới',
    'Chào mừng bạn đến với cộng đồng!',
    '🎉',
    '#10b981',
    'milestone'
FROM users
WHERE NOT EXISTS (
    SELECT 1 FROM user_badges WHERE user_id = users.id AND badge_name = 'Thành viên mới'
)
LIMIT 10;
