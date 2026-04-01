// routes/admin.routes.js

import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleBlockUser,
} from "../controllers/user.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Only ADMIN access
router.use(protect, authorize("Admin"));

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/block/:id", toggleBlockUser);

export default router;
