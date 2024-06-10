require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const recipesRoutes = require("./routes/recipesRoutes");
const commentsRoutes = require("./routes/commentsRoutes");
const userRoutes = require("./routes/userRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes"); // Import the favorites routes

const app = express();
const dbURI = process.env.DB_URI;

mongoose
  .connect(dbURI)
  .then(() => console.log("Database connected!"))
  .catch((err) => console.error("Mongo connection error", err));

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipesRoutes); // Public access to recipe routes
app.use("/api/comments", commentsRoutes);
app.use("/api/users", userRoutes);
app.use("/api", favoritesRoutes); // Add the favorites routes

app.get("/", (req, res) => {
  res.send("Hello World from CookBook API!");
});

module.exports = app;
