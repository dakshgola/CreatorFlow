import "./config/env.js"; // Initialize env variables first
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// ROUTES
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";
import mediaRoutes from "./routes/media.js";
import aiRoutes from "./routes/ai.js";
import analyticsRoutes from "./routes/analytics.js";
import historyRoutes from "./routes/history.js";
import projectRoutes from "./routes/projects.js";
import profileRoutes from "./routes/profile.js";
import trendRoutes from "./routes/trends.js";
import multiplierRoutes from "./routes/multiplier.js";
import viralityRoutes from "./routes/virality.js";
import competitorRoutes from "./routes/competitor.js";
import creatorAnalyticsRoutes from "./routes/creatorAnalytics.js";
import agentRoutes from "./routes/agent.js";
import plannerRoutes from "./routes/planner.js";
import taskRoutes from "./routes/tasks.js";
import paymentRoutes from "./routes/payments.js";

// Validate critical environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is required but not set in .env');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is required but not set in .env');
  process.exit(1);
}

// Connect DB
connectDB();

const app = express();

// Trust proxy for correct rate limiting behind Vercel/Render reverse proxies
app.set("trust proxy", 1);

// Initialize Sentry early
Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
});

Sentry.setupExpressErrorHandler(app);

// Security Headers
app.use(helmet());

// Logging
app.use(morgan("dev"));

// Cookie Parser
app.use(cookieParser());

// Allowed origins list (Strict CORS)
const allowedOrigins = process.env.NODE_ENV === "production" 
  ? [process.env.FRONTEND_URL || process.env.CLIENT_URL || "https://creator-flow-livid.vercel.app"]
  : [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      return callback(new Error(`CORS policy does not allow origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- RATE LIMITING ---
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 min
  message: "Too many auth attempts"
});

// Note: AI routes get strict limits in the router directly (per userId), but we apply general limits here
app.use("/api/", generalLimiter);
app.use("/api/v1/auth/", authLimiter);

// ---------------------
// HEALTH CHECK ROUTES
// ---------------------
app.get("/health", (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get("/api/v1/health", (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Backward compatibility (optional)
app.get("/api/health", (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ---------------------
// API ROUTES (VERSIONED)
// ---------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/history", historyRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/trends", trendRoutes);
app.use("/api/v1/multiplier", multiplierRoutes);
app.use("/api/v1/virality", viralityRoutes);
app.use("/api/v1/competitors", competitorRoutes);
app.use("/api/v1/creator-analytics", creatorAnalyticsRoutes);
app.use("/api/v1/agents", agentRoutes);
app.use("/api/v1/planner", plannerRoutes);

app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/payments", paymentRoutes);

// ---------------------
// GLOBAL ERROR HANDLER
// ---------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ---------------------
// 404 HANDLER
// ---------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------------------
// START SERVER
// ---------------------
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ MongoDB: Connected`);
    console.log(`✅ Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
    console.log(`✅ Cloudinary: ${process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Not configured (optional)'}`);
    console.log(`✅ Allowed CORS Origins: ${allowedOrigins.join(', ')} + *.vercel.app`);
  });
}

export default app;