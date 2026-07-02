import Availability from "../models/Availability.js";

export const getAvailability = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const availability = await Availability.findOne({ mentorId });
    return res.status(200).json({ success: true, data: availability || { slots: [] } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const mentorId = req.user._id;
    const { slots, timezone } = req.body;

    const availability = await Availability.findOneAndUpdate(
      { mentorId },
      { mentorId, slots, timezone: timezone || "UTC" },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, data: availability });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
