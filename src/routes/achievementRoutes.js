const express = require("express");
const router = express.Router();
const achievementController = require("../controllers/achievementController");
const { authenticateToken } = require("../middlewares/auth");

router.get("/", achievementController.getAllAchievements);
router.get("/leaderboard", achievementController.getLeaderboard);

router.use(authenticateToken);

router.get("/me", achievementController.getUserAchievements);
router.get("/me/stats", achievementController.getUserStats);
router.post("/me/check", achievementController.checkAchievements);

module.exports = router;
