import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../server.js";
import User from "../models/User.js";
import AIGeneration from "../models/AIGeneration.js";

// Mock Sentry to prevent loading background Sentry tasks
jest.mock("@sentry/node", () => ({
  init: jest.fn(),
  setupExpressErrorHandler: jest.fn(),
  nodeProfilingIntegration: jest.fn(),
}));

jest.mock("@sentry/profiling-node", () => ({
  nodeProfilingIntegration: jest.fn(),
}));

// Mock the Gemini AI SDK
jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          return {
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn().mockReturnValue(JSON.stringify({
                  title: ["Title 1", "Title 2"],
                  hook: ["Hook 1"],
                  scriptOutline: [],
                  captions: [],
                  hashtags: [],
                })),
              },
            }),
          };
        }),
      };
    }),
  };
});

describe("AI API (Jest + Supertest)", () => {
  let user;
  let tokenCookie;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await AIGeneration.deleteMany({});

    // Create a mock user
    user = new User({
      name: "Test User",
      email: "test@example.com",
      password: "securepassword",
    });
    await user.save();

    // Generate JWT cookie
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || "test-secret-key-12345");
    tokenCookie = `token=${token}`;
  });

  it("should return 401 for generate request without auth", async () => {
    const res = await request(app)
      .post("/api/v1/ai/generate")
      .send({
        topic: "React Hooks",
        type: "ideas",
        platform: "LinkedIn",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should generate content with valid body and return 200 with result", async () => {
    const res = await request(app)
      .post("/api/v1/ai/generate")
      .set("Cookie", tokenCookie)
      .send({
        topic: "React Hooks",
        type: "ideas",
        platform: "LinkedIn",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.topic).toBe("React Hooks");
    expect(res.body.data.platform).toBe("LinkedIn");
    expect(res.body.data.result).toBeDefined();
  });

  it("should return 400 when missing type field in body", async () => {
    const res = await request(app)
      .post("/api/v1/ai/generate")
      .set("Cookie", tokenCookie)
      .send({
        topic: "React Hooks",
        platform: "LinkedIn",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });
});
