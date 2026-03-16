const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

// Use same schemas as models
const HostelerSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  bedNo: { type: String },
  roomType: { type: String },
  joinedAt: { type: Date, default: Date.now },
});

const RoomSchema = new mongoose.Schema({
  roomNo: { type: String, required: true },
  floor: { type: String, required: true },
  capacity: { type: Number, default: 3 },
  occupied: { type: Number, default: 0 },
  status: { type: String, enum: ["Available", "Full", "Maintenance"], default: "Available" },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", required: true },
  beds: [{ bedNo: { type: String, required: true }, isOccupied: { type: Boolean, default: false } }],
});

const Hosteler = mongoose.models.Hosteler || mongoose.model("Hosteler", HostelerSchema);
const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  
  const studentId = "69b4520afb4f11f14e7400bd";
  const roomId = "69b77daccde9e7415d2d7915";
  const bedNo = "101-1";

  try {
    console.log("Attempting to create Hosteler record...");
    const hosteler = await Hosteler.create({
      student: studentId,
      room: roomId,
      bedNo,
      joinedAt: new Date()
    });
    console.log("Hosteler created successfully:", hosteler._id);

    console.log("Updating Room occupancy...");
    const room = await Room.findById(roomId);
    const bed = room.beds.find(b => b.bedNo === bedNo);
    if (bed) {
      bed.isOccupied = true;
      room.occupied = (room.occupied || 0) + 1;
      if (room.occupied >= room.capacity) room.status = "Full";
      await room.save();
      console.log("Room updated successfully.");
    }

  } catch (err) {
    console.error("CAPTURE ERROR:", err);
  }
  
  process.exit(0);
}

run().catch(console.error);
