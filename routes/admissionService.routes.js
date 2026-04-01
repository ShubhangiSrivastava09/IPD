// routes/admissionService.routes.js
import express from "express";

import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  addServicesToAdmission,
  deleteAdmissionService,
  getAdmissionServices,
  updateAdmissionService,
} from "../controllers/admissionService.controller.js";

const router = express.Router();

router.post("/", protect, authorize("Doctor", "Admin"), addServicesToAdmission);

router.get(
  "/:admissionId",
  protect,
  authorize("Admin", "Doctor", "Staff"),
  getAdmissionServices,
);

router.put("/:id", protect, authorize("Admin"), updateAdmissionService);

router.delete("/:id", protect, authorize("Admin"), deleteAdmissionService);
