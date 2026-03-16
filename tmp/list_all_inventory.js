const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  const rooms = await db.collection('rooms').find({}).toArray();
  console.log("--- ALL ROOMS ---");
  rooms.forEach(r => {
      console.log(`Room: ${r.roomNo}, Beds: ${r.beds?.length || 0}, Tables: ${r.inventory?.tables?.length || 0}, Chairs: ${r.inventory?.chairs?.length || 0}`);
  });
  
  process.exit(0);
}

run().catch(console.error);
