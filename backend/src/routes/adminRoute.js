import express from "express";
import {
  approveMentor,
  blockUser,
  getAllBookings,
  getAllUsers,
} from "../controllers/adminController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { blockUserSchema, approveMentorSchema } from "../validators/adminValidators.js";

const router = express.Router();

router.get("/getAllUsers", protect, restrictTo("admin"), getAllUsers);
router.get("/getAllBookings", protect, restrictTo("admin"), getAllBookings);
router.put(
  "/users/:userId/block",
  protect,
  restrictTo("admin"),
  validate(blockUserSchema),
  blockUser,
);
router.put(
  "/mentors/:mentorId/approve",
  protect,
  restrictTo("admin"),
  validate(approveMentorSchema),
  approveMentor,
);

export default router;
