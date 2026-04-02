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
router.use(protect);

router.post("/",authorize("Admin"), createService);
router.get("/", getServices);
router.get("/:id",authorize("Admin"), getServiceById);
router.put("/:id",authorize("Admin"), updateService);
router.delete("/:id", authorize("Admin"), deleteService);

export default router;
