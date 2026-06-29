import express from "express";
import { acceptBooking, createBooking, getMyBookings } from "../controllers/bookingController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { createBookingSchema, acceptBookingSchema } from "../validators/bookingValidators.js";

const router = express.Router();

router.post(
  "/:mentorId",
  protect,
  restrictTo("mentee"),
  validate(createBookingSchema),
  createBooking,
);
router.put(
  "/:id/accept",
  protect,
  restrictTo("mentor"),
  validate(acceptBookingSchema),
  acceptBooking,
);
router.get("/my", protect, getMyBookings);

export default router;
