const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const authenticateToken = require("../middleware/authenticateToken");

module.exports = router;

router.post("/", authenticateToken, async (req, res) => {
  const {
    title,
    ingredients,
    description,
    preparationSteps,
    imageUrls,
    servings,
    starRating,
    difficulty,
    categories,
  } = req.body;

  try {
    const newRecipe = new Recipe({
      title,
      ingredients,
      description,
      preparationSteps,
      imageUrls,
      creator: req.user.userId, //Assume req.user is populated from the token
      servings,
      starRating,
      difficulty,
      categories,
    });
    await newRecipe.save(), res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  const { category, creator } = req.query;
  let query = {};

  if (category) query.categories = category;
  if (creator) query.creator = creator;

  try {
    const recipes = await Recipe.find(query).populate("creator", "username");
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "creator",
      "username"
    );
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  const {
    title,
    ingredients,
    description,
    preparationSteps,
    imageUrls,
    servings,
    starRating,
    difficulty,
    categories,
  } = req.body;

  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    if (recipe.creator.toString() !== req.user.userId)
      return res
        .status(403)
        .json({ error: "Not authorized to update this recipe" });

    // Update fields
    recipe.title = title;
    recipe.ingredients = ingredients;
    recipe.description = description;
    recipe.preparationSteps = preparationSteps;
    recipe.imageUrls = imageUrls;
    recipe.servings = servings;
    recipe.starRating = starRating;
    recipe.difficulty = difficulty;
    recipe.categories = categories;

    await recipe.save();
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    if (recipe.creator.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this recipe" });
    }
    await Recipe.findByIdAndDelete(req.params.id); // Updated method to delete recipe
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
