import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import User from "../models/User.js";

// Mock Sentry to prevent loading background Sentry tasks
jest.mock("@sentry/node", () => ({
  init: jest.fn(),
  setupExpressErrorHandler: jest.fn(),
  nodeProfilingIntegration: jest.fn(),
}));

jest.mock("@sentry/profiling-node", () => ({
  nodeProfilingIntegration: jest.fn(),
}));

describe("Authentication API (Jest + Supertest)", () => {
  beforeAll(async () => {
    // Connection is automatically opened by server.js (connectDB)
    // If not, open it here
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register a user with valid data, return 201, and set a cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe("john@example.com");
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"][0]).toContain("token=");
    });

    it("should return 409 when registering with a duplicate email", async () => {
      // Register first user
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        });

      // Register second user with same email
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "John Duplicate",
          email: "john@example.com",
          password: "password123",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Email already exists");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      // Seed a user for login tests
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "securepassword",
      });
      await user.save();
    });

    it("should login user with correct credentials and set httpOnly cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "securepassword",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe("test@example.com");
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"][0]).toContain("token=");
    });

    it("should return 401 for incorrect password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return 401 if request does not contain token cookie", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return user object if valid token cookie is provided", async () => {
      // First, register a user to get the cookie
      const regRes = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Alice Smith",
          email: "alice@example.com",
          password: "password123",
        });

      const cookie = regRes.headers["set-cookie"];

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe("alice@example.com");
      expect(res.body.user.name).toBe("Alice Smith");
    });
  });
});
