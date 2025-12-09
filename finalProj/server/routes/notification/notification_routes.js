const express = require("express");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../../utils/errorHandler.js");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const Notification = require("../../models/notificationModel.js");
const User = require("../../models/userModel.js");

const router = express.Router();

// Middleware de autenticación
const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next(new ErrorHandler("No autenticado", 401));

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-for-dev"
    );
    req.user = { id: decoded.id, _id: decoded.id };
    next();
  } catch (error) {
    return next(new ErrorHandler("Token inválido", 401));
  }
};

// Función helper para normalizar usuario
const normalizeUser = (user) => {
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

// Función helper para normalizar notificación
const normalizeNotification = (notification) => {
  return {
    id: notification._id,
    _id: notification._id,
    type: notification.type,
    from_user: normalizeUser(notification.from_user),
    to_user: notification.to_user._id || notification.to_user,
    read: notification.read,
    createdAt: notification.createdAt,
    expiresAt: notification.expiresAt,
  };
};

// ===================
// Enviar solicitud de match
// ===================
router.post(
  "/match/request",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { targetUserId } = req.body;
      const fromUserId = req.user.id;

      if (fromUserId === targetUserId) {
        return next(new ErrorHandler("No puedes hacer match contigo mismo", 400));
      }

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return next(new ErrorHandler("Usuario no encontrado", 404));
      }

      // Verificar si ya existe una solicitud pendiente
      const existingNotification = await Notification.findOne({
        from_user: fromUserId,
        to_user: targetUserId,
        type: "match_request",
      });

      if (existingNotification) {
        return next(
          new ErrorHandler("Ya existe una solicitud de match pendiente", 400)
        );
      }

      // Verificar si ya son matches
      const fromUser = await User.findById(fromUserId);
      if (fromUser.matches.includes(targetUserId)) {
        return next(new ErrorHandler("Ya son matches", 400));
      }

      // Crear notificación
      const notification = await Notification.create({
        type: "match_request",
        from_user: fromUserId,
        to_user: targetUserId,
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate("from_user", "name email avatar major ig_user");

      res.status(201).json({
        success: true,
        message: "Solicitud de match enviada",
        notification: normalizeNotification(populatedNotification),
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Obtener notificaciones del usuario
// ===================
router.get(
  "/my-notifications",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notifications = await Notification.find({
        to_user: req.user.id,
      })
        .populate("from_user", "name email avatar major ig_user")
        .sort({ createdAt: -1 });

      const normalizedNotifications = notifications.map((n) =>
        normalizeNotification(n)
      );

      res.status(200).json({
        success: true,
        notifications: normalizedNotifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Marcar notificación como leída
// ===================
router.put(
  "/:notificationId/read",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notification = await Notification.findById(req.params.notificationId);

      if (!notification) {
        return next(new ErrorHandler("Notificación no encontrada", 404));
      }

      if (notification.to_user.toString() !== req.user.id) {
        return next(
          new ErrorHandler(
            "No tienes permiso para modificar esta notificación",
            403
          )
        );
      }

      notification.read = true;
      await notification.save();

      res.status(200).json({
        success: true,
        message: "Notificación marcada como leída",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Aceptar solicitud de match
// ===================
router.post(
  "/match/accept/:notificationId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notification = await Notification.findById(req.params.notificationId);

      if (!notification) {
        return next(new ErrorHandler("Notificación no encontrada", 404));
      }

      if (notification.to_user.toString() !== req.user.id) {
        return next(
          new ErrorHandler("No tienes permiso para aceptar esta solicitud", 403)
        );
      }

      if (notification.type !== "match_request") {
        return next(
          new ErrorHandler("Esta notificación no es una solicitud de match", 400)
        );
      }

      // Agregar a ambos usuarios en sus listas de matches
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { matches: notification.from_user },
      });

      await User.findByIdAndUpdate(notification.from_user, {
        $addToSet: { matches: req.user.id },
      });

      // Crear notificación de aceptación para el solicitante
      await Notification.create({
        type: "match_accepted",
        from_user: req.user.id,
        to_user: notification.from_user,
      });

      // Eliminar la notificación original
      await notification.deleteOne();

      res.status(200).json({
        success: true,
        message: "Match aceptado exitosamente",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Rechazar solicitud de match
// ===================
router.post(
  "/match/reject/:notificationId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notification = await Notification.findById(req.params.notificationId);

      if (!notification) {
        return next(new ErrorHandler("Notificación no encontrada", 404));
      }

      if (notification.to_user.toString() !== req.user.id) {
        return next(
          new ErrorHandler("No tienes permiso para rechazar esta solicitud", 403)
        );
      }

      if (notification.type !== "match_request") {
        return next(
          new ErrorHandler("Esta notificación no es una solicitud de match", 400)
        );
      }

      // Opcional: Crear notificación de rechazo
      await Notification.create({
        type: "match_rejected",
        from_user: req.user.id,
        to_user: notification.from_user,
      });

      // Eliminar la notificación original
      await notification.deleteOne();

      res.status(200).json({
        success: true,
        message: "Solicitud rechazada",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Obtener matches del usuario
// ===================
router.get(
  "/my-matches",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate(
        "matches",
        "name email avatar major ig_user"
      );

      if (!user) {
        return next(new ErrorHandler("Usuario no encontrado", 404));
      }

      const normalizedMatches = user.matches.map((m) => normalizeUser(m));

      res.status(200).json({
        success: true,
        matches: normalizedMatches,
        count: normalizedMatches.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// Eliminar match
// ===================
router.delete(
  "/match/:matchUserId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { matchUserId } = req.params;

      // Eliminar de ambos usuarios
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { matches: matchUserId },
      });

      await User.findByIdAndUpdate(matchUserId, {
        $pull: { matches: req.user.id },
      });

      res.status(200).json({
        success: true,
        message: "Match eliminado",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;