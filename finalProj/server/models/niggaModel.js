const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "El contenido del comentario es requerido"],
    maxlength: [500, "El comentario no puede exceder 500 caracteres"]
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true
  },
  parent_comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true
});

CommentSchema.index({ post_id: 1, createdAt: -1 });
CommentSchema.index({ author_id: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", CommentSchema);