import Slot from "../models/Slot.js";
import Availability from "../models/Availability.js";
import MentorProfile from "../models/MentorProfile.js";

const RESERVATION_TTL_MS = 10 * 60 * 1000;
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

const releaseExpiredReservations = async () => {
  const cutoff = new Date(Date.now() - RESERVATION_TTL_MS);
  await Slot.updateMany(
    { status: "reserved", reservedAt: { $lt: cutoff } },
    { status: "available", reservedAt: null, reservedBy: null }
  );
};

const generateSlotsForDay = (mentorId, date, daySlots, timezone) => {
  const slots = [];
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const offsetMinutes = getTimezoneOffsetMinutes(timezone, y, m, d);

  for (const s of daySlots) {
    const [startH, startM] = s.startTime.split(":").map(Number);
    const [endH, endM] = s.endTime.split(":").map(Number);

    const dayStart = new Date(Date.UTC(y, m, d, startH, startM, 0));
    dayStart.setTime(dayStart.getTime() + offsetMinutes * 60000);

    const dayEnd = new Date(Date.UTC(y, m, d, endH, endM, 0));
    dayEnd.setTime(dayEnd.getTime() + offsetMinutes * 60000);

    let cursor = new Date(dayStart);
    while (cursor.getTime() + SESSION_DURATION_MS <= dayEnd.getTime()) {
      slots.push({
        mentorId,
        startTime: new Date(cursor),
        endTime: new Date(cursor.getTime() + SESSION_DURATION_MS),
      });
      cursor = new Date(cursor.getTime() + SESSION_DURATION_MS);
    }
  }
  return slots;
};

const resolveMentorUserId = async (inputId) => {
  let availability = await Availability.findOne({ mentorId: inputId });
  if (availability) return { userId: inputId, availability };

  const profile = await MentorProfile.findById(inputId).select("userId");
  if (profile) {
    const uid = profile.userId?.toString();
    availability = await Availability.findOne({ mentorId: uid });
    if (availability) return { userId: uid, availability };
  }
  return { userId: null, availability: null };
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { date, days: daysParam } = req.query;

    await releaseExpiredReservations();

    const { userId, availability } = await resolveMentorUserId(mentorId);
    if (!userId || !availability || !availability.slots.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    const numDays = daysParam ? parseInt(daysParam) : (date ? 1 : 7);
    const timezone = availability.timezone || "UTC";

    const now = new Date();
    const rangeStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + numDays);

    const existing = await Slot.find({
      mentorId: userId,
      startTime: { $gte: rangeStart, $lt: rangeEnd },
      status: { $in: ["reserved", "booked"] },
    });
    const takenMap = {};
    for (const e of existing) {
      takenMap[e.startTime.getTime()] = true;
    }

    const mentorProfile = await MentorProfile.findOne({ userId });
    const price = mentorProfile?.hourlyRate || 0;
    const nowMs = Date.now();

    let allSlots = [];
    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(rangeStart);
      currentDate.setUTCDate(currentDate.getUTCDate() + i);

      const dayOfWeek = currentDate.getUTCDay();
      const daySlots = availability.slots.filter((s) => s.dayOfWeek === dayOfWeek);

      if (!daySlots.length) continue;

      const generated = generateSlotsForDay(userId, currentDate, daySlots, timezone);

      for (const s of generated) {
        if (s.startTime.getTime() <= nowMs) continue;
        if (takenMap[s.startTime.getTime()]) continue;
        allSlots.push({
          startTime: s.startTime,
          endTime: s.endTime,
          price,
        });
      }
    }

    return res.status(200).json({ success: true, data: allSlots });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reserveSlot = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { startTime } = req.body;
    const menteeId = req.user._id;

    await releaseExpiredReservations();

    const { userId, availability } = await resolveMentorUserId(mentorId);
    if (!userId || !availability) {
      return res.status(400).json({ success: false, message: "Mentor availability not found" });
    }

    const existing = await Slot.findOne({
      mentorId: userId,
      startTime: new Date(startTime),
      status: { $in: ["reserved", "booked"] },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "Slot already taken" });
    }

    const requestedDate = new Date(startTime);
    const timezone = availability.timezone || "UTC";
    const offsetMinutes = getTimezoneOffsetMinutes(timezone, requestedDate.getUTCFullYear(), requestedDate.getUTCMonth(), requestedDate.getUTCDate());
    const localDate = new Date(requestedDate.getTime() + offsetMinutes * 60000);
    const dayOfWeek = localDate.getUTCDay();
    const daySlot = availability.slots.find((s) => s.dayOfWeek === dayOfWeek);
    if (!daySlot) {
      return res.status(400).json({ success: false, message: "Mentor not available on this day" });
    }

    const slot = await Slot.create({
      mentorId: userId,
      startTime: new Date(startTime),
      endTime: new Date(new Date(startTime).getTime() + SESSION_DURATION_MS),
      status: "reserved",
      reservedAt: new Date(),
      reservedBy: menteeId,
    });

    return res.status(201).json({ success: true, data: slot });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const releaseSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const slot = await Slot.findById(slotId);
    if (!slot || slot.status !== "reserved") {
      return res.status(400).json({ success: false, message: "Slot not reserved" });
    }
    slot.status = "available";
    slot.reservedAt = null;
    slot.reservedBy = null;
    await slot.save();
    return res.status(200).json({ success: true, message: "Slot released" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
