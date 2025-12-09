const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../../utils/errorHandler.js");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const User = require("../../models/userModel.js");

const router = express.Router();

// Función helper para normalizar usuario
const normalizeUser = (user) => {
  if (!user) return null;
  
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    major: user.major,
    ig_user: user.ig_user,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const sendToken = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret-for-dev', {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    user: normalizeUser(user)
  });
};

// ===================
// RUTAS PÚBLICAS
// ===================

// CREATE USER (REGISTER)
router.post(
  "/register",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, email, password, major, ig_user, avatar } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new ErrorHandler("El correo ya está registrado", 400));
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        major,
        ig_user,
        avatar: avatar || {
          bodyColor: "#ffd7ba",
          hairStyle: "hair3",
          hairColor: "#2c1b18",
          eyeStyle: "eyes1",
          mouthStyle: "mouth1",
          backgroundColor: "#decd4aff"
        }
      });

      sendToken(newUser, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOGIN USER
router.post(
  "/login",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Ingresa correo y contraseña", 400));
      }

      const user = await User.findOne({ email });
      if (!user) {
        return next(new ErrorHandler("Usuario no encontrado", 404));
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next(new ErrorHandler("Contraseña incorrecta", 401));
      }

      sendToken(user, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// RUTAS PROTEGIDAS (requieren autenticación)
// ===================

// PROFILE USER
router.get(
  "/profile",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return next(new ErrorHandler("No autenticado", 401));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-dev');
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new ErrorHandler("Usuario no encontrado", 404));
      }

      res.status(200).json({ 
        success: true, 
        user: normalizeUser(user) 
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new ErrorHandler("Token inválido", 401));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new ErrorHandler("Token expirado", 401));
      }
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOGOUT USER
router.post(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.status(200).json({ success: true, message: "Sesión cerrada" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE USER AVATAR
router.put(
  "/avatar",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return next(new ErrorHandler("No autenticado", 401));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-dev');
      const { avatar } = req.body;

      if (!avatar) {
        return next(new ErrorHandler("Avatar es requerido", 400));
      }

      const updatedUser = await User.findByIdAndUpdate(
        decoded.id,
        { avatar },
        { new: true, runValidators: true }
      ).select("-password");

      res.status(200).json({
        success: true,
        user: normalizeUser(updatedUser)
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// ===================
// GET ALL USERS (para explorar)
// ===================
router.get(
  "/all",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Excluir al usuario actual si está autenticado
      const token = req.cookies.token;
      let excludeId = null;
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-dev');
          excludeId = decoded.id;
        } catch (jwtError) {
          // Token inválido, continuar sin excluir
        }
      }

      let query = User.find().select("-password -email").limit(50);
      
      if (excludeId) {
        query = query.where('_id').ne(excludeId);
      }
      
      const users = await query;
      
      const normalizedUsers = users.map(user => normalizeUser(user));
      
      res.status(200).json({ 
        success: true, 
        users: normalizedUsers,
        count: normalizedUsers.length
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// ===================
// RUTA CON PARÁMETRO (DEBE IR AL FINAL)
// ===================

// GET USER BY ID (esta ruta debe ir AL FINAL)
router.get(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        return next(new ErrorHandler("Usuario no encontrado", 404));
      }
      res.status(200).json({ 
        success: true, 
        user: normalizeUser(user) 
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;