// server/routes/progress.js
const express = require("express");
const mongoose = require("mongoose");
const Progress = require("../models/Progress");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId }).sort({ day: 1 });
    res.json({ progress });
  } catch (e) {
    console.error("Get progress error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/day/:day", authenticateToken, async (req, res) => {
  try {
    const day = Number(req.params.day);
    let progress = await Progress.findOne({ userId: req.userId, day });
    if (!progress) {
      progress = new Progress({
        userId: req.userId,
        day,
        topic: `Day ${day} Topic`,
        problemsCompleted: [],
      });
      await progress.save();
    }
    res.json({ progress });
  } catch (e) {
    console.error("Get day progress error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/day/:day", authenticateToken, async (req, res) => {
  try {
    const day = Number(req.params.day);
    const updates = req.body ?? {};
    let progress = await Progress.findOne({ userId: req.userId, day });
    if (!progress) {
      progress = new Progress({
        userId: req.userId,
        day,
        topic: updates.topic || `Day ${day} Topic`,
        problemsCompleted: [],
      });
    }
    Object.keys(updates).forEach((k) => {
      if (k !== "userId" && k !== "day") progress[k] = updates[k];
    });
    await progress.save();

    if (updates.completed) {
      const user = await User.findById(req.userId);
      if (user && day >= user.currentDay) {
        user.currentDay = Math.min(day + 1, 84);
        user.totalProblemsCompleted += (updates.problemsCompleted?.length || 0);
        if (typeof user.updateStreak === "function") user.updateStreak();
        await user.save();
      }
    }
    res.json({ progress });
  } catch (e) {
    console.error("Update progress error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/day/:day/problem", authenticateToken, async (req, res) => {
  try {
    const day = Number(req.params.day);
    const { problemName, problemUrl, timeSpent, difficulty } = req.body ?? {};
    const progress = await Progress.findOne({ userId: req.userId, day });
    if (!progress) return res.status(404).json({ error: "Progress not found for this day" });

    progress.problemsCompleted.push({
      problemName, problemUrl, timeSpent, difficulty, completedAt: new Date(),
    });
    await progress.save();
    res.json({ message: "Problem marked as completed", progress });
  } catch (e) {
    console.error("Mark problem complete error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const totalProgress = await Progress.countDocuments({ userId: req.userId, completed: true });
    const weeklyProgress = await Progress.countDocuments({
      userId: req.userId, completed: true,
      completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    const totalProblems = await Progress.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      { $unwind: "$problemsCompleted" },
      { $count: "total" },
    ]);
    res.json({
      currentDay: user?.currentDay ?? 1,
      streak: user?.streak ?? 0,
      totalDaysCompleted: totalProgress,
      weeklyProgress,
      totalProblemsCompleted: totalProblems[0]?.total || 0,
      joinDate: user?.joinDate ?? new Date(),
      preferredLanguage: user?.preferredLanguage ?? "C++",
    });
  } catch (e) {
    console.error("Get stats error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
