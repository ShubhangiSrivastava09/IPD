import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import RefreshToken from "../models/RefreshToken.js";


export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 🚨 BLOCK CHECK
    if (user.isBlocked) {
      return res.status(403).json({
        message: "User is blocked by admin",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // optional: delete old tokens (rotation)
    await RefreshToken.deleteMany({ userId: user._id });

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
    });

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error?.message ||"Server Error" });
  }
};

//
// REFRESH TOKEN
//
export const refreshAccessToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Refresh token required",
      });
    }

    const stored = await RefreshToken.findOne({ token });

    if (!stored) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "User is blocked",
      });
    }

    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(403).json({
      message: "Invalid or expired refresh token",
    });
  }
};

//
// LOGOUT (VERY IMPORTANT)
//
export const logout = async (req, res) => {
  try {
    const { token } = req.body;

    await RefreshToken.deleteOne({ token });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
