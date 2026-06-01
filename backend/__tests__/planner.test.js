import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../server.js";
import User from "../models/User.js";
import PlannerCard from "../models/PlannerCard.js";

// Mock Sentry to prevent loading background Sentry tasks
jest.mock("@sentry/node", () => ({
  init: jest.fn(),
  setupExpressErrorHandler: jest.fn(),
  nodeProfilingIntegration: jest.fn(),
}));

jest.mock("@sentry/profiling-node", () => ({
  nodeProfilingIntegration: jest.fn(),
}));

describe("Planner/Kanban API Scoping (Jest + Supertest)", () => {
  let userA, userB;
  let cookieA, cookieB;
  let cardA, cardB;

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
    await PlannerCard.deleteMany({});

    // Create User A
    userA = new User({
      name: "User A",
      email: "usera@example.com",
      password: "password123",
    });
    await userA.save();

    // Create User B
    userB = new User({
      name: "User B",
      email: "userb@example.com",
      password: "password123",
    });
    await userB.save();

    // Generate cookies
    cookieA = `token=${jwt.sign({ id: userA._id.toString() }, process.env.JWT_SECRET || "test-secret-key-12345")}`;
    cookieB = `token=${jwt.sign({ id: userB._id.toString() }, process.env.JWT_SECRET || "test-secret-key-12345")}`;

    // Create Card A
    cardA = new PlannerCard({
      userId: userA._id,
      title: "Card for User A",
      description: "Description A",
      platform: "Instagram",
      status: "Idea",
    });
    await cardA.save();

    // Create Card B
    cardB = new PlannerCard({
      userId: userB._id,
      title: "Card for User B",
      description: "Description B",
      platform: "YouTube",
      status: "Idea",
    });
    await cardB.save();
  });

  it("should return only cards belonging to the authenticated user", async () => {
    const res = await request(app)
      .get("/api/v1/planner")
      .set("Cookie", cookieA);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // The getPlannerCards route returns grouped cards by status, e.g. { Idea: [...], Script: [...] }
    const grouped = res.body.data;
    expect(grouped.Idea).toBeDefined();
    
    // Find cardA in grouped Idea cards
    const hasCardA = grouped.Idea.some(card => card._id.toString() === cardA._id.toString());
    expect(hasCardA).toBe(true);

    // Card B should not be in the response
    const hasCardB = Object.values(grouped).flat().some(card => card._id.toString() === cardB._id.toString());
    expect(hasCardB).toBe(false);
  });

  it("should update card status correctly when owned by authenticated user", async () => {
    const res = await request(app)
      .patch(`/api/v1/planner/${cardA._id}`)
      .set("Cookie", cookieA)
      .send({ status: "Script" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("Script");

    // Verify in DB
    const updatedCard = await PlannerCard.findById(cardA._id);
    expect(updatedCard.status).toBe("Script");
  });

  it("should prevent User A from updating User B's cards", async () => {
    const res = await request(app)
      .patch(`/api/v1/planner/${cardB._id}`)
      .set("Cookie", cookieA)
      .send({ status: "Shoot" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Not authorized to update this card");

    // Verify card was not updated in DB
    const dbCardB = await PlannerCard.findById(cardB._id);
    expect(dbCardB.status).toBe("Idea");
  });

  it("should prevent User A from deleting User B's cards", async () => {
    const res = await request(app)
      .delete(`/api/v1/planner/${cardB._id}`)
      .set("Cookie", cookieA);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Not authorized to delete this card");

    // Verify card still exists in DB
    const dbCardB = await PlannerCard.findById(cardB._id);
    expect(dbCardB).toBeDefined();
  });
});
