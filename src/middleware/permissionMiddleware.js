/**
 * Permission Middleware
 * Kiểm tra quyền truy cập của user
 */

const { User, Role, Permission, RolePermission, UserPermission } = require('../models');
const { Op } = require('sequelize');

class PermissionMiddleware {
    /**
     * Kiểm tra user có permission không
     */
    static checkPermission(permissionName) {
        return async (req, res, next) => {
            try {
                const userId = req.user?.id;

                if (!userId) {
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: 'Vui lòng đăng nhập'
                    });
                }

                const hasPermission = await PermissionMiddleware.userHasPermission(userId, permissionName);

                if (!hasPermission) {
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: 'Bạn không có quyền thực hiện hành động này',
                        required_permission: permissionName
                    });
                }

                next();
            } catch (error) {
                console.error('Permission Check Error:', error);
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: 'Lỗi kiểm tra quyền truy cập'
                });
            }
        };
    }

    /**
     * Kiểm tra user có một trong các permissions
     */
    static checkAnyPermission(permissionNames) {
        return async (req, res, next) => {
            try {
                const userId = req.user?.id;

                if (!userId) {
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: 'Vui lòng đăng nhập'
                    });
                }

                for (const permissionName of permissionNames) {
                    const hasPermission = await PermissionMiddleware.userHasPermission(userId, permissionName);
                    if (hasPermission) {
                        return next();
                    }
                }

                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Bạn không có quyền thực hiện hành động này',
                    required_permissions: permissionNames
                });
            } catch (error) {
                console.error('Permission Check Error:', error);
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: 'Lỗi kiểm tra quyền truy cập'
                });
            }
        };
    }

    /**
     * Kiểm tra user có tất cả permissions
     */
    static checkAllPermissions(permissionNames) {
        return async (req, res, next) => {
            try {
                const userId = req.user?.id;

                if (!userId) {
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: 'Vui lòng đăng nhập'
                    });
                }

                for (const permissionName of permissionNames) {
                    const hasPermission = await PermissionMiddleware.userHasPermission(userId, permissionName);
                    if (!hasPermission) {
                        return res.status(403).json({
                            error: 'Forbidden',
                            message: 'Bạn không có đủ quyền thực hiện hành động này',
                            missing_permission: permissionName
                        });
                    }
                }

                next();
            } catch (error) {
                console.error('Permission Check Error:', error);
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: 'Lỗi kiểm tra quyền truy cập'
                });
            }
        };
    }

    /**
     * Kiểm tra role
     */
    static checkRole(roles) {
        return async (req, res, next) => {
            try {
                const userId = req.user?.id;

                if (!userId) {
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: 'Vui lòng đăng nhập'
                    });
                }

                const user = await User.findByPk(userId);

                if (!user) {
                    return res.status(404).json({
                        error: 'Not Found',
                        message: 'Người dùng không tồn tại'
                    });
                }

                const allowedRoles = Array.isArray(roles) ? roles : [roles];

                if (!allowedRoles.includes(user.role)) {
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: 'Bạn không có quyền truy cập',
                        required_roles: allowedRoles,
                        your_role: user.role
                    });
                }

                next();
            } catch (error) {
                console.error('Role Check Error:', error);
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: 'Lỗi kiểm tra vai trò'
                });
            }
        };
    }

    /**
     * Helper: Kiểm tra user có permission
     */
    static async userHasPermission(userId, permissionName) {
        try {
            // Get user
            const user = await User.findByPk(userId);
            if (!user) return false;

            // Check user-specific permission (override)
            const userPermission = await UserPermission.findOne({
                where: {
                    user_id: userId,
                    permission_name: permissionName,
                    granted: true,
                    [Op.or]: [
                        { expires_at: null },
                        { expires_at: { [Op.gt]: new Date() } }
                    ]
                }
            });

            if (userPermission) return true;

            // Check if permission is revoked for this user
            const revokedPermission = await UserPermission.findOne({
                where: {
                    user_id: userId,
                    permission_name: permissionName,
                    granted: false
                }
            });

            if (revokedPermission) return false;

            // Check role permission
            const rolePermission = await RolePermission.findOne({
                where: {
                    role_name: user.role,
                    permission_name: permissionName
                }
            });

            return !!rolePermission;
        } catch (error) {
            console.error('User Has Permission Error:', error);
            return false;
        }
    }

    /**
     * Get all permissions của user
     */
    static async getUserPermissions(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) return [];

            // Get role permissions
            const rolePermissions = await RolePermission.findAll({
                where: { role_name: user.role },
                include: [{
                    model: Permission,
                    where: { is_active: true }
                }]
            });

            // Get user-specific permissions
            const userPermissions = await UserPermission.findAll({
                where: {
                    user_id: userId,
                    granted: true,
                    [Op.or]: [
                        { expires_at: null },
                        { expires_at: { [Op.gt]: new Date() } }
                    ]
                },
                include: [{
                    model: Permission,
                    where: { is_active: true }
                }]
            });

            // Get revoked permissions
            const revokedPermissions = await UserPermission.findAll({
                where: {
                    user_id: userId,
                    granted: false
                }
            });

            const revokedNames = revokedPermissions.map(p => p.permission_name);

            // Combine and filter
            const allPermissions = [
                ...rolePermissions.map(rp => rp.permission_name),
                ...userPermissions.map(up => up.permission_name)
            ];

            const uniquePermissions = [...new Set(allPermissions)]
                .filter(p => !revokedNames.includes(p));

            return uniquePermissions;
        } catch (error) {
            console.error('Get User Permissions Error:', error);
            return [];
        }
    }

    /**
     * Check if user owns resource
     */
    static checkOwnership(resourceType) {
        return async (req, res, next) => {
            try {
                const userId = req.user?.id;
                const resourceId = req.params.id;

                if (!userId) {
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: 'Vui lòng đăng nhập'
                    });
                }

                // Admin bypass
                const user = await User.findByPk(userId);
                if (user.role === 'admin') {
                    return next();
                }

                // Check ownership based on resource type
                let isOwner = false;

                switch (resourceType) {
                    case 'post':
                        const Post = require('../models/postModel');
                        const post = await Post.findByPk(resourceId);
                        isOwner = post && post.author_id === userId;
                        break;

                    case 'comment':
                        const Comment = require('../models/commentModel');
                        const comment = await Comment.findByPk(resourceId);
                        isOwner = comment && comment.user_id === userId;
                        break;

                    case 'media':
                        const Media = require('../models/Media');
                        const media = await Media.findByPk(resourceId);
                        isOwner = media && media.user_id === userId;
                        break;

                    default:
                        return res.status(400).json({
                            error: 'Bad Request',
                            message: 'Invalid resource type'
                        });
                }

                if (!isOwner) {
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: 'Bạn không có quyền truy cập tài nguyên này'
                    });
                }

                next();
            } catch (error) {
                console.error('Ownership Check Error:', error);
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: 'Lỗi kiểm tra quyền sở hữu'
                });
            }
        };
    }
}

module.exports = PermissionMiddleware;
