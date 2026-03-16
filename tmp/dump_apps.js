const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  
  const db = mongoose.connection.db;
  const apps = await db.collection('hostelapplications').find({}).toArray();
  
  console.log("Total Records in hostelapplications:", apps.length);
  apps.forEach(p => {
    console.log(`- ID: ${p._id}, Status: ${p.status}, Student: ${p.studentId}, Hostel: ${p.hostelType}, Pref: ${p.roomPreference}, Date: ${p.createdAt}`);
  });
  
  process.exit(0);
}

run().catch(console.error);
