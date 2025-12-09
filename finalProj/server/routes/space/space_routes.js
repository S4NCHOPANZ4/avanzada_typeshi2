const express = require("express");
const ErrorHandler = require("../../utils/errorHandler.js");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const Space = require("../../models/spaceModel.js");
const Post = require("../../models/postModel.js");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Función helper para normalizar usuario
const normalizeUser = (user) => {
  if (!user) return null;
  
  // Si es un objeto de Mongoose con _id
  if (user._id && user.toObject) {
    return {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      major: user.major,
      ig_user: user.ig_user
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
    ig_user: user.ig_user
  };
};

// Función helper para normalizar espacio
const normalizeSpace = (space) => {
  if (!space) return null;
  
  const normalizedSpace = {
    id: space._id,
    _id: space._id,
    name: space.name,
    description: space.description,
    createdAt: space.createdAt,
    updatedAt: space.updatedAt
  };
  
  // Si tiene creator_id poblado, normalizarlo
  if (space.creator_id) {
    normalizedSpace.creator_id = normalizeUser(space.creator_id);
  } else if (space.creator_id && typeof space.creator_id === 'string') {
    normalizedSpace.creator_id = space.creator_id;
  }
  
  // Si tiene members poblados, normalizarlos
  if (space.members && Array.isArray(space.members)) {
    normalizedSpace.members = space.members.map(member => {
      if (typeof member === 'object') {
        return normalizeUser(member);
      }
      return member; // Si es solo un ID string
    });
  }
  
  return normalizedSpace;
};

// Función helper para normalizar post
const normalizePost = (post) => {
  if (!post) return null;
  
  const normalizedPost = {
    id: post._id,
    _id: post._id,
    content: post.content,
    date: post.date,
    likes: post.likes || [],
    comments: post.comments || []
  };
  
  // Normalizar author_id si está poblado
  if (post.author_id) {
    normalizedPost.author_id = normalizeUser(post.author_id);
  } else if (post.author_id && typeof post.author_id === 'string') {
    normalizedPost.author_id = post.author_id;
  }
  
  // Normalizar space_id si está poblado
  if (post.space_id) {
    if (typeof post.space_id === 'object') {
      normalizedPost.space_id = {
        id: post.space_id._id,
        _id: post.space_id._id,
        name: post.space_id.name,
        description: post.space_id.description
      };
    } else {
      normalizedPost.space_id = post.space_id;
    }
  }
  
  return normalizedPost;
};

// Middleware de autenticación
const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next(new ErrorHandler("No autenticado", 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-dev');
    req.user = { id: decoded.id, _id: decoded.id }; // Normalizar también aquí
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
    try {
      const { name, description } = req.body;

      const newSpace = await Space.create({
        name,
        description,
        creator_id: req.user.id,
        members: [req.user.id],
      });

      // Obtener el espacio con datos poblados
      const populatedSpace = await Space.findById(newSpace._id)
        .populate("creator_id", "name email avatar major ig_user")
        .populate("members", "name email avatar major ig_user");

      res.status(201).json({ 
        success: true, 
        space: normalizeSpace(populatedSpace) 
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Obtener espacio por ID
// ===================
router.get(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const space = await Space.findById(req.params.id)
        .populate("creator_id", "name email avatar major ig_user")
        .populate("members", "name email avatar major ig_user");

      if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));

      res.status(200).json({ 
        success: true, 
        space: normalizeSpace(space) 
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Listar todos los espacios
// ===================
router.get(
  "/",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const spaces = await Space.find()
        .populate("creator_id", "name email avatar major ig_user")
        .populate("members", "name email avatar major ig_user");

      const normalizedSpaces = spaces.map(space => normalizeSpace(space));
      
      res.status(200).json({ 
        success: true, 
        spaces: normalizedSpaces 
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Actualizar espacio (solo creador)
// ===================
router.put(
  "/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const space = await Space.findById(req.params.id);

      if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));
      
      // Comparar usando ambas propiedades
      const spaceCreatorId = space.creator_id.toString();
      const userId = req.user.id || req.user._id;
      
      if (spaceCreatorId !== userId) {
        return next(new ErrorHandler("No tienes permiso para actualizar este espacio", 403));
      }

      space.name = name || space.name;
      space.description = description || space.description;
      await space.save();

      // Obtener el espacio actualizado con datos poblados
      const updatedSpace = await Space.findById(space._id)
        .populate("creator_id", "name email avatar major ig_user")
        .populate("members", "name email avatar major ig_user");

      res.status(200).json({ 
        success: true, 
        space: normalizeSpace(updatedSpace) 
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Eliminar espacio (solo creador)
// ===================
router.delete(
  "/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const space = await Space.findById(req.params.id);
      if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));

      // Comparar usando ambas propiedades
      const spaceCreatorId = space.creator_id.toString();
      const userId = req.user.id || req.user._id;
      
      if (spaceCreatorId !== userId) {
        return next(new ErrorHandler("No tienes permiso para eliminar este espacio", 403));
      }

      await space.deleteOne();
      res.status(200).json({ 
        success: true, 
        message: "Espacio eliminado" 
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Unirse a un espacio
// ===================
router.post(
  "/:id/join",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const space = await Space.findById(req.params.id);
      if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));

      const userId = req.user.id || req.user._id;
      
      // Verificar si ya es miembro
      const isMember = space.members.some(memberId => 
        memberId.toString() === userId
      );
      
      if (isMember) {
        return next(new ErrorHandler("Ya eres miembro de este espacio", 400));
      }

      space.members.push(userId);
      await space.save();

      // Obtener el espacio actualizado con datos poblados
      const updatedSpace = await Space.findById(space._id)
        .populate("creator_id", "name email avatar major ig_user")
        .populate("members", "name email avatar major ig_user");

      res.status(200).json({ 
        success: true, 
        message: "Te uniste al espacio", 
        space: normalizeSpace(updatedSpace) 
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Salir de un espacio
// ===================
router.post(
  "/:id/leave",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const space = await Space.findById(req.params.id);
      if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));

      const userId = req.user.id || req.user._id;
      
      space.members = space.members.filter(
        (memberId) => memberId.toString() !== userId
      );
      await space.save();

      // Obtener el espacio actualizado con datos poblados
      const updatedSpace = await Space.findById(space._id)
        .populate("creator_id", "name email avatar major ig_user")
        .populate("members", "name email avatar major ig_user");

      res.status(200).json({ 
        success: true, 
        message: "Saliste del espacio", 
        space: normalizeSpace(updatedSpace) 
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Obtener miembros de un espacio
// ===================
router.get(
  "/:id/members",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const space = await Space.findById(req.params.id)
        .populate("members", "name email avatar major ig_user");
        
      if (!space) return next(new ErrorHandler("Espacio no encontrado", 404));

      const normalizedMembers = space.members.map(member => normalizeUser(member));
      
      res.status(200).json({ 
        success: true, 
        members: normalizedMembers 
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// ===================
// GET ALL SPACES (para explorar)
// ===================
router.get(
  "/all/explore",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const spaces = await Space.find()
        .populate("creator_id", "name avatar")
        .populate("members", "name avatar")
        .limit(50);

      const normalizedSpaces = spaces.map(space => normalizeSpace(space));
      
      res.status(200).json({ 
        success: true, 
        spaces: normalizedSpaces,
        count: normalizedSpaces.length
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// ===================
// Publicaciones recientes en un espacio
// ===================
router.get(
  "/:id/recent-posts",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      const posts = await Post.find({ space_id: id })
        .populate("author_id", "name email avatar major ig_user")
        .sort({ date: -1 })
        .limit(Number(limit));

      const normalizedPosts = posts.map(post => normalizePost(post));
      
      res.status(200).json({ 
        success: true, 
        posts: normalizedPosts 
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;