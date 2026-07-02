import express from "express";
import { initiateCheckout, handleWebhook, getPaymentSuccess, confirmPayment } from "../controllers/paymentController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);
router.post("/create-checkout", protect, restrictTo("mentee"), initiateCheckout);
router.get("/success", protect, getPaymentSuccess);
router.post("/confirm", protect, confirmPayment);

export default router;
