import {
  createMentorProfile,
  getAllMentors,
} from "../controllers/mentorController.js";
import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/profile", protect, restrictTo("mentor"), createMentorProfile);
router.get("/", getAllMentors);

export default router;
