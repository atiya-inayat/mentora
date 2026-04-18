import express from "express";
import {
  acceptBooking,
  createBooking,
} from "../controllers/bookingController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:mentorId", protect, restrictTo("mentee"), createBooking);
router.put("/:id/accept", protect, restrictTo("mentor"), acceptBooking);

export default router;
