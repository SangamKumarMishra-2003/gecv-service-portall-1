const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  const hostel = await db.collection('hostels').findOne({ name: "hoster boy -1" });
  if (!hostel) {
    console.log("Hostel not found");
    process.exit(1);
  }

  const result = await db.collection('rooms').updateMany(
    { roomNo: "101" },
    { $set: { hostelId: hostel._id } }
  );
  
  console.log("Updated rooms:", result.modifiedCount);
  process.exit(0);
}

run().catch(console.error);
