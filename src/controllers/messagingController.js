const MessagingService = require("../services/messagingService");

exports.createConversation = async (req, res) => {
  try {
    const conversation = await MessagingService.createConversation(req.user.id, req.body);
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const data = await MessagingService.getUserConversations(req.user.id, {
      page: parseInt(req.query.page || "1", 10),
      limit: parseInt(req.query.limit || "20", 10),
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const conversation = await MessagingService.getConversation(req.params.id, req.user.id);
    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(error.message === "Access denied" ? 403 : 404).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const data = await MessagingService.getMessages(req.params.id, req.user.id, {
      page: parseInt(req.query.page || "1", 10),
      limit: parseInt(req.query.limit || "50", 10),
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.message === "Access denied" ? 403 : 500).json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const message = await MessagingService.sendMessage(req.user.id, req.params.id, req.body);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(error.message === "Access denied" ? 403 : 400).json({ success: false, message: error.message });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const message = await MessagingService.editMessage(req.params.messageId, req.user.id, req.body.content);
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(error.message === "Access denied" ? 403 : 400).json({ success: false, message: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const data = await MessagingService.deleteMessage(req.params.messageId, req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.message === "Access denied" ? 403 : 400).json({ success: false, message: error.message });
  }
};

exports.addReaction = async (req, res) => {
  try {
    const reaction = await MessagingService.addReaction(req.params.messageId, req.user.id, req.body.emoji);
    res.status(201).json({ success: true, data: reaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.removeReaction = async (req, res) => {
  try {
    const data = await MessagingService.removeReaction(req.params.messageId, req.user.id, req.body.emoji);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const data = await MessagingService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await MessagingService.getUnreadCount(req.user.id);
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
