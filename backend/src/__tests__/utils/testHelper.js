import User from "../../models/User.js";
import RefreshToken from "../../models/RefreshToken.js";

export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    name: "Test User",
    email: "test@example.com",
    password: "TestPass123",
    role: "mentee",
  };

  return await User.create({ ...defaultUser, ...overrides });
};

export const createBlockedUser = async (overrides = {}) => {
  return await createTestUser({ ...overrides, isBlocked: true });
};

export const getCookiesFromResponse = (res) => {
  const cookies = res.headers["set-cookie"];
  if (!cookies) return {};

  const parsed = {};
  cookies.forEach((cookie) => {
    const [nameValue] = cookie.split(";");
    const [name, value] = nameValue.split("=");
    parsed[name.trim()] = value.trim();
  });

  return parsed;
};

export const extractCsrfToken = (html) => {
  return null;
};

export const validRegisterData = {
  name: "New User",
  email: "newuser@example.com",
  password: "StrongPass1",
  role: "mentee",
};

export const weakPasswords = [
  "short",
  "nouppercase1",
  "NOLOWERCASE1",
  "NoNumbers!",
];

export const invalidEmails = [
  "notanemail",
  "@domain.com",
  "user@",
];
