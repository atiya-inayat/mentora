import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./setup.js";
import authRouter from "../routes/authRoutes.js";
import mentorRouter from "../routes/mentorRoutes.js";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRouter);
  app.use("/api/mentors", mentorRouter);
  return app;
};

describe("Mentor Routes - Integration Tests", () => {
  let app;
  let mentorCookies, menteeCookies;
  let mentorUser;

  beforeAll(async () => {
    await connectTestDB();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    const mentorRes = await request(app).post("/api/auth/register").send({
      name: "Test Mentor",
      email: "mentor@example.com",
      password: "StrongPass1!",
      role: "mentor",
    });
    mentorUser = mentorRes.body.user;
    mentorCookies = mentorRes.headers["set-cookie"].join("; ");

    const menteeRes = await request(app).post("/api/auth/register").send({
      name: "Test Mentee",
      email: "mentee@example.com",
      password: "StrongPass1!",
      role: "mentee",
    });
    menteeCookies = menteeRes.headers["set-cookie"].join("; ");
  });

  describe("POST /api/mentors/profile", () => {
    it("should create a mentor profile", async () => {
      const res = await request(app)
        .post("/api/mentors/profile")
        .set("Cookie", mentorCookies)
        .send({
          bio: "Expert developer with 10 years of experience in full-stack development",
          hourlyRate: 50,
          skills: ["JavaScript", "React", "Node.js"],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bio).toBeDefined();
      expect(res.body.data.hourlyRate).toBe(50);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app)
        .post("/api/mentors/profile")
        .send({
          bio: "Expert developer",
          hourlyRate: 50,
          skills: ["JavaScript"],
        });

      expect(res.status).toBe(401);
    });

    it("should return 403 for non-mentor role", async () => {
      const res = await request(app)
        .post("/api/mentors/profile")
        .set("Cookie", menteeCookies)
        .send({
          bio: "Expert developer with 10 years of experience in full-stack development",
          hourlyRate: 50,
          skills: ["JavaScript", "React", "Node.js"],
        });

      expect(res.status).toBe(403);
    });

    it("should return 409 for duplicate profile", async () => {
      await request(app)
        .post("/api/mentors/profile")
        .set("Cookie", mentorCookies)
        .send({
          bio: "Expert developer with 10 years of experience in full-stack development",
          hourlyRate: 50,
          skills: ["JavaScript"],
        });

      const res = await request(app)
        .post("/api/mentors/profile")
        .set("Cookie", mentorCookies)
        .send({
          bio: "Another bio that is sufficiently long to pass validation",
          hourlyRate: 100,
          skills: ["Python"],
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("already exists");
    });
  });

  describe("GET /api/mentors/profile/me", () => {
    it("should return own profile", async () => {
      await request(app)
        .post("/api/mentors/profile")
        .set("Cookie", mentorCookies)
        .send({
          bio: "Expert developer with 10 years of experience in full-stack development",
          hourlyRate: 50,
          skills: ["JavaScript"],
        });

      const res = await request(app).get("/api/mentors/profile/me").set("Cookie", mentorCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bio).toBeDefined();
    });

    it("should return 404 if no profile exists", async () => {
      const res = await request(app).get("/api/mentors/profile/me").set("Cookie", mentorCookies);

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/mentors/", () => {
    it("should return all mentors", async () => {
      await request(app)
        .post("/api/mentors/profile")
        .set("Cookie", mentorCookies)
        .send({
          bio: "Expert developer with 10 years of experience in full-stack development",
          hourlyRate: 50,
          skills: ["JavaScript"],
        });

      const res = await request(app).get("/api/mentors/");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it("should return empty array when no mentors exist", async () => {
      const res = await request(app).get("/api/mentors/");

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("GET /api/mentors/:id", () => {
    it("should return mentor by ID", async () => {
      const profileRes = await request(app)
        .post("/api/mentors/profile")
        .set("Cookie", mentorCookies)
        .send({
          bio: "Expert developer with 10 years of experience in full-stack development",
          hourlyRate: 50,
          skills: ["JavaScript"],
        });

      const res = await request(app).get(`/api/mentors/${profileRes.body.data._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(profileRes.body.data._id);
    });

    it("should return 404 for non-existent mentor", async () => {
      const fakeId = "000000000000000000000000";
      const res = await request(app).get(`/api/mentors/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it("should return 400 for invalid ID format", async () => {
      const res = await request(app).get("/api/mentors/invalidid");

      expect(res.status).toBe(400);
    });
  });
});
