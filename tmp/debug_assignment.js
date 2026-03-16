const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  const studentId = "69b4520afb4f11f14e7400bd"; // Student User
  const hosteler = await db.collection('hostelers').findOne({ student: new mongoose.Types.ObjectId(studentId) });
  const room101 = await db.collection('rooms').findOne({ roomNo: "101" });

  console.log("--- ASSIGNMENT DEBUG ---");
  console.log("Existing Hosteler record for student:", hosteler ? "FOUND" : "NOT FOUND");
  if (hosteler) console.log(JSON.stringify(hosteler, null, 2));
  
  console.log("\nRoom 101 occupied count:", room101.occupied);
  console.log("Room 101 beds status:", JSON.stringify(room101.beds, null, 2));
  
  process.exit(0);
}

run().catch(console.error);
