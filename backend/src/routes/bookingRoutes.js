import express from "express";
import { getMyBookings } from "../controllers/bookingController.js";
import { releasePayment } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", protect, getMyBookings);
router.post("/:bookingId/release-payment", protect, releasePayment);

export default router;
