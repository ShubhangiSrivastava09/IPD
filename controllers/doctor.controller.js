// controllers/doctor.controller.js

import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Helper to extract first name
const getFirstName = (name) => name.split(" ")[0].toLowerCase();

// CREATE DOCTOR
export const createDoctor = async (req, res) => {
  const { name, email, specialization } = req.body;

  // check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const firstName = getFirstName(name);

  // generate password
  const rawPassword = `Doctor#${firstName}`;

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "Doctor",
  });

  // create doctor profile
  const doctor = await Doctor.create({
    name,
    email,
    specialization,
    userId: user._id,
    createdBy: req.user.userId,
  });

  res.status(201).json({
    success: true,
    message: "Doctor created successfully",
    doctor,
    credentials: {
      email,
      password: rawPassword, // send once
    },
  });
};

export const getDoctors = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const filter = {};

  // 🔍 Search
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
    ];
  }

  const total = await Doctor.countDocuments(filter);

  const doctors = await Doctor.find(filter)
    .populate("userId", "-password")
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
    .sort({ createdAt: -1 });

  // ✅ Pagination metadata
  const totalPages = Math.ceil(total / limitNumber);

  res.status(200).json({
    success: true,
    pagination: {
      totalRecords: total,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    },
    data: doctors,
  });
};

export const getDoctorById = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate(
    "userId",
    "-password",
  );

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  res.status(200).json({ success: true, doctor });
};

export const updateDoctor = async (req, res) => {
  const { name, email, specialization } = req.body;

  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  // update doctor
  doctor.name = name || doctor.name;
  doctor.email = email || doctor.email;
  doctor.specialization = specialization || doctor.specialization;
  doctor.updatedBy = req.user.userId;

  await doctor.save();

  // sync user
  await User.findByIdAndUpdate(doctor.userId, {
    name: doctor.name,
    email: doctor.email,
  });

  res.status(200).json({
    success: true,
    doctor,
  });
};

export const deleteDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  // delete linked user
  await User.findByIdAndDelete(doctor.userId);

  // delete doctor
  await doctor.deleteOne();

  res.status(200).json({
    success: true,
    message: "Doctor deleted successfully",
  });
};
