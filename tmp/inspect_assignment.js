const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

const HostelerSchema = new mongoose.Schema({
  student: mongoose.Types.ObjectId,
  room: mongoose.Types.ObjectId,
  bedNo: String
});

const HostelApplicationSchema = new mongoose.Schema({
  studentId: mongoose.Types.ObjectId,
  status: String
});

const RoomSchema = new mongoose.Schema({
    roomNo: String,
    beds: [Object],
    occupied: Number
});

const Hosteler = mongoose.models.Hosteler || mongoose.model('Hosteler', HostelerSchema);
const HostelApplication = mongoose.models.HostelApplication || mongoose.model('HostelApplication', HostelApplicationSchema);
const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  
  const appId = "69b6e5ae9d45930e5a6d6f60";
  const app = await HostelApplication.findById(appId);
  console.log("Application Data:", JSON.stringify(app, null, 2));

  if (app) {
    const studentId = app.studentId;
    const hosteler = await Hosteler.findOne({ student: studentId });
    console.log("Existing Hosteler record for this student:", JSON.stringify(hosteler, null, 2));
  }
  
  process.exit(0);
}

run().catch(console.error);
