import express from "express";
import {
  createAdmission,
  deleteAdmission,
  getAdmission,
  getAdmissions,
  updateAdmission,
} from "../controllers/admission.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("Staff", "Admin"),
  createAdmission
);

router.get(
  "/",
  protect,
  authorize("Admin", "Doctor", "Staff"),
  getAdmissions
);

router.get("/:id", protect, getAdmission);

router.put(
  "/:id",
  protect,
  authorize("Admin", "Staff"),
  updateAdmission
);

router.delete("/:id", protect, authorize("Admin"), deleteAdmission);

export default router;
