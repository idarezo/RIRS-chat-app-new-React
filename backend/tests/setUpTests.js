const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// Mock required modules
jest.mock("mongoose");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("validator");
jest.mock("crypto", () => ({
  randomBytes: jest.fn().mockReturnValue({ toString: () => "mocked_token" }),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("mocked_hash_value"),
  }),
}));

// Create Express app
const app = express();
app.use(express.json());

// Mock helper functions
const mockHelperFunctions = {
  getGravatarUrl: jest.fn().mockReturnValue("http://example.com/avatar.jpg"),
  checkAuthorizationHeader: (req, res, next) => next(),
  generateToken: jest.fn().mockReturnValue("mocked_jwt_token"),
  verifyToken: (req, res, next) => {
    req.user = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      role: "user",
    };
    next();
  },
  checkPermissions: (role) => (req, res, next) => next(),
  isPrivateIP: jest.fn().mockReturnValue(false),
  resolveAllIPs: jest.fn().mockResolvedValue(["127.0.0.1"]),
};

// Define routes
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Token verification
app.get("/verifyToken", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (token === "invalid.token.here") {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  res.json({
    message: "Token valid",
    user: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      role: "user",
    },
  });
});

// User login
app.post("/userLogin", async (req, res) => {
  const { emailValue, pswd } = req.body;
  if (!emailValue || !pswd) {
    return res.status(400).send("Email and password are required");
  }

  // Mock bcrypt comparison
  const isMatch = await bcrypt.compare(pswd, "hashed_password");
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    success: true,
    token: "mocked_jwt_token",
    user: {
      email: emailValue,
      role: "user",
    },
  });
});

// User registration
app.post("/userRegistracija", (req, res) => {
  const { emailValue } = req.body;
  if (!emailValue) {
    return res.status(400).send("Credentials are not valid");
  }

  if (!validator.isEmail(emailValue)) {
    return res.status(400).send("Credentials are not valid");
  }

  res.json({
    success: true,
    message: "Registration successful",
    user: {
      email: emailValue,
      role: "user",
    },
  });
});

// Get user info
app.get("/userInfo", (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }
  // Simuliraj preverjanje tokena
  req.user = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "test@example.com",
    role: "user",
  };
  res.json({
    success: true,
    user: {
      gravatar: "http://example.com/avatar.jpg",
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// Post message
app.post("/postMessage", mockHelperFunctions.verifyToken, (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res
      .status(400)
      .json({ success: false, message: "Message content is required" });
  }

  res.status(201).json({
    success: true,
    message: "Message created",
    data: {
      ...req.body,
      id: "msg_" + Math.random().toString(36).substr(2, 9),
    },
  });
});

// Test user data
const testUser = {
  uuid: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  role: "user",
};

const validToken = "mocked_jwt_token";

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Export everything needed for tests
module.exports = {
  app,
  bcrypt,
  validator,
  jwt,
  testUser,
  validToken,
  mockHelperFunctions,
};
