// app.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const recipesRoutes = require("./routes/recipesRoutes");
const commentsRoutes = require("./routes/commentsRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const dbURI = process.env.DB_URI;

mongoose
  .connect(dbURI)
  .then(() => console.log("Database connected!"))
  .catch((err) => console.error("Mongo connection error", err));

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World from CookBook API!");
});

module.exports = app;