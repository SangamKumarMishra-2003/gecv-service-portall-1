const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  const appId = "69b6e5ae9d45930e5a6d6f60";
  const studentId = "69b4520afb4f11f14e7400bd";

  // 1. Revert Application to Pending
  const appResult = await db.collection('hostelapplications').updateOne(
    { _id: new mongoose.Types.ObjectId(appId) },
    { $set: { status: "Pending" }, $unset: { approvedAt: "", approvedBy: "" } }
  );
  console.log("Reverted application to Pending:", appResult.modifiedCount);

  // 2. Delete stale Hosteler record
  const hostelerResult = await db.collection('hostelers').deleteMany({ student: new mongoose.Types.ObjectId(studentId) });
  console.log("Deleted stale hosteler records:", hostelerResult.deletedCount);
  
  process.exit(0);
}

run().catch(console.error);
