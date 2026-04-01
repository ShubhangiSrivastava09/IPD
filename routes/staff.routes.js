// routes/staff.routes.js

import express from "express";
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../controllers/staff.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin only
router.use(protect, authorize("Admin"));

router.post("/", createStaff);
router.get("/", getStaff);
router.get("/:id", getStaffById);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

export default router;
