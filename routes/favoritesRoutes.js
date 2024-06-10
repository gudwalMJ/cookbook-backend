const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const User = require("../models/User");
const Recipe = require("../models/Recipe");

// Add a recipe to favorites
router.post("/favorites/:recipeId", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const recipe = await Recipe.findById(req.params.recipeId);

    if (!user || !recipe) {
      return res.status(404).json({ error: "User or Recipe not found" });
    }

    if (!user.favorites.includes(recipe._id)) {
      user.favorites.push(recipe._id);
      await user.save();
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a recipe from favorites
router.delete("/favorites/:recipeId", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.favorites = user.favorites.filter(
      (favorite) => favorite.toString() !== req.params.recipeId
    );
    await user.save();

    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a user's favorite recipes
router.get("/favorites", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("favorites");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
