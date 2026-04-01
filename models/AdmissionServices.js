// models/AdmissionService.js

import mongoose from "mongoose";

const admissionServiceSchema = new mongoose.Schema(
  {
    admissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admission",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceMaster",
      required: true,
    },
    serviceName: String, // snapshot
    rate: Number, // snapshot
    qty: {
      type: Number,
      required: true,
      min: [1, "Quantity must be > 0"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// prevent duplicate service per admission
admissionServiceSchema.index(
  { admissionId: 1, serviceId: 1 },
  { unique: true },
);

export default mongoose.model("AdmissionService", admissionServiceSchema);
