import express from "express";
import { endSession, getSession, startSession } from "../controllers/sessionController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import {
  startSessionSchema,
  endSessionSchema,
  getSessionSchema,
} from "../validators/sessionValidators.js";

const router = express.Router();

router.put("/:bookingId/start", protect, restrictTo("mentor"), validate(startSessionSchema), startSession);
router.put("/:bookingId/end", protect, restrictTo("mentor"), validate(endSessionSchema), endSession);
router.get("/:sessionId", protect, validate(getSessionSchema), getSession);

export default router;
