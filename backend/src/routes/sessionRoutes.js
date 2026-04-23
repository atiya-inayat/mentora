import express from "express";

import { endSession, startSession } from "../controllers/sessionController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/:bookingId/start", protect, restrictTo("mentor"), startSession);
router.put("/:bookingId/end", protect, restrictTo("mentor"), endSession);

export default router;
