const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const authenticateToken = require("../middleware/authenticateToken");
const isAdmin = require("../middleware/isAdmin");

// POST a recipe (both admin and regular users can add recipes)
router.post("/", authenticateToken, async (req, res) => {
  const {
    title,
    ingredients,
    description,
    preparationSteps,
    preparationTime,
    imageUrls,
    servings,
    difficulty,
    categories,
  } = req.body;

  try {
    const newRecipe = new Recipe({
      title,
      ingredients,
      description,
      preparationSteps,
      preparationTime,
      imageUrls,
      creator: req.user.userId,
      servings,
      difficulty,
      categories,
    });
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET all recipes
router.get("/", async (req, res) => {
  const { category, creator, sortBy, limit } = req.query;
  let query = {};
  let sortCriteria = {};
  let limitNumber = parseInt(limit) || 0; // Default to no limit

  if (category) query.categories = category;
  if (creator) query.creator = creator;

  if (sortBy) {
    switch (sortBy) {
      case "newest":
        sortCriteria = { createdAt: -1 };
        break;
      case "oldest":
        sortCriteria = { createdAt: 1 };
        break;
      case "mostPopular":
        sortCriteria = { likes: -1 };
        break;
      case "highestRated":
        sortCriteria = { averageRating: -1 };
        break;
      default:
        sortCriteria = {};
    }
  }

  try {
    const recipes = await Recipe.find(query)
      .populate("creator", "username")
      .sort(sortCriteria)
      .limit(limitNumber); // Apply limit to query
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET popular recipes based on likes
router.get("/popular", async (req, res) => {
  try {
    const popularRecipes = await Recipe.find().sort({ likes: -1 }).limit(10);
    res.json(popularRecipes);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// GET (SEARCH) a recipe
router.get("/search", async (req, res) => {
  try {
    const { query, difficulty, category, sortBy } = req.query;
    let searchCriteria = {};
    let sortCriteria = {};

    if (query) {
      searchCriteria = {
        $or: [
          { title: { $regex: new RegExp(query, "i") } },
          { "ingredients.name": { $regex: new RegExp(query, "i") } },
        ],
      };
    }
    if (difficulty) {
      searchCriteria.difficulty = difficulty;
    }
    if (category) {
      searchCriteria.categories = category;
    }

    if (sortBy) {
      switch (sortBy) {
        case "newest":
          sortCriteria = { createdAt: -1 };
          break;
        case "oldest":
          sortCriteria = { createdAt: 1 };
          break;
        case "mostPopular":
          sortCriteria = { likes: -1 };
          break;
        case "highestRated":
          sortCriteria = { averageRating: -1 };
          break;
        default:
          sortCriteria = {};
      }
    }

    const recipes = await Recipe.find(searchCriteria).sort(sortCriteria);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Error searching recipes" });
  }
});

// GET a recipe by id
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

// PUT a recipe (only by the creator or admin)
router.put("/:id", authenticateToken, async (req, res) => {
  const {
    title,
    ingredients,
    description,
    preparationSteps,
    preparationTime,
    imageUrls,
    servings,
    difficulty,
    categories,
  } = req.body;

  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    // Allow update by admin or the creator of the recipe
    if (recipe.creator.toString() !== req.user.userId && !req.user.isAdmin) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this recipe" });
    }

    // Update fields
    recipe.title = title;
    recipe.ingredients = ingredients;
    recipe.description = description;
    recipe.preparationSteps = preparationSteps;
    recipe.preparationTime = preparationTime;
    recipe.imageUrls = imageUrls;
    recipe.servings = servings;
    recipe.difficulty = difficulty;
    recipe.categories = categories;

    await recipe.save();
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST rating for a recipe
router.post("/:id/rate", authenticateToken, async (req, res) => {
  const { rating } = req.body;
  const userId = req.user.userId;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Check if user already rated this recipe
    const existingRating = recipe.ratings.find(
      (r) => r.user.toString() === userId
    );
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
    } else {
      // Add new rating
      recipe.ratings.push({ user: userId, rating });
    }

    await recipe.save();
    res.json({ averageRating: recipe.averageRating.toFixed(2) });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT like a recipe
router.put("/:id/like", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    if (recipe.likedBy.includes(userId)) {
      return res
        .status(400)
        .json({ error: "You have already liked this recipe" });
    }

    recipe.likes += 1;
    recipe.likedBy.push(userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.likedRecipes.push(recipe._id);

    await recipe.save();
    await user.save();

    res.json({ likes: recipe.likes, likedBy: recipe.likedBy });
  } catch (error) {
    console.error("Error liking recipe:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT unlike a recipe
router.put("/:id/unlike", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    if (!recipe.likedBy.includes(userId)) {
      return res
        .status(400)
        .json({ error: "You have not liked this recipe yet" });
    }

    recipe.likes -= 1;
    recipe.likedBy = recipe.likedBy.filter(
      (likedUserId) => likedUserId.toString() !== userId
    );

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.likedRecipes = user.likedRecipes.filter(
      (likedRecipeId) => likedRecipeId.toString() !== recipe._id.toString()
    );

    await recipe.save();
    await user.save();

    res.json({ likes: recipe.likes, likedBy: recipe.likedBy });
  } catch (error) {
    console.error("Error unliking recipe:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE a recipe (only by the creator or admin)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Allow deletion by admin or the creator of the recipe
    if (recipe.creator.toString() !== req.user.userId && !req.user.isAdmin) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this recipe" });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
