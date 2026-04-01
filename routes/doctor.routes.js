// routes/doctor.routes.js

import express from "express";
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctor.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Only Admin access
router.use(protect, authorize("Admin"));

router.post("/",protect, authorize("Admin"),  createDoctor);
router.get("/",protect, authorize("Admin"), getDoctors);
router.get("/:id", protect, authorize("Admin", "Doctor"), getDoctorById);
router.put("/:id", protect, authorize("Admin"), updateDoctor);
router.delete("/:id", protect, authorize("Admin"), deleteDoctor);

export default router;
