const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../../utils/errorHandler.js");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const User = require("../../models/userModel.js");

const router = express.Router();


const sendToken = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // en prod solo HTTPS
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  });

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

// ===================
// GET USER BY ID
// ===================
router.get(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        return next(new ErrorHandler("Usuario no encontrado", 404));
      }
      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// CREATE USER (REGISTER)
// ===================
router.post(
  "/register",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, email, password, major, ig_profile_url, ig_user } = req.body;

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
        ig_profile_url,
        ig_user,
      });

      sendToken(newUser, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// LOGIN USER
// ===================
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
// LOGOUT USER
// ===================
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

// ===================
// PROFILE USER (requiere auth middleware)
// ===================
router.get(
  "/profile",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return next(new ErrorHandler("No autenticado", 401));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new ErrorHandler("Usuario no encontrado", 404));
      }

      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
