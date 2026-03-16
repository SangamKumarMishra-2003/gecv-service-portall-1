const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  const hostels = await db.collection('hostels').find({}).toArray();
  const rooms = await db.collection('rooms').find({}).toArray();
  const apps = await db.collection('hostelapplications').find({ status: "Pending" }).toArray();

  console.log("--- HOSTELS ---");
  console.log(JSON.stringify(hostels, null, 2));
  
  console.log("\n--- ROOMS ---");
  console.log(JSON.stringify(rooms, null, 2));

  console.log("\n--- PENDING APPLICATIONS ---");
  console.log(JSON.stringify(apps.map(a => ({ _id: a._id, name: a.fullName, studentId: a.studentId })), null, 2));
  
  process.exit(0);
}

run().catch(console.error);
