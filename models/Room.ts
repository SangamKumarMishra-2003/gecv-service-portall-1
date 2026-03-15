import mongoose, { Schema } from "mongoose";

const RoomSchema = new Schema({
  roomNo: { type: String, required: true, unique: true },
  floor: { type: String, required: true },
  capacity: { type: Number, default: 3 },
  occupied: { type: Number, default: 0 },
  status: { type: String, enum: ["Available", "Full", "Maintenance"], default: "Available" },
  hostelBlock: { type: String, default: "A" }
});

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);
