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
