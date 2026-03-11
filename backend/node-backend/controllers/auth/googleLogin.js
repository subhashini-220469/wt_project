import { OAuth2Client } from "google-auth-library";
import User from "../../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    try {

        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { name, email } = payload;

        let user = await User.findOne({ email });

        // First time Google login
        if (!user) {
            user = await User.create({
                username: name,
                email,
                provider: "google",
                password: null,
                role: null
            });
        }
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "5m" }
        );
        const refreshToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        user.refreshToken = hashedRefreshToken;
        user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await user.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Google login success",
            accessToken,
            role: user.role === "null" ? null : user.role,
            roleRequired: user.role === "null" || user.role == null
        });

    } catch (e) {
        console.error(e);
        return res.status(401).json({ error: "Google login failed" });
    }
};