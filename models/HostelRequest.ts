import mongoose, { Schema } from "mongoose";

const HostelRequestSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roomType: { type: String, required: true },
  agreementUrl: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.HostelRequest || mongoose.model("HostelRequest", HostelRequestSchema);
