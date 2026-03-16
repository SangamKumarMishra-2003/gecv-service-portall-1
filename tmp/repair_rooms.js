const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function repairRooms() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const rooms = await mongoose.connection.db.collection('rooms').find().toArray();
        console.log(`Found ${rooms.length} rooms to check.`);

        for (const room of rooms) {
            let updated = false;
            const updateDoc = {};

            if (!room.beds || room.beds.length === 0) {
                const capacity = room.capacity || 1;
                updateDoc.beds = Array.from({ length: capacity }, (_, i) => ({
                    bedNo: `${room.roomNo}-${i + 1}`,
                    isOccupied: false
                }));
                updated = true;
            }

            if (!room.inventory || (!room.inventory.tables || room.inventory.tables.length === 0) || (!room.inventory.chairs || room.inventory.chairs.length === 0)) {
                const count = room.capacity || 1;
                updateDoc.inventory = room.inventory || {};
                
                if (!updateDoc.inventory.tables || updateDoc.inventory.tables.length === 0) {
                    updateDoc.inventory.tables = Array.from({ length: count }, (_, i) => ({
                        serialNo: `T-${room.roomNo}-${i + 1}`,
                        condition: "Good"
                    }));
                }
                
                if (!updateDoc.inventory.chairs || updateDoc.inventory.chairs.length === 0) {
                    updateDoc.inventory.chairs = Array.from({ length: count }, (_, i) => ({
                        serialNo: `C-${room.roomNo}-${i + 1}`,
                        condition: "Good"
                    }));
                }
                updated = true;
            }

            if (updated) {
                await mongoose.connection.db.collection('rooms').updateOne(
                    { _id: room._id },
                    { $set: updateDoc }
                );
                console.log(`Repaired Room ${room.roomNo}`);
            }
        }

        console.log("Repair complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

repairRooms();
