// models/Post.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "El contenido es requerido"],
    maxlength: [300, "El contenido no puede exceder 300 caracteres"]
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  space_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Space",
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("Post", PostSchema);
