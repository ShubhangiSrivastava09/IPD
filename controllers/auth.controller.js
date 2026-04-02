import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import RefreshToken from "../models/RefreshToken.js";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const register = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    email = email.toLowerCase().trim();

    const allowedRoles = ["Admin", "Doctor", "Staff"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
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
      message: `${user.role} registered successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Server Error",
    });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "User is blocked by Admin",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hashedToken = hashToken(refreshToken);

    await RefreshToken.deleteMany({ userId: user._id });

    await RefreshToken.create({
      userId: user._id,
      token: hashedToken,
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
    res.status(500).json({
      message: error?.message || "Server Error",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Refresh token required",
      });
    }

    const hashedToken = hashToken(token);

    const storedToken = await RefreshToken.findOne({
      token: hashedToken,
    });

    if (!storedToken) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user || user.isBlocked) {
      return res.status(403).json({
        message: "User invalid or blocked",
      });
    }

    await RefreshToken.deleteOne({ token: hashedToken });

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newHashedToken = hashToken(newRefreshToken);

    await RefreshToken.create({
      userId: user._id,
      token: newHashedToken,
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(403).json({
      message: "Invalid or expired refresh token",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const hashedToken = hashToken(token);

    await RefreshToken.deleteOne({
      token: hashedToken,
      userId: decoded.userId,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Invalid token",
    });
  }
};
