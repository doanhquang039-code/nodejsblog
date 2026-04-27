const express = require('express');
const router = express.Router();
const EnhancedChatbotController = require('../controllers/enhancedChatbotController');
const { authenticateToken, rateLimiter } = require('../middlewares/auth');

// Chat session management
router.post('/init', 
    rateLimiter(10, 60000), // 10 sessions per minute
    EnhancedChatbotController.initChatSession
);

router.post('/message',
    rateLimiter(30, 60000), // 30 messages per minute
    EnhancedChatbotController.sendMessage
);

router.get('/history/:sessionId', EnhancedChatbotController.getChatHistory);

router.get('/sessions',
    authenticateToken,
    EnhancedChatbotController.getUserSessions
);

router.post('/sessions/:sessionId/close',
    authenticateToken,
    EnhancedChatbotController.closeSession
);

// Message feedback
router.post('/messages/:messageId/rate',
    EnhancedChatbotController.rateMessage
);

module.exports = router;