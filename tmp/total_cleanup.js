const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function cleanupDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        console.log("Cleaning up Hostel-related collections...");
        
        const resultApps = await mongoose.connection.db.collection('hostelapplications').deleteMany({});
        console.log(`Deleted ${resultApps.deletedCount} applications`);

        const resultFees = await mongoose.connection.db.collection('hostelfees').deleteMany({});
        console.log(`Deleted ${resultFees.deletedCount} fee records`);

        const resultHostelers = await mongoose.connection.db.collection('hostelers').deleteMany({});
        console.log(`Deleted ${resultHostelers.deletedCount} residents`);

        const resultRooms = await mongoose.connection.db.collection('rooms').deleteMany({});
        console.log(`Deleted ${resultRooms.deletedCount} rooms`);

        const resultHostels = await mongoose.connection.db.collection('hostels').deleteMany({});
        console.log(`Deleted ${resultHostels.deletedCount} hostels`);

        // Wipe students but keep management
        const resultStudents = await mongoose.connection.db.collection('users').deleteMany({ role: 'student' });
        console.log(`Deleted ${resultStudents.deletedCount} student users`);

        console.log("Database is now clean!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanupDB();
