const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// AI Content Generation Routes
router.post('/generate-content', authenticateToken, AIController.generateContent);
router.post('/generate-seo-title', authenticateToken, AIController.generateSEOTitle);
router.post('/generate-tags', authenticateToken, AIController.generateTags);
router.post('/optimize-seo', authenticateToken, AIController.optimizeForSEO);

module.exports = router;