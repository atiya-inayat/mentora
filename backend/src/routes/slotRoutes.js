import express from "express";
import { getAvailableSlots, reserveSlot, releaseSlot } from "../controllers/slotController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:mentorId", getAvailableSlots);
router.post("/:mentorId/reserve", protect, reserveSlot);
router.post("/:slotId/release", protect, releaseSlot);

export default router;
