export default {
  testEnvironment: "node",
  transform: {},

  moduleNameMapper: {},
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFiles: [],
  verbose: true,
  collectCoverageFrom: [
    "src/controllers/authController.js",
    "src/utils/passwordValidator.js",
    "src/models/RefreshToken.js",
    "src/models/User.js",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 65,
      statements: 65,
    },
  },
};
