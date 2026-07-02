import express from "express";
import { getAvailability, updateAvailability } from "../controllers/availabilityController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:mentorId", getAvailability);
router.put("/", protect, restrictTo("mentor"), updateAvailability);

export default router;
