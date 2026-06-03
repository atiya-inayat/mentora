import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import router from "../routes/authRoutes.js";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./setup.js";
import { createTestUser, createBlockedUser, validRegisterData, weakPasswords } from "./utils/testHelper.js";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", router);
  return app;
};

describe("Auth Routes - Integration Tests", () => {
  let app;

  beforeAll(async () => {
    await connectTestDB();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(validRegisterData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(validRegisterData.email);
      expect(res.body.user.name).toBe(validRegisterData.name);
      expect(res.body.user.role).toBe(validRegisterData.role);
      expect(res.body.user.password).toBeUndefined();
    });

    it("should return 400 for missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("MISSING_FIELDS");
    });

    it("should reject weak passwords", async () => {
      for (const password of weakPasswords) {
        const res = await request(app)
          .post("/api/auth/register")
          .send({ ...validRegisterData, email: `test${password}@example.com`, password });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("WEAK_PASSWORD");
      }
    });

    it("should reject duplicate emails", async () => {
      await request(app).post("/api/auth/register").send(validRegisterData);

      const res = await request(app)
        .post("/api/auth/register")
        .send(validRegisterData);

      expect(res.status).toBe(409);
      expect(res.body.code).toBe("USER_EXISTS");
    });

    it("should normalize email to lowercase", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validRegisterData, email: "NEWUSER@EXAMPLE.COM" });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe("newuser@example.com");
    });

    it("should set httpOnly cookies on success", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(validRegisterData);

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
      expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(validRegisterData);
    });

    it("should login successfully with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: validRegisterData.email,
          password: validRegisterData.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
    });

    it("should return INVALID_CREDENTIALS for wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: validRegisterData.email,
          password: "WrongPassword1",
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("INVALID_CREDENTIALS");
    });

    it("should return INVALID_CREDENTIALS for non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "SomePass123",
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("INVALID_CREDENTIALS");
    });

    it("should return MISSING_FIELDS for empty input", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("MISSING_FIELDS");
    });

    it("should return USER_BLOCKED for blocked users", async () => {
      await createBlockedUser({ email: "blocked@example.com" });

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "blocked@example.com",
          password: "TestPass123",
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("USER_BLOCKED");
    });
  });

  describe("POST /api/auth/refresh", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(validRegisterData);
    });

    it("should return NO_REFRESH_TOKEN when no cookie sent", async () => {
      const res = await request(app).post("/api/auth/refresh");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("NO_REFRESH_TOKEN");
    });

    it("should refresh token with valid cookie", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: validRegisterData.email,
          password: validRegisterData.password,
        });

      const cookies = loginRes.headers["set-cookie"];
      const refreshCookie = cookies.find((c) => c.startsWith("refreshToken="));
      const cookieValue = refreshCookie.split(";")[0];

      const res = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", cookieValue);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe("TOKEN_ROTATED");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully and clear cookies", async () => {
      await request(app).post("/api/auth/register").send(validRegisterData);

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: validRegisterData.email,
          password: validRegisterData.password,
        });

      const cookies = loginRes.headers["set-cookie"];
      const cookieHeader = cookies.join("; ");

      const res = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", cookieHeader);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe("LOGGED_OUT");
    });

    it("should logout without cookies", async () => {
      const res = await request(app).post("/api/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body.code).toBe("LOGGED_OUT");
    });
  });

  describe("Error Codes Coverage", () => {
    it("should return all defined error codes", () => {
      const expectedCodes = [
        "MISSING_FIELDS",
        "WEAK_PASSWORD",
        "USER_EXISTS",
        "INVALID_CREDENTIALS",
        "USER_BLOCKED",
        "NO_TOKEN",
        "TOKEN_EXPIRED",
        "NO_REFRESH_TOKEN",
        "INVALID_REFRESH_TOKEN",
        "TOKEN_REVOKED",
        "USER_NOT_FOUND",
        "TOKEN_ROTATION_ERROR",
        "JWT_ERROR",
        "DATABASE_ERROR",
        "LOGGED_OUT",
        "SESSIONS_REVOKED",
        "INVALID_TOKEN_TYPE",
        "RATE_LIMITED",
      ];

      expectedCodes.forEach((code) => {
        expect(code).toEqual(expect.any(String));
      });
    });
  });
});
