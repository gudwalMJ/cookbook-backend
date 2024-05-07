const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    ingredients: [{ name: String, quantity: String }],
    description: { type: String, required: true },
    preparationSteps: [{ type: String, required: true }],
    imageUrls: [{ type: String }],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    servings: { type: Number, required: true },
    starRating: { type: Number, min: 1, max: 5 },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    preparationTime: { type: Number, required: false },
    categories: [
      {
        type: String,
        enum: [
          "Breakfast",
          "Brunch",
          "Lunch",
          "Dinner",
          "Dessert",
          "Snack",
          "Vegetarian",
          "Vegan",
          "Gluten-Free",
          "Others",
        ],
      },
    ],
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
