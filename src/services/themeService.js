// ============================================
// THEME SERVICE
// ============================================

const db = require('../models');

class ThemeService {
    /**
     * Get user theme
     */
    static async getUserTheme(userId) {
        let theme = await db.UserTheme.findOne({
            where: { user_id: userId }
        });

        if (!theme) {
            // Create default theme
            theme = await db.UserTheme.create({
                user_id: userId,
                theme_mode: 'light',
                primary_color: '#3b82f6',
                secondary_color: '#8b5cf6',
                accent_color: '#10b981',
                font_family: 'Inter',
                font_size: 'medium'
            });
        }

        return theme;
    }

    /**
     * Update user theme
     */
    static async updateUserTheme(userId, data) {
        let theme = await this.getUserTheme(userId);
        
        await theme.update({
            theme_mode: data.theme_mode || theme.theme_mode,
            primary_color: data.primary_color || theme.primary_color,
            secondary_color: data.secondary_color || theme.secondary_color,
            accent_color: data.accent_color || theme.accent_color,
            font_family: data.font_family || theme.font_family,
            font_size: data.font_size || theme.font_size,
            custom_css: data.custom_css !== undefined ? data.custom_css : theme.custom_css
        });

        return theme;
    }

    /**
     * Get theme presets
     */
    static async getPresets() {
        return await db.ThemePreset.findAll({
            where: { is_active: true },
            order: [['usage_count', 'DESC']]
        });
    }

    /**
     * Apply preset
     */
    static async applyPreset(userId, presetId) {
        const preset = await db.ThemePreset.findByPk(presetId);
        
        if (!preset) {
            throw new Error('Preset not found');
        }

        // Update usage count
        await preset.increment('usage_count');

        // Apply to user theme
        const theme = await this.updateUserTheme(userId, {
            theme_mode: preset.theme_mode,
            primary_color: preset.primary_color,
            secondary_color: preset.secondary_color,
            accent_color: preset.accent_color
        });

        return theme;
    }

    /**
     * Reset to default
     */
    static async resetToDefault(userId) {
        return await this.updateUserTheme(userId, {
            theme_mode: 'light',
            primary_color: '#3b82f6',
            secondary_color: '#8b5cf6',
            accent_color: '#10b981',
            font_family: 'Inter',
            font_size: 'medium',
            custom_css: null
        });
    }

    /**
     * Generate CSS variables
     */
    static generateCSSVariables(theme) {
        return `
            :root {
                --primary-color: ${theme.primary_color};
                --secondary-color: ${theme.secondary_color};
                --accent-color: ${theme.accent_color};
                --font-family: ${theme.font_family}, sans-serif;
                --font-size-base: ${theme.font_size === 'small' ? '14px' : theme.font_size === 'large' ? '18px' : '16px'};
            }
            ${theme.custom_css || ''}
        `;
    }
}

module.exports = ThemeService;
