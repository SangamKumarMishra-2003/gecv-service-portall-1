const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  const apps = await db.collection('hostelapplications').find({}).toArray();
  console.log("--- HOSTEL APPLICATIONS ---");
  apps.forEach(a => {
      console.log(`Student: ${a.fullName}, Hostel: ${a.hostelType}, Preference: ${a.roomPreference}, Status: ${a.status}`);
  });
  
  process.exit(0);
}

run().catch(console.error);
