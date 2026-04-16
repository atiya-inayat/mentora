import { login, register } from "../controllers/authController.js";
import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.get("/admin-only", protect, restrictTo("admin"), (req, res) => {
  res.json({ success: true, message: "Welcome admin" });
});

export default router;
