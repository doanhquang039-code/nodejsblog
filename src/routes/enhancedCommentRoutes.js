const express = require('express');
const router = express.Router();
const EnhancedCommentController = require('../controllers/enhancedCommentController');
const { authenticateToken, requireRole, rateLimiter } = require('../middlewares/auth');

// Comment CRUD
router.post('/create',
    authenticateToken,
    rateLimiter(20, 60000), // 20 comments per minute
    EnhancedCommentController.createAdvancedComment
);

router.get('/post/:postId', EnhancedCommentController.getThreadedComments);

router.put('/:commentId/edit', 
    authenticateToken,
    EnhancedCommentController.editComment
);

router.delete('/:commentId', 
    authenticateToken,
    EnhancedCommentController.deleteComment
);

// Comment interactions
router.post('/:commentId/like', 
    authenticateToken,
    EnhancedCommentController.toggleCommentLike
);

router.post('/:commentId/react',
    authenticateToken,
    EnhancedCommentController.reactToComment
);

router.post('/:commentId/report',
    authenticateToken,
    rateLimiter(5, 3600000), // 5 reports per hour
    EnhancedCommentController.reportComment
);

// Admin/Moderator actions
router.post('/:commentId/pin',
    authenticateToken,
    requireRole(['admin', 'moderator', 'author']),
    EnhancedCommentController.pinComment
);

router.post('/:commentId/moderate',
    authenticateToken,
    requireRole(['admin', 'moderator']),
    EnhancedCommentController.moderateComment
);

// Statistics
router.get('/post/:postId/stats', EnhancedCommentController.getCommentStats);

module.exports = router;