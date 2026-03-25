import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import notificationRouter from "./routers/notificationRouter.js";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
    origin: process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : true,
    credentials: true
};

app.use(cors(corsOptions));

const port = process.env.PORT || 5000;
connectDB();

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/notifications", notificationRouter);

app.get("/", (req, res) => {
    res.status(200).send("SmartHire API — Node Backend running 🚀");
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});