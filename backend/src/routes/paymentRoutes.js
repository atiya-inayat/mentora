import express from "express";
import {
  initiatePayment,
  handleWebhook,
} from "../controllers/paymentController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Webhook must come FIRST and use raw body
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

// Protected payment initiation
router.post(
  "/initiate/:bookingId",
  protect,
  restrictTo("mentee"),
  initiatePayment,
);

export default router;
