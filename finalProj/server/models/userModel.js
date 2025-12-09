const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    major: { type: String },
    ig_user: { type: String },
    avatar: {
      type: Object,
      default: {
        bodyColor: "#ffd7ba",
        hairStyle: "hair3",
        hairColor: "#2c1b18",
        eyeStyle: "eyes1",
        mouthStyle: "mouth1",
        backgroundColor: "#decd4aff"
      }
    },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    matches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);