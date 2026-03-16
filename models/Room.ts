import mongoose, { Schema } from "mongoose";

const RoomSchema = new Schema({
  roomNo: { type: String, required: true, unique: true },
  floor: { type: String, required: true },
  capacity: { type: Number, default: 3 },
  occupied: { type: Number, default: 0 },
  status: { type: String, enum: ["Available", "Full", "Maintenance"], default: "Available" },
  hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
  hostelBlock: { type: String, default: "A" },
  beds: [{
    bedNo: { type: String, required: true },
    isOccupied: { type: Boolean, default: false }
  }],
  inventory: {
    tables: [{
      serialNo: { type: String },
      condition: { type: String, default: "Good" }
    }],
    chairs: [{
      serialNo: { type: String },
      condition: { type: String, default: "Good" }
    }]
  }
});

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);
