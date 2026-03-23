const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/add", authMiddleware, commentController.addComment);
router.post("/delete/:id", authMiddleware, commentController.deleteComment);
router.post("/update/:id", authMiddleware, commentController.updateComment); // ← thêm dòng này
module.exports = router;
