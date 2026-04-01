// models/ServiceMaster.js

import mongoose from "mongoose";

const servicesSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: [true, "Service name is required"],
      unique: true,
      trim: true,
    },
    rate: {
      type: Number,
      required: true,
      min: [1, "Rate must be greater than 0"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Services", servicesSchema);
