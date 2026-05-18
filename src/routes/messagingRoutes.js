const express = require("express");
const router = express.Router();
const messagingController = require("../controllers/messagingController");
const { authenticateToken } = require("../middlewares/auth");

router.use(authenticateToken);

router.get("/", messagingController.getConversations);
router.post("/", messagingController.createConversation);
router.get("/unread/count", messagingController.getUnreadCount);
router.get("/:id", messagingController.getConversation);
router.get("/:id/messages", messagingController.getMessages);
router.post("/:id/messages", messagingController.sendMessage);
router.put("/:id/read", messagingController.markAsRead);
router.put("/messages/:messageId", messagingController.editMessage);
router.delete("/messages/:messageId", messagingController.deleteMessage);
router.post("/messages/:messageId/reactions", messagingController.addReaction);
router.delete("/messages/:messageId/reactions", messagingController.removeReaction);

module.exports = router;
