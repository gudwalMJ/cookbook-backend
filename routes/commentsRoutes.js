const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const Comment = require("../models/Comment");
const Recipe = require("../models/Recipe");

// POST a comment
router.post("/", authenticateToken, async (req, res) => {
  const { text, recipeId } = req.body;

  try {
    // Check if the recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const comment = new Comment({
      text,
      author: req.user.userId,
      recipe: recipeId,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET comments for a specific recipe
router.get("/recipe/:recipeId", async (req, res) => {
  try {
    const comments = await Comment.find({
      recipe: req.params.recipeId,
    }).populate("author", "username");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a comment
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.author.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted succesfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
