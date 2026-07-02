import User from "../models/User.js";
import MentorProfile from "../models/MentorProfile.js";
import Booking from "../models/Booking.js";
import mongoose from "mongoose";

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find().select("-password").lean();
    const mentorProfiles = await MentorProfile.find().select("userId isApproved").lean();
    const approvalMap = {};
    for (const p of mentorProfiles) {
      approvalMap[p.userId.toString()] = p.isApproved;
    }

    const usersWithApproval = allUsers.map((u) => ({
      ...u,
      isApproved: approvalMap[u._id.toString()] || null,
    }));

    return res.status(200).json({ success: true, allUsers: usersWithApproval });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const approveMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ success: false, message: "Invalid mentor id" });
    }
    const mentorProfile = await MentorProfile.findOne({ userId: mentorId });
    if (!mentorProfile) {
      return res.status(404).json({ success: false, message: "No mentor with this id" });
    }

    mentorProfile.isApproved = "approved";
    await mentorProfile.save();

    return res.status(200).json({ success: true, message: "approved mentor" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "No user with this id" });
    }

    user.isBlocked = true;
    await user.save();

    return res.status(200).json({ success: true, message: "User blocked" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "No user with this id" });
    }

    user.isBlocked = false;
    await user.save();

    return res.status(200).json({ success: true, message: "User unblocked" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const allBookings = await Booking.find()
      .populate("mentorId", "name email")
      .populate("menteeId", "name email");

    return res.status(200).json({ success: true, allBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
