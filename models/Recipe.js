const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
});

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
    ratings: [ratingSchema], // Array of ratings
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
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtual fields are included when converting to JSON
    toObject: { virtuals: true }, // Ensure virtual fields are included when converting to Object
  }
);

recipeSchema.virtual("averageRating").get(function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return sum / this.ratings.length;
});

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
