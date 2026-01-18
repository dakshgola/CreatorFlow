// server.js
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

// Connect DB (will exit if connection fails)
connectDB();

const app = express();

// CORS - Updated for production
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://creator-flow-livid.vercel.app"
      ];
      
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------
// TEST ROUTES
// ---------------------
app.get("/", (req, res) => {
  res.json({ success: true, message: "CreatorFlow API is running!" });
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

// ---- OPTIONAL (delete these if unused) ----
app.use("/api/tasks", projectRoutes);
app.use("/api/payments", projectRoutes);

// ---------------------
// GLOBAL ERROR HANDLER
// ---------------------
app.use((err, req, res, next) => {
  console.error("Error:", err);
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
    message: "Route not found",
  });
});

// ---------------------
// START SERVER
// ---------------------
const PORT = process.env.PORT || 5000;

// Only start server after MongoDB connection is established
// (connectDB() will exit process if connection fails, so if we reach here, DB is connected)
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ MongoDB: Connected`);
  console.log(`✅ Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`✅ Cloudinary: ${process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME.trim() !== '') ? 'Configured' : 'Not configured (optional)'}`);
});