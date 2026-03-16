const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = "mongodb+srv://pythontesting9264_db_user:Sangam123@cluster0.nugwvpc.mongodb.net/gecv?retryWrites=true&w=majority";

async function setupTestData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        // 1. Create a Student if not exists
        const studentEmail = "teststudent@gec.ac.in";
        const password = await bcrypt.hash("password123", 10);
        
        let student = await mongoose.connection.db.collection('users').findOne({ email: studentEmail });
        if (!student) {
            const studentData = {
                name: "Test Student",
                email: studentEmail,
                password: password,
                role: "student",
                regNo: "REG123456",
                rollNo: "ROLL001",
                course: "B.Tech",
                branch: "Computer Science",
                semester: 4,
                year: 2,
                mobile: "9988776655",
                dob: new Date("2003-01-01"),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await mongoose.connection.db.collection('users').insertOne(studentData);
            student = { _id: result.insertedId, ...studentData };
            console.log("Test Student created");
        } else {
            console.log("Test Student already exists");
        }

        // 2. Create a Hostel
        const hostelData = {
            name: "Vishweshwaraiya Hostel",
            type: "Boys Hostel",
            totalRooms: 10,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const hostelResult = await mongoose.connection.db.collection('hostels').insertOne(hostelData);
        const hostelId = hostelResult.insertedId;
        console.log("Test Hostel created");

        // 3. Create Rooms for the Hostel
        const rooms = [
            { roomNo: "101", floor: "1st Floor", capacity: 2, occupied: 0, status: "Available", hostelId, hostelBlock: "Double" },
            { roomNo: "102", floor: "1st Floor", capacity: 3, occupied: 0, status: "Available", hostelId, hostelBlock: "Triple" },
            { roomNo: "201", floor: "2nd Floor", capacity: 1, occupied: 0, status: "Available", hostelId, hostelBlock: "Single" }
        ];

        for (const room of rooms) {
            const beds = Array.from({ length: room.capacity }, (_, i) => ({
                bedNo: `${room.roomNo}-${i + 1}`,
                isOccupied: false
            }));
            const inventory = {
                tables: Array.from({ length: room.capacity }, (_, i) => ({ serialNo: `T-${room.roomNo}-${i+1}`, condition: "Good" })),
                chairs: Array.from({ length: room.capacity }, (_, i) => ({ serialNo: `C-${room.roomNo}-${i+1}`, condition: "Good" }))
            };
            await mongoose.connection.db.collection('rooms').insertOne({ ...room, beds, inventory });
        }
        console.log("Test Rooms created");

        console.log("\n--- TEST CREDENTIALS ---");
        console.log(`Student Email: ${studentEmail}`);
        console.log(`Password: password123`);
        console.log("-----------------------");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

setupTestData();
