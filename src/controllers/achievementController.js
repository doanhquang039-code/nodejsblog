const AchievementService = require("../services/achievementService");

exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await AchievementService.getAllAchievements();
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserAchievements = async (req, res) => {
  try {
    const achievements = await AchievementService.getUserAchievements(req.user.id);
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkAchievements = async (req, res) => {
  try {
    const achievements = await AchievementService.checkAchievements(req.user.id);
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await AchievementService.getLeaderboard({
      limit: parseInt(req.query.limit || "50", 10),
      period: req.query.period || "all",
    });
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const stats = await AchievementService.getUserStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
