const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  const studentId = "69b4520afb4f11f14e7400bd";
  const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(studentId) });
  
  console.log("Student User Details:", JSON.stringify(user, null, 2));
  
  process.exit(0);
}

run().catch(console.error);
