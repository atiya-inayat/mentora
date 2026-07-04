import express from "express";
import { joinSession, endSession, getSession } from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:bookingId/join", protect, joinSession);
router.put("/:bookingId/end", protect, endSession);
router.get("/:sessionId", protect, getSession);

export default router;