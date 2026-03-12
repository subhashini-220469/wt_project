import User from "../../models/user.js";

export const logout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (user) {
      user.refreshToken = null;
      user.refreshTokenExpiry = null;
      await user.save();
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    return res.status(200).json({
      message: "Logged out successfully"
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Logout failed" });
  }
};