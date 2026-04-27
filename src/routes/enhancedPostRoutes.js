const express = require('express');
const router = express.Router();
const EnhancedPostController = require('../controllers/enhancedPostController');
const { authenticateToken, requireRole, rateLimiter } = require('../middlewares/auth');

// Post CRUD với tính năng nâng cao
router.post('/create', 
    authenticateToken, 
    requireRole(['admin', 'editor', 'author']),
    rateLimiter(10, 60000), // 10 posts per minute
    EnhancedPostController.createAdvancedPost
);

router.get('/:slug', EnhancedPostController.getPostDetails);

// Post interactions
router.post('/:postId/like', authenticateToken, EnhancedPostController.toggleLike);
router.post('/:postId/bookmark', authenticateToken, EnhancedPostController.toggleBookmark);
router.post('/:postId/share', EnhancedPostController.sharePost);

// User-specific routes
router.get('/user/bookmarks', authenticateToken, EnhancedPostController.getUserBookmarks);
router.get('/user/reading-list', authenticateToken, EnhancedPostController.getReadingList);

// Discovery routes
router.get('/trending/posts', EnhancedPostController.getTrendingPosts);
router.get('/search/advanced', EnhancedPostController.advancedSearch);

module.exports = router;