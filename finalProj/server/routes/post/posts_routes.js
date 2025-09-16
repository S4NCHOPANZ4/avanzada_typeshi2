const express = require("express");
const ErrorHandler = require("../../utils/errorHandler.js");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const Post = require("../../models/postModel.js");
const Space = require("../../models/spaceModel.js");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware de autenticación
const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next(new ErrorHandler("No autenticado", 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new ErrorHandler("Token inválido", 401));
  }
};

// ===================
// Crear publicación
// ===================
router.post(
  "/create",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { content, space_id } = req.body;

    const space = await Space.findById(space_id);
    if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));

    if (!space.members.includes(req.user.id)) {
      return next(new ErrorHandler("No eres miembro de este espacio", 403));
    }

    const newPost = await Post.create({
      content,
      author_id: req.user.id,
      space_id,
    });

    res.status(201).json({ success: true, post: newPost });
  })
);

// ===================
// Obtener publicación por id
// ===================
router.get(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    const post = await Post.findById(req.params.id)
      .populate("author_id", "name email")
      .populate("space_id", "name");

    if (!post) return next(new ErrorHandler("Publicación no encontrada", 404));

    res.status(200).json({ success: true, post });
  })
);

// ===================
// Listar publicaciones por espacio
// ===================
router.get(
  "/space/:spaceId",
  catchAsyncErrors(async (req, res, next) => {
    const posts = await Post.find({ space_id: req.params.spaceId })
      .populate("author_id", "name email")
      .sort({ date: -1 }); // más recientes primero

    res.status(200).json({ success: true, posts });
  })
);

// ===================
// Listar publicaciones más recientes (global)
// ===================
router.get(
  "/recent",
  catchAsyncErrors(async (req, res, next) => {
    const posts = await Post.find()
      .populate("author_id", "name email")
      .populate("space_id", "name")
      .sort({ date: -1 }) // orden descendente
      .limit(10); // devuelve las 10 más recientes

    res.status(200).json({ success: true, posts });
  })
);

// ===================
// Eliminar publicación (solo autor)
// ===================
router.delete(
  "/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new ErrorHandler("Publicación no encontrada", 404));

    if (post.author_id.toString() !== req.user.id) {
      return next(new ErrorHandler("No tienes permiso para eliminar esta publicación", 403));
    }

    await post.deleteOne();
    res.status(200).json({ success: true, message: "Publicación eliminada" });
  })
);

module.exports = router;
