// routes/billing.routes.js

import express from "express";
import { getBill, downloadBill } from "../controllers/billing.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// View bill → Doctor + Admin
router.get("/:admissionId", protect, authorize("Admin", "Doctor", "Staff"), getBill);

// Download PDF → Admin only
router.get(
  "/pdf/:admissionId",
  protect,
  authorize("Admin", "Staff"),
  downloadBill,
);

export default router;
