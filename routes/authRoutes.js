const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/authenticateToken");
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

// GET the current user's profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update the current user's profile
router.put("/me", authenticateToken, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if they are provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.status(200).json({
      message: "Profile updated successfully",
      data: { username: user.username, email: user.email },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Username or email already exists" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST logout user
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
