const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  const room = await db.collection('rooms').findOne({ roomNo: "101" });
  if (!room) {
    console.log("Room 101 not found");
    process.exit(1);
  }

  const capacity = room.capacity || 1;
  const roomNo = room.roomNo;

  const beds = Array.from({ length: capacity }, (_, i) => ({
    bedNo: `${roomNo}-${i + 1}`,
    isOccupied: false
  }));

  const inventory = {
    tables: Array.from({ length: capacity }, (_, i) => ({
      serialNo: `T-${roomNo}-${i + 1}`,
      condition: "Good"
    })),
    chairs: Array.from({ length: capacity }, (_, i) => ({
      serialNo: `C-${roomNo}-${i + 1}`,
      condition: "Good"
    }))
  };

  const result = await db.collection('rooms').updateOne(
    { _id: room._id },
    { $set: { beds, inventory } }
  );
  
  console.log("Updated Room 101 with beds and inventory:", result.modifiedCount);
  process.exit(0);
}

run().catch(console.error);
