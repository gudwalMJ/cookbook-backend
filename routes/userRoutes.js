const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const User = require("../models/User");
const Recipe = require("../models/Recipe");

// GET the current user's profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("favorites")
      .populate({
        path: "likedRecipes",
        select: "_id title",
      });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Fetched user with liked recipes:", user.likedRecipes);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT update the current user's profile
router.put("/me", authenticateToken, async (req, res) => {
  const { username, password, profileImage, bio } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if they are provided
    if (username) user.username = username;
    if (profileImage) user.profileImage = profileImage;
    if (bio) user.bio = bio;
    if (password) {
      user.password = password; // Assign directly to trigger pre-save middleware
    }

    await user.save();
    res.status(200).json({
      message: "Profile updated successfully",
      data: {
        username: user.username,
        profileImage: user.profileImage,
        bio: user.bio,
      },
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
