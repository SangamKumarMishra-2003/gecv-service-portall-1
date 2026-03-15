import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function POST(req: Request) {
  try {
    const { identifier, password, role } = await req.json();

    if (!identifier || !password || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Determine query based on role
    // Student uses regNo, others use email
    let dbRole = role.toLowerCase();
    if (role === "Hostel Incharge") dbRole = "hostel-incharge";
    
    let query: any = { role: dbRole };
    if (role === "Student") {
        query.regNo = identifier;
    } else {
        query.email = identifier;
    }

    console.log("Login attempt:", { role, identifier, query });

    // Find user
    const user = await User.findOne(query);
    
    console.log("User found:", user ? `${user.email || user.regNo}` : "NOT FOUND");

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate Token
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json(
      { 
        message: "Login successful", 
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            regNo: user.regNo,
            mobile: user.mobile,
            // Student profile fields
            course: user.course,
            branch: user.branch,
            session: user.session,
            semester: user.semester,
            year: user.year,
            fatherName: user.fatherName,
            motherName: user.motherName,
            dob: user.dob,
            admissionDate: user.admissionDate,
            expectedCompletionYear: user.expectedCompletionYear
        },
        token 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
