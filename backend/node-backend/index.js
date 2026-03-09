import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRouter from "./routers/authRouter.js"
import cors from "cors"
import authenticateUser from "./middleware/authenticateUser.js";
dotenv.config();
const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
const port = process.env.PORT || 5000;
connectDB();
app.use("/api/auth", authRouter);
app.get("/", (req, res) => {
    res.status(200).send("welcome to our ai trip planner website")
})
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});