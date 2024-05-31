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
    const token = jwt.sign(
      { userId: newUser._id, isAdmin: newUser.isAdmin },
      secretKey,
      {
        expiresIn: "24h",
      }
    );

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error registering new user" });
  }
});

// POST login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("Login attempt with email:", email); // Debugging log

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email); // Debugging log
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Stored hashed password:", user.password); // Log the stored password
    console.log("Provided password:", password); // Log the provided password

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison result (login):", isMatch); // Debugging log
    if (!isMatch) {
      console.log("Invalid credentials for email:", email); // Debugging log
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log("User authenticated successfully for email:", email); // Debugging log
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      secretKey,
      {
        expiresIn: "24h",
      }
    );
    res.json({ token });
  } catch (error) {
    console.error("Server error during login:", error); // Debugging log
    res.status(500).json({ error: "Server error during login" });
  }
});

// POST logout user
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
