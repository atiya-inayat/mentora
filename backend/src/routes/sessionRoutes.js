import express from "express";

import {
  endSession,
  getSession,
  startSession,
  postponeSession,
} from "../controllers/sessionController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/:bookingId/start", protect, restrictTo("mentor"), startSession);
router.put("/:bookingId/end", protect, restrictTo("mentor"), endSession);
router.put("/:bookingId/postpone", protect, restrictTo("mentor"), postponeSession);
router.get("/:sessionId", protect, getSession);

export default router;
