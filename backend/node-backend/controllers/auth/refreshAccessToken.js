import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../models/user.js";
import dotenv from "dotenv";
dotenv.config();

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    // Verify the incoming refresh token signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshToken) {
      return res.status(401).json({ message: "User not found or logged out" });
    }

    // Check stored hashed refresh token matches the one in the cookie
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      return res.status(401).json({ message: "Refresh token mismatch" });
    }

    // Check expiry stored in DB as an extra safety net
    if (user.refreshTokenExpiry && user.refreshTokenExpiry < new Date()) {
      return res.status(401).json({ message: "Refresh token expired" });
    }

    // Issue fresh access token
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    return res.status(200).json({ accessToken: newAccessToken });

  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Could not refresh token" });
  }
};