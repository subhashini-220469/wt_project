import { userZodSchema } from "../../validators/userValidators.js"
import User from "../../models/user.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
export const signup = async (req, res) => {
    try {
        const userValidateData = userZodSchema.parse(req.body)
        const { email, password, provider } = userValidateData
        const isEmailExist = await User.findOne({ email })
        if (isEmailExist) return res.status(409).json({ error: "email already exist" })
        let hashedPassword = undefined
        if (provider === "local") {
            hashedPassword = await bcrypt.hash(password, 10)
        }
        const newUser = await User.create({ ...userValidateData, password: hashedPassword })
        return res.status(201).json({ message: "user created successfully" })

    } catch (e) {
        if (e.name === "ZodError") {
            // Return the first validation error as a clear, specific message
            const firstError = e.issues[0];
            return res.status(400).json({ error: firstError.message })
        }
        res.status(500).json({ error: "Server error" })
    }
}
export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prevent Google users from logging with password
        if (user.provider !== "local") {
            return res.status(400).json({ error: "Please login using Google" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
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
            message: "Successfully logged in",
            accessToken,
            role: user.role === "null" ? null : user.role,
            roleRequired: user.role === "null" || user.role == null
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Server error" });
    }
};


