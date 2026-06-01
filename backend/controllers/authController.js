import User from "../models/User.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing in .env file");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // 7-day expiration
  });
};

const setCookies = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * REGISTER USER
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("Name, email, and password are required", 400));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError("Email already exists", 409));
    }

    // Use constructor + save (avoids next() hook issues)
    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);

    // Save refresh token field in database (kept for schema compatibility)
    user.refreshToken = token;
    await user.save();

    setCookies(res, token);

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
    next(error);
  }
};

/**
 * LOGIN USER
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // Select password manually (since model hides it)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    const validPassword = await user.comparePassword(password);

    if (!validPassword) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = generateToken(user._id);

    user.refreshToken = token;
    await user.save();

    setCookies(res, token);

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
    next(error);
  }
};

/**
 * GET LOGGED IN USER
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

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
    next(error);
  }
};

/**
 * REFRESH TOKEN
 * POST /api/auth/refresh
 */
export const refresh = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies.token;
    
    if (!incomingRefreshToken) {
      return next(new AppError("No token provided", 401));
    }

    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== incomingRefreshToken) {
      return next(new AppError("Invalid token", 401));
    }

    const token = generateToken(user._id);
    
    user.refreshToken = token;
    await user.save();

    setCookies(res, token);

    res.json({ success: true, message: "Token refreshed" });
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
};

/**
 * LOGOUT USER
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies.token;
    if (incomingRefreshToken) {
      const decoded = jwt.decode(incomingRefreshToken);
      if (decoded && decoded.id) {
        await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: 1 } });
      }
    }

    res.clearCookie("token");
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
