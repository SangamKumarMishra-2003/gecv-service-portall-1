const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  console.log("Starting Data Cleanup...");

  // 1. Delete all rooms
  const roomResult = await db.collection('rooms').deleteMany({});
  console.log("- Deleted Rooms:", roomResult.deletedCount);

  // 2. Delete all hosteler assignments
  const hostelerResult = await db.collection('hostelers').deleteMany({});
  console.log("- Deleted Hostelers:", hostelerResult.deletedCount);

  // 3. Reset all hostel applications to Pending (since their room assignments are now invalid)
  const appResult = await db.collection('hostelapplications').updateMany(
    {},
    { $set: { status: "Pending" }, $unset: { roomNo: "", bedNo: "", approvedAt: "", approvedBy: "" } }
  );
  console.log("- Reset Hostel Applications to Pending:", appResult.modifiedCount);

  console.log("Cleanup Completed Successfully.");
  process.exit(0);
}

run().catch(console.error);
