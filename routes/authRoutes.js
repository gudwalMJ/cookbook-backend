const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const secretKey = process.env.JWT_SECRET;

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Create new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Create token
    const token = jwt.sign({ userId: newUser._id }, secretKey, {
      expiresIn: "24h",
    });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error registering new user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("Email:", email);
    console.log("Received password:", password);
    const user = await User.findOne({ email });
    console.log("Database user found:", user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Compare password
    console.log("Stored hash:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison:", password, user.password);
    console.log("Password match:", isMatch);

    console.log("Password match:", isMatch);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "24h" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error during login" });
  }
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
