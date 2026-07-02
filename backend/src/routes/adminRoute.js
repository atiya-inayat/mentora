import express from "express";
import {
  approveMentor,
  blockUser,
  unblockUser,
  getAllBookings,
  getAllUsers,
} from "../controllers/adminController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { blockUserSchema, approveMentorSchema, unblockUserSchema } from "../validators/adminValidators.js";

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
  "/users/:userId/unblock",
  protect,
  restrictTo("admin"),
  validate(unblockUserSchema),
  unblockUser,
);
router.put(
  "/mentors/:mentorId/approve",
  protect,
  restrictTo("admin"),
  validate(approveMentorSchema),
  approveMentor,
);

export default router;
