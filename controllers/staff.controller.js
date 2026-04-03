// controllers/staff.controller.js

import Staff from "../models/Staff.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// CREATE STAFF
export const createStaff = async (req, res) => {
  try {
    const { name, email, department } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({
        message: "Name, email and department are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    const rawPassword = `Staff#${name.split(" ")[0].toLowerCase()}`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await User.create({
      name,
      email,
      password: rawPassword,
      role: "Staff",
    });

    const staff = await Staff.create({
      name,
      email,
      department,
      userId: user._id,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: staff,
      credentials: {
        email,
        password: rawPassword,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const filter = {};

    // 🔍 Search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    // 🎯 Filter
    if (department) {
      filter.department = department;
    }

    const total = await Staff.countDocuments(filter);

    const staff = await Staff.find(filter)
      .populate("userId", "-password")
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limitNumber),
        currentPage: pageNumber,
        limit: limitNumber,
      },
      data: staff,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getStaffById = async (req, res) => {
  const staff = await Staff.findById(req.params.id).populate(
    "userId",
    "-password",
  );

  if (!staff) {
    return res.status(404).json({ message: "Staff not found" });
  }

  res.status(200).json({
    success: true,
    data: staff,
  });
};

export const updateStaff = async (req, res) => {
  const { name, email, department } = req.body;

  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return res.status(404).json({ message: "Staff not found" });
  }

  staff.name = name || staff.name;
  staff.email = email || staff.email;
  staff.department = department || staff.department;
  staff.updatedBy = req.user.userId;

  await staff.save();

  // Sync user
  await User.findByIdAndUpdate(staff.userId, {
    name: staff.name,
    email: staff.email,
  });

  res.status(200).json({
    success: true,
    message: "Staff updated successfully",
    data: staff,
  });
};

export const deleteStaff = async (req, res) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return res.status(404).json({ message: "Staff not found" });
  }

  await User.findByIdAndDelete(staff.userId);
  await staff.deleteOne();

  res.status(200).json({
    success: true,
    message: "Staff deleted successfully",
  });
};
