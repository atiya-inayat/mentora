import mongoose from "mongoose";
import MentorProfile from "../models/MentorProfile.js";
import Availability from "../models/Availability.js";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SESSION_DURATION_MS = 60 * 60 * 1000;

const getTimezoneOffsetMinutes = (timezone, year, month, day) => {
  const noonUtc = new Date(Date.UTC(year, month, day, 12, 0, 0));
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(noonUtc);
  const get = (t) => parseInt(parts.find((p) => p.type === t)?.value || "0");
  const localMs = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return (noonUtc.getTime() - localMs) / 60000;
};

const computeNextAvailableSlot = (availability) => {
  if (!availability || !availability.slots || !availability.slots.length) return null;

  const timezone = availability.timezone || "UTC";
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    date.setUTCDate(date.getUTCDate() + i);
    const dayOfWeek = date.getUTCDay();
    const daySlots = availability.slots.filter((s) => s.dayOfWeek === dayOfWeek);
    for (const slot of daySlots) {
      const [h, m] = slot.startTime.split(":").map(Number);
      const offsetMinutes = getTimezoneOffsetMinutes(timezone, date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      const slotTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), h, m, 0));
      slotTime.setTime(slotTime.getTime() + offsetMinutes * 60000);
      if (slotTime > now) {
        return {
          date: slotTime,
          dayName: DAY_NAMES[dayOfWeek],
          timezone,
          formattedDate: slotTime.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            timeZone: timezone,
          }),
          formattedTime: slotTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: timezone,
          }),
        };
      }
    }
  }
  return null;
};

const getAvailabilitySummary = (availability) => {
  if (!availability || !availability.slots || !availability.slots.length) return null;
  const days = availability.slots.map((s) => DAY_NAMES[s.dayOfWeek]);
  const uniqueDays = [...new Set(days)];
  const shortDays = uniqueDays.map((d) => d.slice(0, 3));
  return {
    days: uniqueDays,
    shortDays,
    timezone: availability.timezone,
    slotCount: availability.slots.length,
  };
};

const enrichWithAvailability = async (mentors) => {
  const userIds = mentors.map((m) => (m.userId?._id || m.userId).toString());
  const availabilities = await Availability.find({ mentorId: { $in: userIds } });
  const availMap = {};
  for (const a of availabilities) {
    availMap[a.mentorId.toString()] = a;
  }
  return mentors.map((m) => {
    const obj = m.toObject ? m.toObject() : m;
    const uid = (obj.userId?._id || obj.userId)?.toString();
    const availability = availMap[uid] || null;
    return {
      ...obj,
      availability: availability ? availability.toObject() : null,
      availabilitySummary: getAvailabilitySummary(availability),
      nextAvailableSlot: computeNextAvailableSlot(availability),
    };
  });
};

export const createMentorProfile = async (req, res) => {
  try {
    const { bio, hourlyRate, skills, availability } = req.body;
    const existingProfile = await MentorProfile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(409).json({ success: false, message: "Mentor profile already exists" });
    }
    const newProfile = await MentorProfile.create({
      userId: req.user._id,
      bio,
      hourlyRate,
      skills,
      availability,
    });
    return res.status(201).json({ success: true, message: "Profile successfully created", data: newProfile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({ userId: req.user._id }).populate("userId", "name role photo");
    if (!profile) return res.status(404).json({ success: false, message: "No mentor profile found" });
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllMentors = async (req, res) => {
  try {
    const { search, skill, minRate, maxRate, minRating, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (search) filter.$or = [{ bio: { $regex: search, $options: "i" } }, { skills: { $regex: search, $options: "i" } }];
    if (skill) filter.skills = { $in: [new RegExp(skill, "i")] };
    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    }
    if (minRating) filter.averageRating = { $gte: Number(minRating) };

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

    const enriched = await enrichWithAvailability(mentors);

    return res.status(200).json({
      success: true,
      count: enriched.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: enriched,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error fetching mentors" });
  }
};

export const getMentorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid mentor id" });
    }

    const mentor = await MentorProfile.findById(id)
      .select("-stripeAccountId")
      .populate("userId", "name email photo");

    if (!mentor) return res.status(404).json({ success: false, message: "Mentor not found" });

    const mentorObj = mentor.toObject();
    const uid = (mentorObj.userId?._id || mentorObj.userId)?.toString();

    const availability = await Availability.findOne({ mentorId: uid });
    const availData = availability ? availability.toObject() : null;

    return res.status(200).json({
      success: true,
      data: {
        ...mentorObj,
        availability: availData,
        availabilitySummary: getAvailabilitySummary(availData),
        nextAvailableSlot: computeNextAvailableSlot(availData),
        sessionDurationMinutes: 60,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
