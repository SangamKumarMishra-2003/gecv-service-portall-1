const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  const rooms = await db.collection('rooms').countDocuments();
  const hostelers = await db.collection('hostelers').countDocuments();
  const hostels = await db.collection('hostels').countDocuments();
  const applications = await db.collection('hostelapplications').countDocuments();

  console.log("Current Data Stats:");
  console.log("- Rooms:", rooms);
  console.log("- Hostelers (Assignments):", hostelers);
  console.log("- Hostels:", hostels);
  console.log("- Hostel Applications:", applications);
  
  process.exit(0);
}

run().catch(console.error);
