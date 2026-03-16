import mongoose, { Schema } from "mongoose";

const HostelFeeSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ["Cash", "UPI", "Net Banking", "Card"], required: true },
  paymentDate: { type: Date, default: Date.now },
  transactionId: { type: String },
  status: { type: String, enum: ["Paid", "Pending", "Failed"], default: "Paid" },
  remarks: { type: String }
});

export default mongoose.models.HostelFee || mongoose.model("HostelFee", HostelFeeSchema);
