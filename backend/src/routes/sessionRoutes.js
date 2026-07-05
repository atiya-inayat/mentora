import express from "express";
import {
  joinSession,
  admitGuest,
  declineGuest,
  endSession,
  getSession,
} from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:bookingId/join", protect, joinSession);
router.post("/:sessionId/admit", protect, admitGuest);
router.post("/:sessionId/decline", protect, declineGuest);
router.put("/:bookingId/end", protect, endSession);
router.get("/:sessionId", protect, getSession);

export default router;
