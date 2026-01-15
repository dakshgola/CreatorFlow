import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route   GET /api/auth/test
 * @desc    Test route to confirm auth router works
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working 🚀",
  });
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   GET /api/auth/me
 * @desc    Get logged in user info
 * @access  Private
 */
router.get("/me", protect, getMe);

/**
 * @route   PUT /api/auth/me
 * @desc    Update user profile
 * @access  Private
 */
router.put("/me", protect, async (req, res) => {
  try {
    const { name, email, themePreference } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (themePreference) updateData.themePreference = themePreference;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   PUT /api/auth/theme
 * @desc    Update theme preference
 * @access  Private
 */
router.put("/theme", protect, async (req, res) => {
  try {
    const { themePreference } = req.body;

    if (!["light", "dark", "system"].includes(themePreference)) {
      return res.status(400).json({
        success: false,
        message: "Invalid theme. Must be 'light', 'dark', or 'system'",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { themePreference },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      themePreference: user.themePreference,
    });
  } catch (error) {
    console.error("Theme update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
