import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

// Mock Database Connection
vi.mock("../config/db.js", () => ({
  default: vi.fn().mockImplementation(() => Promise.resolve())
}));

// Mock Sentry
vi.mock("@sentry/node", () => ({
  init: vi.fn(),
  setupExpressErrorHandler: vi.fn(),
  nodeProfilingIntegration: vi.fn(),
}));

// Mock AI Memory Service (system prompt builder) to bypass MongoDB queries
vi.mock("../services/aiMemoryService.js", () => ({
  buildSystemPrompt: vi.fn().mockResolvedValue("You are a mock digital creator.")
}));

// Mock Mongoose models
const mockUserId = "507f1f77bcf86cd799439011";

vi.mock("../models/User.js", () => ({
  default: {
    findById: vi.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439011", name: "Test User" })
  }
}));

vi.mock("../models/AIGeneration.js", () => ({
  default: {
    create: vi.fn().mockImplementation((data) => Promise.resolve({ _id: "507f1f77bcf86cd799439011", ...data }))
  }
}));

vi.mock("../models/ContentHistory.js", () => ({
  default: {
    create: vi.fn().mockResolvedValue({})
  }
}));

// Mock Gemini AI SDK using standard constructible function
vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: function() {
      return {
        getGenerativeModel: vi.fn().mockImplementation(() => {
          return {
            generateContent: vi.fn().mockResolvedValue({
              response: {
                text: () => JSON.stringify(["Idea A", "Idea B"])
              }
            })
          };
        })
      };
    }
  };
});

import app from "../server.js";

// Helper to sign mock JWT
const getMockCookie = () => {
  const token = jwt.sign({ id: mockUserId }, "test-secret-key-12345");
  return `token=${token}`;
};

describe("AI API Routes", () => {
  beforeEach(() => {
    // Set mock env variables required for server start and tests
    process.env.JWT_SECRET = "test-secret-key-12345";
    process.env.GEMINI_API_KEY = "test-gemini-key";
    vi.clearAllMocks();
  });

  describe("POST /api/v1/ai/ideas", () => {
    it("should reject unauthenticated requests", async () => {
      const res = await request(app)
        .post("/api/v1/ai/ideas")
        .send({ niche: "tech", prompt: "ideas" });

      expect(res.status).toBe(401);
    });

    it("should accept valid requests and return ideas list", async () => {
      const res = await request(app)
        .post("/api/v1/ai/ideas")
        .set("Cookie", getMockCookie())
        .send({ niche: "fitness", prompt: "college workouts", count: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.result).toBeDefined();
    });

    it("should fail validation if niche is missing", async () => {
      const res = await request(app)
        .post("/api/v1/ai/ideas")
        .set("Cookie", getMockCookie())
        .send({ prompt: "college workouts" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation failed");
    });
  });

  describe("POST /api/v1/ai/captions", () => {
    it("should return caption options if payload is valid", async () => {
      const res = await request(app)
        .post("/api/v1/ai/captions")
        .set("Cookie", getMockCookie())
        .send({ topic: "React Hooks tips", tone: "funny", count: 3 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should fail if topic is missing", async () => {
      const res = await request(app)
        .post("/api/v1/ai/captions")
        .set("Cookie", getMockCookie())
        .send({ tone: "aesthetic" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation failed");
    });
  });
});
