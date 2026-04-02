import express from "express";

import { protect, authorize } from "../middleware/auth.middleware.js";
import { getAdminDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize( "Admin"),
  getAdminDashboard
);

export default router;