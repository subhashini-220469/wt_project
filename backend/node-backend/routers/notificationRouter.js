import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markOneRead,
  markAllRead,
  deleteNotification,
  clearAllRead,
  createNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// GET all notifications for a user
// GET /api/notifications?email=user@example.com
router.get("/", getNotifications);

// GET unread count
// GET /api/notifications/unread-count?email=user@example.com
router.get("/unread-count", getUnreadCount);

// POST create a notification (internal / admin)
// POST /api/notifications
router.post("/", createNotification);

// PATCH mark all as read for a user
// PATCH /api/notifications/mark-all-read  { email }
router.patch("/mark-all-read", markAllRead);

// DELETE clear all READ notifications for a user (housekeeping)
// DELETE /api/notifications/clear-all  { email }
router.delete("/clear-all", clearAllRead);

// PATCH mark single notification as read
// PATCH /api/notifications/:id/read
router.patch("/:id/read", markOneRead);

// DELETE a single notification
// DELETE /api/notifications/:id
router.delete("/:id", deleteNotification);

export default router;
