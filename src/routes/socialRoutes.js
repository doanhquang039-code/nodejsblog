const express = require('express');
const router = express.Router();
const SocialController = require('../controllers/socialController');
const { authenticateToken } = require('../middlewares/auth');

// Social Media Integration Routes
router.post('/share', authenticateToken, SocialController.sharePost);
router.get('/stats/:postId', SocialController.getSocialStats);
router.get('/preview/:postId', SocialController.generateSocialPreview);
router.post('/schedule', authenticateToken, SocialController.schedulePost);
router.get('/trending-hashtags', SocialController.getTrendingHashtags);

module.exports = router;