const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware xác thực token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid or inactive user' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Middleware kiểm tra role
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
};

// Middleware rate limiting
const rateLimiter = (maxRequests, windowMs) => {
    const requests = new Map();

    return (req, res, next) => {
        const userId = req.user?.id || req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Lấy lịch sử requests của user
        if (!requests.has(userId)) {
            requests.set(userId, []);
        }

        const userRequests = requests.get(userId);
        
        // Lọc bỏ requests cũ
        const recentRequests = userRequests.filter(time => time > windowStart);
        
        if (recentRequests.length >= maxRequests) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                maxRequests,
                windowMs,
                retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
            });
        }

        // Thêm request hiện tại
        recentRequests.push(now);
        requests.set(userId, recentRequests);

        next();
    };
};

// Middleware kiểm tra quyền truy cập resource
const checkResourceAccess = (resourceType) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id || req.params.postId;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Admin có quyền truy cập tất cả
            if (userRole === 'admin') {
                return next();
            }

            // Kiểm tra quyền sở hữu resource
            let resource;
            switch (resourceType) {
                case 'post':
                    resource = await Post.findByPk(resourceId);
                    if (resource && (resource.authorId === userId || userRole === 'editor')) {
                        return next();
                    }
                    break;
                
                case 'template':
                    resource = await Template.findByPk(resourceId);
                    if (resource && (resource.createdBy === userId || userRole === 'editor')) {
                        return next();
                    }
                    break;

                default:
                    return res.status(400).json({ error: 'Invalid resource type' });
            }

            return res.status(403).json({ error: 'Access denied to this resource' });
        } catch (error) {
            console.error('Resource Access Error:', error);
            return res.status(500).json({ error: 'Failed to check resource access' });
        }
    };
};

// Middleware logging cho audit trail
const auditLogger = (action) => {
    return (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function(data) {
            // Log audit trail
            console.log(`[AUDIT] ${new Date().toISOString()} - User: ${req.user?.id} - Action: ${action} - IP: ${req.ip} - Status: ${res.statusCode}`);
            
            // Có thể lưu vào database
            // AuditLog.create({
            //     userId: req.user?.id,
            //     action,
            //     resource: req.originalUrl,
            //     ip: req.ip,
            //     userAgent: req.get('User-Agent'),
            //     statusCode: res.statusCode
            // });

            originalSend.call(this, data);
        };

        next();
    };
};

module.exports = {
    authenticateToken,
    requireRole,
    rateLimiter,
    checkResourceAccess,
    auditLogger
};