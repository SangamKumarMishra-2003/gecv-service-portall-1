const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  const room = await db.collection('rooms').findOne({ roomNo: "101" });
  console.log("--- ACTUAL DB RECORD FOR ROOM 101 ---");
  console.log(JSON.stringify(room, null, 2));
  
  process.exit(0);
}

run().catch(console.error);
