import Notification from "../models/notification.js";

// ─── GET /api/notifications?email=xxx ────────────────────────────────────────
// Returns all notifications for a user (sorted newest first).
// Also auto-generates deadline reminders on-the-fly (mirrors Python behaviour).
export const getNotifications = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "email query param required" });

    // Auto-generate deadline reminders (same logic as Python behaviour)
    try {
      const mongoose = (await import("mongoose")).default;
      const db = mongoose.connection.db;

      // Only generate candidate-type notifications for 'user' role
      const user = await db.collection("users").findOne({ email: email });
      const isCandidate = (user && user.role === 'user');

      if (isCandidate) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];

        const closingJobs = await db
          .collection("jobs")
          .find({ deadline: tomorrowStr, status: "open" })
          .limit(10)
          .toArray();

        for (const job of closingJobs) {
          const jobId = job._id.toString();
          const already = await Notification.findOne({
            user_email: email,
            job_id: jobId,
            type: "deadline",
          });

          if (!already) {
            await Notification.create({
              user_email: email,
              message: `⏳ Last day to apply! ${job.job_title} at ${job.company} closes tomorrow.`,
              type: "deadline",
              job_id: jobId,
              link: "/app/discover",
              is_read: false,
              created_at: new Date().toISOString(),
            });
          }
        }
      }
    } catch (e) {
      console.warn("Deadline auto-gen skipped:", e.message);
    }

    const notifs = await Notification.find({ user_email: email })
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    res.json(notifs);
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/notifications/unread-count?email=xxx ───────────────────────────
export const getUnreadCount = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "email required" });

    const count = await Notification.countDocuments({
      user_email: email,
      is_read: false,
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
export const markOneRead = async (req, res) => {
  try {
    const result = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { is_read: true } },
      { new: true }
    );
    if (!result) return res.status(404).json({ error: "Notification not found" });
    res.json({ message: "Marked as read", notification: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── PATCH /api/notifications/mark-all-read ──────────────────────────────────
export const markAllRead = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    const result = await Notification.updateMany(
      { user_email: email, is_read: false },
      { $set: { is_read: true } }
    );

    res.json({ message: "All marked as read", updated: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────
export const deleteNotification = async (req, res) => {
  try {
    const result = await Notification.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── DELETE /api/notifications/clear-all ─────────────────────────────────────
// Clears ALL read notifications for a user (housekeeping)
export const clearAllRead = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    const result = await Notification.deleteMany({
      user_email: email,
      is_read: true,
    });
    res.json({ message: "Read notifications cleared", deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/notifications (internal / admin use) ──────────────────────────
export const createNotification = async (req, res) => {
  try {
    const { user_email, message, type, job_id, link } = req.body;
    if (!user_email || !message) {
      return res.status(400).json({ error: "user_email and message are required" });
    }
    const notif = await Notification.create({
      user_email,
      message,
      type: type || "general",
      job_id: job_id || null,
      link: link || "/app",
      is_read: false,
      created_at: new Date().toISOString(),
    });
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
