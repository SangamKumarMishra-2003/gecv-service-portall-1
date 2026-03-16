const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

const RoomSchema = new mongoose.Schema({
  roomNo: String,
  capacity: Number,
  beds: [Object],
  inventory: {
    tables: [Object],
    chairs: [Object]
  }
});

const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  
  const rooms = await Room.find({});
  console.log(`Analyzing ${rooms.length} rooms for inventory...`);
  
  for (const room of rooms) {
    let updated = false;
    const targetCount = room.capacity || 1;

    if (!room.inventory) {
      room.inventory = { tables: [], chairs: [] };
      updated = true;
    }

    if (room.inventory.tables.length === 0) {
      console.log(`Initializing ${targetCount} tables for room ${room.roomNo}`);
      room.inventory.tables = Array.from({ length: targetCount }, (_, i) => ({
        serialNo: `T-${room.roomNo}-${i + 1}`,
        condition: "Good"
      }));
      updated = true;
    }

    if (room.inventory.chairs.length === 0) {
      console.log(`Initializing ${targetCount} chairs for room ${room.roomNo}`);
      room.inventory.chairs = Array.from({ length: targetCount }, (_, i) => ({
        serialNo: `C-${room.roomNo}-${i + 1}`,
        condition: "Good"
      }));
      updated = true;
    }
    
    if (updated) {
      room.markModified('inventory'); // Ensure mongoose detects changes in nested objects
      await room.save();
      console.log(`Finalized room ${room.roomNo}`);
    }
  }
  
  console.log("Inventory sync complete");
  process.exit(0);
}

run().catch(console.error);
