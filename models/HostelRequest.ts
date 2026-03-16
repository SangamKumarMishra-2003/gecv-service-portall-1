import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IHostelRequest extends Document {
  student: mongoose.Types.ObjectId;
  roomType: string;
  agreementUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

const HostelRequestSchema = new Schema<IHostelRequest>({
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

const HostelRequest = models.HostelRequest || model<IHostelRequest>("HostelRequest", HostelRequestSchema);

export default HostelRequest;
