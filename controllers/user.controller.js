// for Admin only
import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔹 Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 🔹 Check duplicate email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // 🔹 Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // 🔹 Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// GET USERS (Pagination + Filters)
export const getUsers = async (req, res) => {
  const { page = 1, limit = 10, role, email, search } = req.query;

  const filter = {};

  if (role) filter.role = role;

  if (email) {
    filter.email = { $regex: email, $options: "i" };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("-password")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    limit: Number(limit),
    users,
  });
};

// GET SINGLE USER
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ success: true, user });
};

// UPDATE USER
export const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    success: true,
    user,
  });
};

// DELETE USER
export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
};

// BLOCK / UNBLOCK USER
export const toggleBlockUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
  });
};
