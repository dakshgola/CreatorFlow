import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock the Database Connection to avoid actual database calls
vi.mock("../config/db.js", () => ({
  default: vi.fn().mockImplementation(() => Promise.resolve())
}));

// Mock Sentry to prevent loading background Sentry tasks
vi.mock("@sentry/node", () => ({
  init: vi.fn(),
  setupExpressErrorHandler: vi.fn(),
  nodeProfilingIntegration: vi.fn(),
}));

import app from "../server.js";

describe("Authentication API Routes", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should return 400 validation error if body is empty", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Validation failed");
    });

    it("should fail validation if password is too short", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "123"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation failed");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should return 400 validation error if fields are missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation failed");
    });
  });

  describe("DELETE /api/v1/auth/logout", () => {
    it("should clear cookie and logout user", async () => {
      const res = await request(app)
        .delete("/api/v1/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers["set-cookie"]).toBeDefined();
    });
  });
});
