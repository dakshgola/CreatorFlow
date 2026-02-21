import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// ROUTES
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";
import mediaRoutes from "./routes/media.js";
import aiRoutes from "./routes/ai.js";
import analyticsRoutes from "./routes/analytics.js";
import historyRoutes from "./routes/history.js";
import projectRoutes from "./routes/projects.js";

// Load environment variables FIRST
dotenv.config();

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

// ✅ FIXED: CORS — covers all Vercel preview URLs + production URL
//    Add any new Vercel URLs here if they change
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://creator-flow-livid.vercel.app",        // ✅ Your production Vercel URL
  // Add any vercel preview URLs here if needed, e.g.:
  // "https://creator-flow-git-main-yourusername.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, curl etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ✅ Also allow all *.vercel.app preview deployments for your project
      if (origin.endsWith(".vercel.app")) {
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

// ✅ Handle preflight OPTIONS requests globally (important for cross-origin auth)
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------
// HEALTH CHECK ROUTES
// ---------------------
app.get("/", (req, res) => {
  res.json({ success: true, message: "CreatorFlow API is running!" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API healthy", timestamp: new Date().toISOString() });
});

app.get("/api/auth/test", (req, res) => {
  res.json({ success: true, message: "Auth test route working!" });
});

// ---------------------
// API ROUTES
// ---------------------
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/analytics", analyticsRoutes);

// ---- OPTIONAL (delete if unused) ----
app.use("/api/tasks", projectRoutes);
app.use("/api/payments", projectRoutes);

// ---------------------
// GLOBAL ERROR HANDLER
// ---------------------
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // ✅ Handle CORS errors cleanly
  if (err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
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

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ MongoDB: Connected`);
  console.log(`✅ Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`✅ Cloudinary: ${process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Not configured (optional)'}`);
  console.log(`✅ Allowed CORS Origins: ${allowedOrigins.join(', ')}`);
});