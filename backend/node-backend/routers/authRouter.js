import express from "express";
import { googleLogin } from "../controllers/auth/googleLogin.js";
import { signin, signup } from "../controllers/auth/user.js";
import { logout } from "../controllers/auth/logout.js";
import authenticateUser from "../middleware/authenticateUser.js";
import { setRole } from "../controllers/auth/setRole.js";
import { refreshAccessToken } from "../controllers/auth/refreshAccessToken.js";
const router = express.Router();

router.post("/google", googleLogin);
router.post("/signin", signin);
router.post("/signup", signup);
router.post("/logout", authenticateUser, logout);
router.post("/set-role", authenticateUser, setRole);
router.post("/refresh-token", refreshAccessToken);
export default router;