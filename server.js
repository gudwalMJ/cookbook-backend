require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const recipesRoutes = require("./routes/recipesRoutes");
const commentsRoutes = require("./routes/commentsRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const dbURI = process.env.DB_URI;

mongoose
  .connect(dbURI)
  .then(() => console.log("Database connected!"))
  .catch((err) => console.error("Mongo connection error", err));

app.use(cors());
app.use(express.json()); // Middleware to parse JSON
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/comments", commentsRoutes);

app.get("/", (req, res) => {
  res.send("Hello World from CookBook API!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
