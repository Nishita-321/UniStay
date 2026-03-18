import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { login, getProfile, changePassword } from "./auth.controller.js";

const router = Router();

router.post("/login", login);
router.get("/me", authenticate, getProfile);
router.patch("/change-password", authenticate, changePassword);

export default router;
