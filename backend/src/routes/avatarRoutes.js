import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadAvatar, uploadUserPhoto } from "../controllers/avatarController.js";

const router = express.Router();

router.post("/photo", protect, uploadAvatar.single("photo"), uploadUserPhoto);

export default router;
