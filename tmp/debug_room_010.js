const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function checkRoom() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const room = await mongoose.connection.db.collection('rooms').findOne({ roomNo: '010' });
        if (room) {
            console.log("Room 010 Data:", JSON.stringify(room, null, 2));
        } else {
            console.log("Room 010 not found. Checking all rooms...");
            const rooms = await mongoose.connection.db.collection('rooms').find().toArray();
            console.log("All Rooms:", JSON.stringify(rooms, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRoom();
