import mongoose, { Schema } from "mongoose";

const HostelerSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: "Room",
  },
  bedNo: { type: String },
  roomType: { type: String },
  joinedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Hosteler || mongoose.model("Hosteler", HostelerSchema);
