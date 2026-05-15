import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_SECRET or JWT_REFRESH_SECRET missing in .env file");
  }

  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m", // Short lived access token
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d", // Longer lived refresh token
  });

  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.cookie("jwt", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15m
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7d
};

/**
 * REGISTER USER
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });

    // Use constructor + save (avoids next() hook issues)
    const user = new User({ name, email, password });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    setCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

/**
 * LOGIN USER
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Select password manually (since model hides it)
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    const validPassword = await user.comparePassword(password);

    if (!validPassword)
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setCookies(res, accessToken, refreshToken);

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/**
 * GET LOGGED IN USER
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    return res.json({
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
    console.error("GET USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error fetching user",
    });
  }
};

/**
 * REFRESH TOKEN
 * POST /api/auth/refresh
 */
export const refresh = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;
    
    if (!incomingRefreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    
    user.refreshToken = refreshToken;
    await user.save();

    setCookies(res, accessToken, refreshToken);

    res.json({ success: true, message: "Token refreshed" });
  } catch (error) {
    console.error("REFRESH ERROR:", error);
    res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
};

/**
 * LOGOUT USER
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;
    if (incomingRefreshToken) {
      const decoded = jwt.decode(incomingRefreshToken);
      if (decoded && decoded.id) {
        await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: 1 } });
      }
    }

    res.clearCookie("jwt");
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error during logout" });
  }
};
