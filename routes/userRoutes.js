const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const User = require("../models/User");

// GET the current user's profile
router.get("/me", authenticateToken, async (req, res) => {
  console.log("Fetching current user profile"); // Debugging log
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      console.log("User not found"); // Debugging log
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error.message); // Debugging log
    res.status(500).json({ error: error.message });
  }
});

// PUT update the current user's profile
router.put("/me", authenticateToken, async (req, res) => {
  const { username, password, profileImage } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if they are provided
    if (username) user.username = username;
    if (profileImage) user.profileImage = profileImage;
    if (password) {
      user.password = password; // Assign directly to trigger pre-save middleware
    }

    await user.save();
    res.status(200).json({
      message: "Profile updated successfully",
      data: { username: user.username, profileImage: user.profileImage },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Username already exists" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
