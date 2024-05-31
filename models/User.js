const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: {
    type: String,
    default:
      "https://www.shareicon.net/data/128x128/2016/09/01/822751_user_512x512.png",
  },
  isAdmin: { type: Boolean, default: false }, // Admin field
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Hashed password during save:", this.password); // Log during save
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
