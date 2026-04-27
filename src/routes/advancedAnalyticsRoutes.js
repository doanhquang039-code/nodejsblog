const express = require('express');
const router = express.Router();
const AdvancedAnalyticsController = require('../controllers/advancedAnalyticsController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Advanced Analytics Routes
router.get('/dashboard/realtime', authenticateToken, AdvancedAnalyticsController.getRealtimeDashboard);
router.get('/user-behavior', authenticateToken, AdvancedAnalyticsController.getUserBehaviorAnalysis);
router.get('/report', authenticateToken, AdvancedAnalyticsController.generateDetailedReport);
router.get('/seo-analysis', authenticateToken, AdvancedAnalyticsController.getSEOAnalysis);
router.get('/trend-prediction', authenticateToken, AdvancedAnalyticsController.getTrendPrediction);

module.exports = router;