const express = require('express');
const router = express.Router();
const CMSController = require('../controllers/cmsController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// CMS Advanced Routes
router.post('/bulk-operations', authenticateToken, requireRole(['admin', 'editor']), CMSController.bulkOperations);

// Template Management
router.post('/templates', authenticateToken, requireRole(['admin', 'editor']), CMSController.createTemplate);
router.get('/templates', authenticateToken, CMSController.getTemplates);
router.post('/templates/create-post', authenticateToken, CMSController.createFromTemplate);

// Media Library
router.get('/media', authenticateToken, CMSController.getMediaLibrary);

// Content Versioning
router.post('/posts/:postId/versions', authenticateToken, CMSController.createVersion);

// Workflow
router.post('/posts/:postId/submit-review', authenticateToken, CMSController.submitForReview);

// Content Analytics
router.get('/content-analytics', authenticateToken, CMSController.getContentAnalytics);
router.get('/posts/:postId/optimization-suggestions', authenticateToken, CMSController.getOptimizationSuggestions);

module.exports = router;