// models/Post.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    space_id: { type: mongoose.Schema.Types.ObjectId, ref: "Space", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
