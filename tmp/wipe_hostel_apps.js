const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  const count = await db.collection('hostelapplications').countDocuments();
  console.log(`Current application count: ${count}`);

  if (count > 0) {
      const result = await db.collection('hostelapplications').deleteMany({});
      console.log(`Deleted ${result.deletedCount} hostel applications.`);
  } else {
      console.log("No applications found to delete.");
  }
  
  process.exit(0);
}

run().catch(console.error);
