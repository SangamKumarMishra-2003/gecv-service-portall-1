import mongoose, { Schema } from "mongoose";

const HostelerSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roomType: { type: String },
  joinedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Hosteler || mongoose.model("Hosteler", HostelerSchema);
