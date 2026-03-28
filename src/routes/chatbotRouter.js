// src/routes/chatbotRoutes.js
const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/ask", authMiddleware, chatbotController.askAI);
router.get("/history", authMiddleware, chatbotController.getHistory);

module.exports = router;
