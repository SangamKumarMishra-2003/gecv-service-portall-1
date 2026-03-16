const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function checkDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const collections = ['hostels', 'rooms', 'hostelers', 'hostelapplications', 'hostelfees', 'users'];
        
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col).countDocuments();
            console.log(`Collection ${col}: ${count} documents`);
            
            if (count > 0) {
                const samples = await mongoose.connection.db.collection(col).find().limit(1).toArray();
                console.log(`Sample ${col}:`, JSON.stringify(samples, null, 2));
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
