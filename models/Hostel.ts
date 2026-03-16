import mongoose, { Schema } from "mongoose";

const HostelSchema = new Schema({
  name: { type: String, required: true },
  totalRooms: { type: Number, required: true },
  type: { type: String, enum: ["Boys Hostel", "Girls Hostel"], required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Hostel || mongoose.model("Hostel", HostelSchema);
