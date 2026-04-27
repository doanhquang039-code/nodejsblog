const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const PermissionMiddleware = require('../middleware/permissionMiddleware');
const AuthMiddleware = require('../middleware/authMiddleware');

// Protect all dashboard routes
router.use(AuthMiddleware.requireAuth);

// Get dashboard based on role
router.get('/', DashboardController.getDashboard);

// Role-specific dashboards
router.get('/admin', 
    PermissionMiddleware.checkRole('admin'),
    DashboardController.getAdminDashboard
);

router.get('/editor',
    PermissionMiddleware.checkRole(['admin', 'editor']),
    DashboardController.getEditorDashboard
);

router.get('/author',
    PermissionMiddleware.checkRole(['admin', 'editor', 'author']),
    DashboardController.getAuthorDashboard
);

router.get('/reader',
    DashboardController.getReaderDashboard
);

// Notifications
router.get('/notifications', DashboardController.getNotifications);
router.put('/notifications/:notificationId/read', DashboardController.markNotificationRead);
router.put('/notifications/read-all', DashboardController.markAllNotificationsRead);

module.exports = router;
