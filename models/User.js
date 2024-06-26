const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: {
    type: String,
    default: function () {
      return this.isAdmin
        ? "/public/images/profiles/admin.webp"
        : "/public/images/profiles/profile_1.png";
    },
  },
  isAdmin: { type: Boolean, default: false },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  likedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Ensure only admin users can have the admin profile image
  if (
    this.profileImage === "/public/images/profiles/admin.webp" &&
    !this.isAdmin
  ) {
    this.profileImage = "/public/images/profiles/profile_1.png";
  }

  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
