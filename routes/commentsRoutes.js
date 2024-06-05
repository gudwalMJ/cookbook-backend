const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const Comment = require("../models/Comment");
const Recipe = require("../models/Recipe");

// POST a comment
router.post("/", authenticateToken, async (req, res) => {
  const { text, recipeId } = req.body;

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const comment = new Comment({
      text,
      author: req.user.userId,
      recipe: recipeId,
      likes: [],
      replies: [],
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
    const comments = await Comment.find({ recipe: req.params.recipeId })
      .populate("author", "username")
      .populate({
        path: "replies",
        populate: { path: "author", select: "username" },
      });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a comment
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (comment.author.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "User is not authorized to edit this comment" });
    }
    comment.text = req.body.text || comment.text;
    await comment.save();
    res.json(comment);
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
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a reply to a comment
router.post("/:id/reply", authenticateToken, async (req, res) => {
  const { text } = req.body;

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const reply = new Comment({
      text,
      author: req.user.userId,
      recipe: comment.recipe,
      likes: [],
      replies: [],
    });

    await reply.save();
    comment.replies.push(reply._id);
    await comment.save();

    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT like/unlike a comment
router.put("/:id/like", authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const userId = req.user.userId;
    const index = comment.likes.indexOf(userId);

    if (index === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(index, 1);
    }

    await comment.save();
    res.json({ likes: comment.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
