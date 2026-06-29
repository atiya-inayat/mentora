import express from "express";
import { creatReview } from "../controllers/reviewController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { createReviewSchema } from "../validators/reviewValidators.js";

const router = express.Router();

router.post(
  "/:bookingId",
  protect,
  restrictTo("mentee"),
  validate(createReviewSchema),
  creatReview,
);

export default router;
