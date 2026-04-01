// routes/serviceMaster.routes.js

import express from "express";
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/services.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin only
router.use(protect, authorize("Admin"));

router.post("/", createService);
router.get("/", getServices);
router.get("/:id", getServiceById);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
