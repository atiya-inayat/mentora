import express from "express";
import {
  confirmPayment,
  initiatePayment,
  handleWebhook,
} from "../controllers/paymentController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { initiatePaymentSchema, confirmPaymentSchema } from "../validators/paymentValidators.js";

const router = express.Router();

// Webhook must come FIRST and use raw body
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

// Protected payment initiation
router.post(
  "/initiate/:bookingId",
  protect,
  restrictTo("mentee"),
  validate(initiatePaymentSchema),
  initiatePayment,
);

// Confirm payment after Stripe success (no webhook needed for dev)
router.post(
  "/confirm/:bookingId",
  protect,
  restrictTo("mentee"),
  validate(confirmPaymentSchema),
  confirmPayment,
);

export default router;
