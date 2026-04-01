import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    token: String,
  },
  { timestamps: true },
);

export default mongoose.model("RefreshToken", refreshTokenSchema);
