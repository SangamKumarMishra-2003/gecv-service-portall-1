const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

const RoomSchema = new mongoose.Schema({
  roomNo: String,
  capacity: Number,
  beds: [Object],
  inventory: Object
});

const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  
  const room = await Room.findOne({ roomNo: "c01" });
  console.log("Room c01 Data:");
  console.log(JSON.stringify(room, null, 2));
  
  process.exit(0);
}

run().catch(console.error);
