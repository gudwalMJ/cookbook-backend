// middleware/isAdmin.js
const User = require("../models/User");

const isAdmin = async (req, res, next) => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);
    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).json({ error: "Access denied" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = isAdmin;
