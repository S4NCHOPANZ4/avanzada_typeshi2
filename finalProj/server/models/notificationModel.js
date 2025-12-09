const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["match_request", "match_accepted", "match_rejected"],
      required: true
    },
    from_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    to_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    // Fecha de expiración (30 días desde creación)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: { expires: 0 } // MongoDB eliminará automáticamente documentos expirados
    }
  },
  { timestamps: true }
);

// Índice compuesto para búsquedas eficientes
NotificationSchema.index({ to_user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ from_user: 1, to_user: 1, type: 1 });

module.exports = mongoose.model("Notification", NotificationSchema);