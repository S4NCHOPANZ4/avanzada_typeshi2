const express = require("express");
const mongoose = require("mongoose");
const ErrorHandler = require("../../utils/errorHandler.js");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const Post = require("../../models/postModel.js");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Comment = require("../../models/niggaModel");
// Función helper para normalizar usuario en comentarios
const normalizeUserForComment = (user) => {
  if (!user) return null;

  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    major: user.major,
    ig_user: user.ig_user,
  };
};

// Función helper para normalizar comentario
const normalizeComment = (comment) => {
  if (!comment) return null;

  return {
    id: comment._id,
    _id: comment._id,
    content: comment.content,
    author_id: normalizeUserForComment(comment.author_id),
    post_id: comment.post_id,
    parent_comment_id: comment.parent_comment_id,
    likes: comment.likes || [],
    likesCount: comment.likes?.length || 0,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
};

// Middleware de autenticación
const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next(new ErrorHandler("No autenticado", 401));

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-for-dev"
    );
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
    };
    console.log("Authenticated user for comment:", req.user);
    next();
  } catch (error) {
    return next(new ErrorHandler("Token inválido", 401));
  }
};

// ===================
// Crear comentario - VERSIÓN SIMPLIFICADA
// ===================
router.post(
  "/create",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { content, post_id } = req.body;

      console.log("========== CREANDO COMENTARIO ==========");
      console.log("User ID:", req.user.id);
      console.log("Post ID:", post_id);
      console.log("Content:", content);

      // Validar datos básicos
      if (!content || !content.trim()) {
        return next(new ErrorHandler("El contenido del comentario es requerido", 400));
      }

      if (!post_id) {
        return next(new ErrorHandler("ID de publicación es requerido", 400));
      }

      // Verificar que el post existe
      const post = await Post.findById(post_id);
      if (!post) {
        console.log("Post no encontrado con ID:", post_id);
        return next(new ErrorHandler("Publicación no encontrada", 404));
      }

      console.log("Post encontrado:", post._id);

      // Crear el comentario
      const newComment = await Comment.create({
        content: content.trim(),
        author_id: req.user.id,
        post_id: post_id,
      });

      console.log("Comentario creado:", newComment._id);

      // Actualizar el post con el nuevo comentario
      await Post.findByIdAndUpdate(post_id, {
        $push: { comments: newComment._id }
      });

      console.log("Post actualizado con nuevo comentario");

      // Obtener el comentario con datos poblados
      const populatedComment = await Comment.findById(newComment._id)
        .populate("author_id", "name email avatar major ig_user");

      console.log("Comentario poblado obtenido");

      res.status(201).json({
        success: true,
        comment: normalizeComment(populatedComment),
      });
    } catch (error) {
      console.error("❌ Error in /comments/create:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Obtener comentarios de un post
// ===================
router.get(
  "/post/:postId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { limit = 10 } = req.query;

      console.log("Obteniendo comentarios para post:", postId);

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return next(new ErrorHandler("ID de publicación inválido", 400));
      }

      // Verificar que el post existe
      const post = await Post.findById(postId);
      if (!post) return next(new ErrorHandler("Publicación no encontrada", 404));

      const comments = await Comment.find({ 
        post_id: postId,
        parent_comment_id: null // Solo comentarios principales
      })
        .populate("author_id", "name email avatar major ig_user")
        .sort({ createdAt: -1 })
        .limit(Number(limit));

      const totalComments = await Comment.countDocuments({ 
        post_id: postId,
        parent_comment_id: null 
      });

      const normalizedComments = comments.map(comment => normalizeComment(comment));

      console.log(`Comentarios obtenidos: ${normalizedComments.length}`);

      res.status(200).json({
        success: true,
        comments: normalizedComments,
        total: totalComments,
      });
    } catch (error) {
      console.error("Error obteniendo comentarios:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Eliminar comentario
// ===================
router.delete(
  "/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) return next(new ErrorHandler("Comentario no encontrado", 404));

      // Verificar permisos
      const isCommentAuthor = comment.author_id.toString() === req.user.id;
      const post = await Post.findById(comment.post_id);
      const isPostAuthor = post && post.author_id.toString() === req.user.id;

      if (!isCommentAuthor && !isPostAuthor) {
        return next(new ErrorHandler("No tienes permiso para eliminar este comentario", 403));
      }

      // Eliminar referencia del comentario en el post
      if (post) {
        await Post.findByIdAndUpdate(comment.post_id, {
          $pull: { comments: comment._id }
        });
      }

      await comment.deleteOne();

      res.status(200).json({ 
        success: true, 
        message: "Comentario eliminado" 
      });
    } catch (error) {
      console.error("Error eliminando comentario:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;