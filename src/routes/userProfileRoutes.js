const express = require('express');
const router = express.Router();
const UserProfileController = require('../controllers/userProfileController');
const { authenticateToken, rateLimiter } = require('../middlewares/auth');

// Profile management
router.get('/:username', UserProfileController.getProfile);

router.put('/update',
    authenticateToken,
    rateLimiter(10, 60000), // 10 updates per minute
    UserProfileController.updateProfile
);

router.post('/change-password',
    authenticateToken,
    rateLimiter(5, 3600000), // 5 attempts per hour
    UserProfileController.changePassword
);

// Follow system
router.post('/:userId/follow',
    authenticateToken,
    UserProfileController.toggleFollow
);

router.get('/:userId/followers', UserProfileController.getFollowers);
router.get('/:userId/following', UserProfileController.getFollowing);

// User content
router.get('/:username/posts', UserProfileController.getUserPosts);
router.get('/:username/activity', UserProfileController.getUserActivity);
router.get('/:username/stats', UserProfileController.getUserStats);

module.exports = router;