import {
  createMentorProfile,
  getAllMentors,
  getMentorById,
  getMyProfile,
} from "../controllers/mentorController.js";
import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/profile", protect, restrictTo("mentor"), createMentorProfile);
router.get("/profile/me", protect, restrictTo("mentor"), getMyProfile);
router.get("/", getAllMentors);
router.get("/:id", getMentorById);

export default router;
