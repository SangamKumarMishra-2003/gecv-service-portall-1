const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

const HostelRequestSchema = new mongoose.Schema({
  student: mongoose.Types.ObjectId,
  status: String,
  roomType: String,
  createdAt: Date
});

const HostelRequest = mongoose.models.HostelRequest || mongoose.model('HostelRequest', HostelRequestSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  
  const pending = await HostelRequest.find({ status: "pending" });
  console.log("Total Pending HostelRequests:", pending.length);
  pending.forEach(p => {
    console.log(`- ID: ${p._id}, Student: ${p.student}, Type: ${p.roomType}, Date: ${p.createdAt}`);
  });

  const all = await HostelRequest.find({}).sort({ createdAt: -1 }).limit(10);
  console.log("\nLast 10 HostelRequests (Any Status):");
  all.forEach(p => {
    console.log(`- ID: ${p._id}, Status: ${p.status}, Student: ${p.student}, Type: ${p.roomType}, Date: ${p.createdAt}`);
  });
  
  process.exit(0);
}

run().catch(console.error);
