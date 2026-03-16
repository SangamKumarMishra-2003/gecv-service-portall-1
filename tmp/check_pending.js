const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

const HostelApplicationSchema = new mongoose.Schema({
  studentId: mongoose.Types.ObjectId,
  status: String,
  hostelType: String,
  roomPreference: String,
  createdAt: Date
});

const HostelApplication = mongoose.models.HostelApplication || mongoose.model('HostelApplication', HostelApplicationSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  
  const pending = await HostelApplication.find({ status: "Pending" });
  console.log("Total Pending Applications:", pending.length);
  pending.forEach(p => {
    console.log(`- ID: ${p._id}, Student: ${p.studentId}, Type: ${p.hostelType}, Pref: ${p.roomPreference}, Date: ${p.createdAt}`);
  });

  const all = await HostelApplication.find({}).sort({ createdAt: -1 }).limit(10);
  console.log("\nLast 10 Applications (Any Status):");
  all.forEach(p => {
    console.log(`- ID: ${p._id}, Status: ${p.status}, Student: ${p.studentId}, Type: ${p.hostelType}, Pref: ${p.roomPreference}, Date: ${p.createdAt}`);
  });
  
  process.exit(0);
}

run().catch(console.error);
