const express = require("express");
const mongoose = require("mongoose");
const ErrorHandler = require("../../utils/errorHandler.js");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const Post = require("../../models/postModel.js");
const Space = require("../../models/spaceModel.js");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Función helper para normalizar usuario en posts
const normalizeUserForPost = (user) => {
  if (!user) return null;

  // Si es un objeto de Mongoose con _id
  if (user._id) {
    return {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      major: user.major,
      ig_user: user.ig_user,
    };
  }

  // Si ya tiene estructura normalizada
  return {
    id: user.id || user._id,
    _id: user._id || user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    major: user.major,
    ig_user: user.ig_user,
  };
};

// Función helper para normalizar espacio
const normalizeSpace = (space) => {
  if (!space) return null;

  return {
    id: space._id,
    _id: space._id,
    name: space.name,
    description: space.description,
    members: space.members,
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
    // IMPORTANTE: Asegúrate de que el token tenga 'id'
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
    };
    console.log("Authenticated user:", req.user); // DEBUG
    next();
  } catch (error) {
    return next(new ErrorHandler("Token inválido", 401));
  }
};

// ===================
// Obtener posts por usuario
// ===================
router.get(
  "/user/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(new ErrorHandler("ID de usuario inválido", 400));
      }

      const posts = await Post.find({ author_id: userId })
        .populate("author_id", "name email avatar major ig_user")
        .populate("space_id", "name description members")
        .sort({ date: -1 });

      // Normalizar los posts
      const normalizedPosts = posts.map((post) => ({
        id: post._id,
        _id: post._id,
        content: post.content,
        author_id: normalizeUserForPost(post.author_id),
        space_id: normalizeSpace(post.space_id),
        date: post.date,
        likes: post.likes,
        comments: post.comments,
      }));

      res.status(200).json({
        success: true,
        posts: normalizedPosts,
        count: normalizedPosts.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Listar publicaciones más recientes (global)
// ===================
router.get(
  "/recent",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const posts = await Post.find()
        .populate("author_id", "name email avatar major ig_user")
        .populate("space_id", "name description members")
        .sort({ date: -1 })
        .limit(10);

      // Normalizar los posts
      const normalizedPosts = posts.map((post) => ({
        id: post._id,
        _id: post._id,
        content: post.content,
        author_id: normalizeUserForPost(post.author_id),
        space_id: normalizeSpace(post.space_id),
        date: post.date,
        likes: post.likes,
        comments: post.comments,
      }));

      res.status(200).json({
        success: true,
        posts: normalizedPosts,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Obtener TODOS los posts
// ===================
router.get(
  "/all",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const posts = await Post.find()
        .populate("author_id", "name email avatar major ig_user")
        .populate("space_id", "name description members")
        .sort({ date: -1 });

      // Normalizar los posts
      const normalizedPosts = posts.map((post) => ({
        id: post._id,
        _id: post._id,
        content: post.content,
        author_id: normalizeUserForPost(post.author_id),
        space_id: normalizeSpace(post.space_id),
        date: post.date,
        likes: post.likes,
        comments: post.comments,
      }));

      res.status(200).json({
        success: true,
        posts: normalizedPosts,
        count: normalizedPosts.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Listar publicaciones por espacio
// ===================
router.get(
  "/space/:spaceId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const posts = await Post.find({ space_id: req.params.spaceId })
        .populate("author_id", "name email avatar major ig_user")
        .populate("space_id", "name description members")
        .sort({ date: -1 });

      // Normalizar los posts
      const normalizedPosts = posts.map((post) => ({
        id: post._id,
        _id: post._id,
        content: post.content,
        author_id: normalizeUserForPost(post.author_id),
        space_id: normalizeSpace(post.space_id),
        date: post.date,
        likes: post.likes,
        comments: post.comments,
      }));

      res.status(200).json({
        success: true,
        posts: normalizedPosts,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Crear publicación
// ===================

// ===================
// Crear publicación - VERSIÓN CORREGIDA
// ===================
router.post(
  "/create",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { content, space_id } = req.body;

      console.log("Creating post with:", {
        content: content?.substring(0, 50) + "...",
        space_id,
        userId: req.user.id,
      });

      const space = await Space.findById(space_id);
      if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));

      const userId = req.user.id.toString();
      console.log("User ID from token:", userId);
      console.log("Space members:", space.members);

      // IMPORTANTE: space.members podría contener ObjectIds o objetos de usuario
      // Necesitamos manejar ambos casos
      const isMember = space.members.some((member) => {
        const memberId =
          member?._id?.toString() ||
          member?.id?.toString() ||
          member?.toString();
        return memberId === userId;
      });

      console.log("Is member?", isMember);

      if (!isMember) {
        return next(new ErrorHandler("No eres miembro de este espacio", 403));
      }

      const newPost = await Post.create({
        content,
        author_id: req.user.id,
        space_id,
        date: new Date(),
      });

      // Obtener el post con los datos poblados
      const populatedPost = await Post.findById(newPost._id)
        .populate("author_id", "name email avatar major ig_user")
        .populate("space_id", "name description members");

      res.status(201).json({
        success: true,
        post: {
          id: populatedPost._id,
          _id: populatedPost._id,
          content: populatedPost.content,
          author_id: normalizeUserForPost(populatedPost.author_id),
          space_id: normalizeSpace(populatedPost.space_id),
          date: populatedPost.date,
          likes: populatedPost.likes,
          comments: populatedPost.comments,
        },
      });
    } catch (error) {
      console.error("Error in /posts/create:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// ===================
// Obtener publicación por id (DEBE IR AL FINAL)
// ===================
router.get(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id)
        .populate("author_id", "name email avatar major ig_user")
        .populate("space_id", "name description members");

      if (!post)
        return next(new ErrorHandler("Publicación no encontrada", 404));

      res.status(200).json({
        success: true,
        post: {
          id: post._id,
          _id: post._id,
          content: post.content,
          author_id: normalizeUserForPost(post.author_id),
          space_id: normalizeSpace(post.space_id),
          date: post.date,
          likes: post.likes,
          comments: post.comments,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Eliminar publicación (solo autor)
// ===================
router.delete(
  "/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post)
        return next(new ErrorHandler("Publicación no encontrada", 404));

      if (post.author_id.toString() !== req.user.id) {
        return next(
          new ErrorHandler(
            "No tienes permiso para eliminar esta publicación",
            403
          )
        );
      }

      await post.deleteOne();
      res.status(200).json({ success: true, message: "Publicación eliminada" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
