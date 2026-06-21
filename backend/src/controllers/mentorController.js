import mongoose from "mongoose";
import MentorProfile from "../models/MentorProfile.js";

export const createMentorProfile = async (req, res) => {
  try {
    const { bio, hourlyRate, skills, availability } = req.body; // Fix typo: availability

    // ✓ Corrected to findOne for field searching
    const existingProfile = await MentorProfile.findOne({
      userId: req.user._id,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Mentor profile already exists",
      });
    }

    const newProfile = await MentorProfile.create({
      userId: req.user._id,
      bio,
      hourlyRate,
      skills,
      availability,
    });

    // Tip: Use 201 for "Created" instead of 200
    return res.status(201).json({
      success: true,
      message: "Profile successfully created",
      data: newProfile,
    });
  } catch (error) {
    // Log the actual error for debugging, but return a clean message
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({ userId: req.user._id }).populate("userId", "name role");

    if (!profile) {
      return res.status(404).json({ success: false, message: "No mentor profile found" });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllMentors = async (req, res) => {
  try {
    // We find all profiles and "join" the User data
    // We only want the 'name' and want to hide 'email' and 'password'

    const mentors = await MentorProfile.find().populate("userId", "name role ");

    if (!mentors || mentors.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "no mentors yet" });
    }

    return res.status(200).json({
      success: true,
      count: mentors.length, // show how many were found
      data: mentors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching mentors",
    });
  }
};

export const getMentorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mentor id " });
    }

    const mentor = await MentorProfile.findById(id).populate(
      "userId",
      "name role",
    );

    if (!mentor) {
      return res
        .status(404)
        .json({ success: false, message: "mentor not found." });
    }

    return res.status(200).json({ success: true, data: mentor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
