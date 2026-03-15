import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import connectToDatabase from "../lib/db";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seed() {
  try {
    await connectToDatabase();
    console.log("Connected to database");

    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const users = [
      {
        name: "SANGAM MISHRA",
        email: "student@gec.ac.in",
        role: "student",
        regNo: "21105152003",
        password: await bcrypt.hash("21105152003", 10), // Default password = regNo
        mobile: "9876543210",
        course: "B.Tech",
        branch: "COMPUTER SCIENCE AND ENGINEERING",
        session: "2024-2025",
        semester: 6,
        year: 3,
        fatherName: "RAJESH MISHRA",
        motherName: "SUNITA MISHRA",
        dob: new Date("2003-05-15"),
        admissionDate: new Date("2021-08-01"),
        expectedCompletionYear: "2025"
      },
      {
        name: "Faculty User",
        email: "faculty@gec.ac.in",
        role: "faculty",
        password: hashedPassword,
        mobile: "9876543211"
      },
      {
        name: "Academics User",
        email: "academics@gec.ac.in",
        role: "academics",
        password: hashedPassword,
        mobile: "9876543212"
      },
      {
        name: "Hostel Incharge",
        email: "hostel@gecv.ac.in",
        role: "hostel-incharge",
        password: hashedPassword,
        mobile: "9876543213"
      },
    ];

    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create(user);
        console.log(`Created user: ${user.role} (${user.email})`);
      } else {
        console.log(`User already exists: ${user.role} (${user.email})`);
      }
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
