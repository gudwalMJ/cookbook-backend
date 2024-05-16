const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const secretKey = process.env.JWT_SECRET;

// POST new user
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

// POST login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "24h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error during login" });
  }
});

// POST logout user
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
