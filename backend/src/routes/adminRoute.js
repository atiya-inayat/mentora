import express from "express";
import {
  approveMentor,
  blockUser,
  getAllBookings,
  getAllUsers,
} from "../controllers/adminController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/getAllUsers", protect, restrictTo("admin"), getAllUsers);
router.get("/getAllBookings", protect, restrictTo("admin"), getAllBookings);
router.put("/users/:userId/block", protect, restrictTo("admin"), blockUser);
router.put(
  "/mentors/:mentorId/approve",
  protect,
  restrictTo("admin"),
  approveMentor,
);

export default router;
