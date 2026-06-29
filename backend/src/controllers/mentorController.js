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
    const profile = await MentorProfile.findOne({
      userId: req.user._id,
    }).populate("userId", "name role photo");

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
    const { search, skill, minRate, maxRate, minRating, page = 1, limit = 12 } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { bio: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    if (skill) {
      filter.skills = { $in: [new RegExp(skill, "i")] };
    }

    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    }

    if (minRating) {
      filter.averageRating = { $gte: Number(minRating) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [mentors, total] = await Promise.all([
      MentorProfile.find(filter)
        .select("-stripeAccountId")
        .populate("userId", "name role photo")
        .skip(skip)
        .limit(Number(limit))
        .sort({ averageRating: -1, createdAt: -1 }),
      MentorProfile.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: mentors.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
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
      return res.status(400).json({ success: false, message: "Invalid mentor id " });
    }

    const mentor = await MentorProfile.findById(id)
      .select("-stripeAccountId")
      .populate("userId", "name email photo");

    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor not found" });
    }

    return res.status(200).json({ success: true, data: mentor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
