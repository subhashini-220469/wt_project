import mongoose from "mongoose";

/**
 * Notification Schema
 * Stored in the 'notifications' collection inside resume_screening db.
 * Mirrors the Python FastAPI notification format for cross-service compatibility.
 */
const notificationSchema = new mongoose.Schema(
  {
    user_email: {
      type: String,
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
    },

    // Notification type: new_job | deadline | interview | new_app
    type: {
      type: String,
      enum: ["new_job", "deadline", "interview", "new_app", "general"],
      default: "general",
    },

    // Optional: deep-link to a specific job
    job_id: {
      type: String,
      default: null,
    },

    link: {
      type: String,
      default: "/app",
    },

    is_read: {
      type: Boolean,
      default: false,
    },

    // ISO string — kept as String to match Python backend format
    created_at: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    // Don't use Mongoose timestamps so the created_at format stays consistent
    // with what the Python backend writes
    timestamps: false,
    collection: "notifications", // explicit collection name
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
