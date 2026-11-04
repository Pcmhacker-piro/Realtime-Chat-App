import exprss from "express";
import { login, logout, signup, updateProfile, checkAuth } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/protectRoute.middleware.js";

const router = exprss.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

export default router;