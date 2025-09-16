const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    major: { type: String },
    ig_profile_url: { type: String },
    ig_user: { type: String },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
