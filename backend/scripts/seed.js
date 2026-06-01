import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Client from "../models/Client.js";
import PlannerCard from "../models/PlannerCard.js";
import Payment from "../models/Payment.js";
import AIGeneration from "../models/AIGeneration.js";
import ContentHistory from "../models/ContentHistory.js";
import CreatorProfile from "../models/CreatorProfile.js";

const seed = async () => {
  try {
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("Connected.");

    // 1. Get or create test user
    let user = await User.findOne({ email: "demo@creatorflow.com" });
    if (!user) {
      console.log("Creating default seed user (demo@creatorflow.com)...");
      user = await User.create({
        name: "Demo Creator",
        email: "demo@creatorflow.com",
        password: "creator123",
        themePreference: "dark"
      });
    }
    const userId = user._id;
    console.log(`Using User ID: ${userId}`);

    // 2. Clear existing records for this user to keep it clean & repeatable
    console.log("🗑 Cleaning old records...");
    await Promise.all([
      CreatorProfile.deleteMany({ userId }),
      Client.deleteMany({ userId }),
      PlannerCard.deleteMany({ userId }),
      Payment.deleteMany({ userId }),
      AIGeneration.deleteMany({ userId }),
      ContentHistory.deleteMany({ userId })
    ]);

    // 3. Seed Creator Profile (needed for AI system prompts)
    console.log("🌱 Seeding Creator Profile...");
    await CreatorProfile.create({
      userId,
      niche: "Tech & AI Engineering",
      targetAudience: "Developers and Founders",
      tone: ["Actionable", "Authentic", "Witty"],
      writingStyle: "Short paragraphs. Zero fluff.",
      contentGoals: "Build authority and drive newsletter signups."
    });

    // 4. Seed 5 Clients
    console.log("🌱 Seeding 5 Brand Clients...");
    const clients = await Client.create([
      { userId, name: "Nike India", niche: "Sports", paymentRate: 50000, notes: "Status: Active" },
      { userId, name: "Boat Lifestyle", niche: "Tech & Audio", paymentRate: 20000, notes: "Status: Pending" },
      { userId, name: "Zomato", niche: "Food Delivery", paymentRate: 35000, notes: "Status: Closed" },
      { userId, name: "Puma", niche: "Fitness Apparel", paymentRate: 40000, notes: "Status: Active" },
      { userId, name: "CRED", niche: "Finance", paymentRate: 60000, notes: "Status: Active" }
    ]);

    // 5. Seed 10 Planner Cards across all 5 stages
    console.log("🌱 Seeding 10 Planner Cards...");
    const now = new Date();
    await PlannerCard.create([
      { userId, title: "10 React Hooks Tricks", platform: "YouTube", status: "Idea", dueDate: new Date(now.getTime() + 86400000 * 3) },
      { userId, title: "SaaS Marketing 101", platform: "LinkedIn", status: "Idea", dueDate: new Date(now.getTime() + 86400000 * 5) },
      { userId, title: "Building an AI Agent from Scratch", platform: "YouTube", status: "Script", dueDate: new Date(now.getTime() + 86400000 * 2) },
      { userId, title: "Day in the Life of a Dev", platform: "Instagram", status: "Script", dueDate: new Date(now.getTime() + 86400000 * 1) },
      { userId, title: "Docker vs Kubernetes Guide", platform: "YouTube", status: "Shoot", dueDate: now },
      { userId, title: "Aesthetic Desk Setup Setup", platform: "TikTok", status: "Shoot", dueDate: now },
      { userId, title: "How to Stop Procrastinating", platform: "Instagram", status: "Edit", dueDate: now },
      { userId, title: "Typescript Advanced Tips", platform: "LinkedIn", status: "Edit", dueDate: now },
      { userId, title: "Puma Collab Reel", platform: "Instagram", status: "Posted", dueDate: new Date(now.getTime() - 86400000 * 2) },
      { userId, title: "CRED Campaign Video", platform: "YouTube", status: "Posted", dueDate: new Date(now.getTime() - 86400000 * 4) }
    ]);

    // 6. Seed 8 Payments (Mix of paid, pending, due)
    console.log("🌱 Seeding 8 Payments...");
    await Payment.create([
      // Paid
      { userId, clientId: clients[0]._id, amount: 50000, dueDate: new Date(now.getTime() - 86400000 * 10), paid: true },
      { userId, clientId: clients[2]._id, amount: 35000, dueDate: new Date(now.getTime() - 86400000 * 5), paid: true },
      { userId, clientId: clients[4]._id, amount: 60000, dueDate: new Date(now.getTime() - 86400000 * 2), paid: true },
      // Pending (unpaid, due in future)
      { userId, clientId: clients[1]._id, amount: 20000, dueDate: new Date(now.getTime() + 86400000 * 4), paid: false },
      { userId, clientId: clients[3]._id, amount: 40000, dueDate: new Date(now.getTime() + 86400000 * 8), paid: false },
      // Due (unpaid, overdue/due in past)
      { userId, clientId: clients[0]._id, amount: 15000, dueDate: new Date(now.getTime() - 86400000 * 1), paid: false },
      { userId, clientId: clients[1]._id, amount: 25000, dueDate: new Date(now.getTime() - 86400000 * 2), paid: false },
      { userId, clientId: clients[2]._id, amount: 30000, dueDate: new Date(now.getTime() - 86400000 * 3), paid: false }
    ]);

    // 7. Seed 15 AI Generations and corresponding ContentHistory
    console.log("🌱 Seeding 15 AI Generations...");
    const aiData = [];
    const histData = [];

    // Distribute content_idea, caption, performance_score
    const types = [
      { type: "content_idea", result: ["AI for dev", "Next.js 14", "Docker basics", "Vitest vs Jest", "MERN stack in 2026"] },
      { type: "caption", result: ["Unlock your flow with AI 🧠", "Consistency is key to growth! 🚀", "Level up your React coding today 💻"] },
      { type: "performance_score", result: { score: 8.5, reasoning: "Great hook, good structure.", fixes: "Add visual callout." } }
    ];

    for (let i = 0; i < 15; i++) {
      const typeObj = types[i % 3];
      const date = new Date(now.getTime() - (14 - i) * 24 * 60 * 60 * 1000); // spread over 14 days

      aiData.push({
        userId,
        topic: `Seed Topic ${i}`,
        type: typeObj.type,
        platform: i % 2 === 0 ? "YouTube" : "Instagram",
        prompt: `Mock prompt structure for seed generation ${i}`,
        result: typeObj.result,
        bookmarked: i % 3 === 0,
        createdAt: date,
        updatedAt: date
      });

      histData.push({
        userId,
        type: typeObj.type === "content_idea" ? "idea" : (typeObj.type === "caption" ? "caption" : "score"),
        input: { topic: `Seed Topic ${i}` },
        output: typeObj.type === "performance_score" 
          ? { overallScore: 8, reason: "Good", fixSuggestion: "None" } 
          : { text: JSON.stringify(typeObj.result) },
        createdAt: date,
        updatedAt: date
      });
    }

    await AIGeneration.create(aiData);
    await ContentHistory.create(histData);

    console.log("🏁 Database seeded successfully!");
    console.log(`💡 You can login as demo@creatorflow.com (password: creator123) to see the dashboard KPIs!`);
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
