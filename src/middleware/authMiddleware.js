/**
 * Authentication Middleware
 * Xác thực người dùng
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthMiddleware {
    /**
     * Require authentication
     */
    static async requireAuth(req, res, next) {
        try {
            // Get token from header or cookie
            const token = req.headers.authorization?.replace('Bearer ', '') || 
                         req.cookies?.token;

            if (!token) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Vui lòng đăng nhập'
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

            // Get user
            const user = await User.findByPk(decoded.id || decoded.userId, {
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Người dùng không tồn tại'
                });
            }

            // Check user status
            if (user.status && user.status !== 'active') {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Tài khoản đã bị khóa hoặc chưa kích hoạt'
                });
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Token không hợp lệ'
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Token đã hết hạn'
                });
            }

            console.error('Auth Middleware Error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Lỗi xác thực'
            });
        }
    }

    /**
     * Optional authentication (không bắt buộc đăng nhập)
     */
    static async optionalAuth(req, res, next) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '') || 
                         req.cookies?.token;

            if (!token) {
                req.user = null;
                return next();
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findByPk(decoded.id || decoded.userId, {
                attributes: { exclude: ['password'] }
            });

            req.user = user || null;
            next();
        } catch (error) {
            req.user = null;
            next();
        }
    }

    /**
     * Check if user is authenticated (for views)
     */
    static isAuthenticated(req, res, next) {
        if (req.user) {
            return next();
        }

        // Redirect to login page
        res.redirect('/login');
    }

    /**
     * Check if user is guest (not authenticated)
     */
    static isGuest(req, res, next) {
        if (!req.user) {
            return next();
        }

        // Redirect to dashboard
        res.redirect('/dashboard');
    }

    /**
     * Generate JWT token
     */
    static generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        );
    }

    /**
     * Verify token
     */
    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (error) {
            return null;
        }
    }

    /**
     * Refresh token
     */
    static async refreshToken(req, res) {
        try {
            const oldToken = req.headers.authorization?.replace('Bearer ', '') || 
                            req.cookies?.token;

            if (!oldToken) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Token không tồn tại'
                });
            }

            const decoded = jwt.verify(oldToken, process.env.JWT_SECRET || 'your-secret-key', {
                ignoreExpiration: true
            });

            const user = await User.findByPk(decoded.id || decoded.userId);

            if (!user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Người dùng không tồn tại'
                });
            }

            const newToken = AuthMiddleware.generateToken(user);

            res.json({
                success: true,
                token: newToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Refresh Token Error:', error);
            res.status(500).json({
                error: 'Failed to refresh token'
            });
        }
    }

    /**
     * Logout
     */
    static logout(req, res) {
        // Clear cookie
        res.clearCookie('token');

        res.json({
            success: true,
            message: 'Đăng xuất thành công'
        });
    }
}

module.exports = AuthMiddleware;
