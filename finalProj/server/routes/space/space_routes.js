const express = require("express");
const ErrorHandler = require("../../utils/errorHandler.js");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const Space = require("../../models/spaceModel.js");
const Post = require("../../models/postModel.js");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware de autenticación
const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next(new ErrorHandler("No autenticado", 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: ... }
    next();
  } catch (error) {
    return next(new ErrorHandler("Token inválido", 401));
  }
};

// ===================
// Crear espacio
// ===================
router.post(
  "/create",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { name, description } = req.body;

    const newSpace = await Space.create({
      name,
      description,
      creator_id: req.user.id,
      members: [req.user.id], // el creador es miembro
    });

    res.status(201).json({ success: true, space: newSpace });
  })
);

// ===================
// Obtener espacio por ID
// ===================
router.get(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    const space = await Space.findById(req.params.id)
      .populate("creator_id", "name email")
      .populate("members", "name email");

    if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));

    res.status(200).json({ success: true, space });
  })
);

// ===================
// Listar todos los espacios
// ===================
router.get(
  "/",
  catchAsyncErrors(async (req, res, next) => {
    const spaces = await Space.find()
      .populate("creator_id", "name email")
      .populate("members", "name email");

    res.status(200).json({ success: true, spaces });
  })
);

// ===================
// Actualizar espacio (solo creador)
// ===================
router.put(
  "/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { name, description } = req.body;
    const space = await Space.findById(req.params.id);

    if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));
    if (space.creator_id.toString() !== req.user.id) {
      return next(new ErrorHandler("No tienes permiso para actualizar este espacio", 403));
    }

    space.name = name || space.name;
    space.description = description || space.description;
    await space.save();

    res.status(200).json({ success: true, space });
  })
);

// ===================
// Eliminar espacio (solo creador)
// ===================
router.delete(
  "/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const space = await Space.findById(req.params.id);
    if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));

    if (space.creator_id.toString() !== req.user.id) {
      return next(new ErrorHandler("No tienes permiso para eliminar este espacio", 403));
    }

    await space.deleteOne();
    res.status(200).json({ success: true, message: "Espacio eliminado" });
  })
);

// ===================
// Unirse a un espacio
// ===================
router.post(
  "/:id/join",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const space = await Space.findById(req.params.id);
    if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));

    if (space.members.includes(req.user.id)) {
      return next(new ErrorHandler("Ya eres miembro de este espacio", 400));
    }

    space.members.push(req.user.id);
    await space.save();

    res.status(200).json({ success: true, message: "Te uniste al espacio", space });
  })
);

// ===================
// Salir de un espacio
// ===================
router.post(
  "/:id/leave",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const space = await Space.findById(req.params.id);
    if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));

    space.members = space.members.filter(
      (memberId) => memberId.toString() !== req.user.id
    );
    await space.save();

    res.status(200).json({ success: true, message: "Saliste del espacio", space });
  })
);

// ===================
// Obtener miembros de un espacio
// ===================
router.get(
  "/:id/members",
  catchAsyncErrors(async (req, res, next) => {
    const space = await Space.findById(req.params.id).populate("members", "name email");
    if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));

    res.status(200).json({ success: true, members: space.members });
  })
);

// ===================
// Publicaciones recientes en un espacio
// ===================
router.get(
  "/:id/recent-posts",
  catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const posts = await Post.find({ space_id: id })
      .populate("author_id", "name email")
      .sort({ date: -1 })
      .limit(Number(limit));

    res.status(200).json({ success: true, posts });
  })
);

module.exports = router;
