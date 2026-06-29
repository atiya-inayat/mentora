import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./setup.js";
import { createTestUser } from "./utils/testHelper.js";
import authRouter from "../routes/authRoutes.js";
import bookingRouter from "../routes/bookingRoutes.js";
import mentorRouter from "../routes/mentorRoutes.js";
import MentorProfile from "../models/MentorProfile.js";
import Booking from "../models/Booking.js";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRouter);
  app.use("/api/mentors", mentorRouter);
  app.use("/api/bookings", bookingRouter);
  return app;
};

const loginAndGetCookies = async (app, email, password) => {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  const cookies = res.headers["set-cookie"];
  return cookies ? cookies.join("; ") : "";
};

describe("Booking Routes - Integration Tests", () => {
  let app;
  let menteeCookies, mentorCookies;
  let mentorUser, menteeUser;
  let mentorProfile;

  beforeAll(async () => {
    await connectTestDB();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Register a mentor
    const mentorRes = await request(app).post("/api/auth/register").send({
      name: "Test Mentor",
      email: "mentor@example.com",
      password: "StrongPass1!",
      role: "mentor",
    });
    mentorUser = mentorRes.body.user;
    mentorCookies = mentorRes.headers["set-cookie"].join("; ");

    // Register a mentee
    const menteeRes = await request(app).post("/api/auth/register").send({
      name: "Test Mentee",
      email: "mentee@example.com",
      password: "StrongPass1!",
      role: "mentee",
    });
    menteeUser = menteeRes.body.user;
    menteeCookies = menteeRes.headers["set-cookie"].join("; ");

    // Create mentor profile
    const profileRes = await request(app)
      .post("/api/mentors/profile")
      .set("Cookie", mentorCookies)
      .send({
        bio: "Expert developer with 10 years of experience in full-stack development",
        hourlyRate: 50,
        skills: ["JavaScript", "React", "Node.js"],
      });
    mentorProfile = profileRes.body.data;
  });

  describe("POST /api/bookings/:mentorId", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();

    it("should create a booking successfully", async () => {
      const res = await request(app)
        .post(`/api/bookings/${mentorProfile._id}`)
        .set("Cookie", menteeCookies)
        .send({ scheduledAt: futureDate });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.newBooking).toBeDefined();
      expect(res.body.newBooking.status).toBe("pending");
    });

    it("should return 401 without auth", async () => {
      const res = await request(app)
        .post(`/api/bookings/${mentorProfile._id}`)
        .send({ scheduledAt: futureDate });

      expect(res.status).toBe(401);
    });

    it("should return 403 when mentee tries to book themselves", async () => {
      const res = await request(app)
        .post(`/api/bookings/${mentorProfile._id}`)
        .set("Cookie", mentorCookies)
        .send({ scheduledAt: futureDate });

      expect(res.status).toBe(403);
    });

    it("should return 400 for invalid mentor ID", async () => {
      const res = await request(app)
        .post("/api/bookings/invalidid")
        .set("Cookie", menteeCookies)
        .send({ scheduledAt: futureDate });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PUT /api/bookings/:id/accept", () => {
    it("should accept a booking successfully", async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const bookingRes = await request(app)
        .post(`/api/bookings/${mentorProfile._id}`)
        .set("Cookie", menteeCookies)
        .send({ scheduledAt: futureDate });

      const bookingId = bookingRes.body.newBooking._id;

      const res = await request(app)
        .put(`/api/bookings/${bookingId}/accept`)
        .set("Cookie", mentorCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.booking.status).toBe("accepted");
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).put(`/api/bookings/000000000000000000000000/accept`);

      expect(res.status).toBe(401);
    });

    it("should return 404 for non-existent booking", async () => {
      const fakeId = "000000000000000000000000";
      const res = await request(app)
        .put(`/api/bookings/${fakeId}/accept`)
        .set("Cookie", mentorCookies);

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/bookings/my", () => {
    it("should return bookings for authenticated user", async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      await request(app)
        .post(`/api/bookings/${mentorProfile._id}`)
        .set("Cookie", menteeCookies)
        .send({ scheduledAt: futureDate });

      const res = await request(app).get("/api/bookings/my").set("Cookie", menteeCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).get("/api/bookings/my");
      expect(res.status).toBe(401);
    });
  });
});
