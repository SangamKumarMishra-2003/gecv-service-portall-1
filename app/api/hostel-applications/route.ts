import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import HostelApplication from "@/models/HostelApplication";
import "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Helper to verify token and get user
async function verifyAuth(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    return decoded;
  } catch {
    return null;
  }
}

// POST - Create new hostel application
export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "student") {
      return NextResponse.json(
        { message: "Only students can apply for hostel" },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    // Validations (basic)
    const requiredFields = [
      "fullName", "regNo", "applicationNo", "gender", "dob", "category",
      "nationality", "bloodGroup", "aadhaarNo", "collegeName", "course",
      "branch", "yearSemester", "academicSession", "admissionMode",
      "permanentAddress", "cityVillage", "district", "state", "pinCode",
      "fatherName", "motherName", "occupation", "mobileNo", "emailId",
      "hostelType", "roomPreference"
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    await connectToDatabase();

    // Check if a pending or approved application already exists for this student
    const existingApp = await HostelApplication.findOne({
      studentId: auth.userId,
      status: { $in: ["Pending", "Approved"] }
    });

    if (existingApp) {
      return NextResponse.json(
        { message: "You already have a pending or approved hostel application." },
        { status: 400 }
      );
    }

    const applicationData = {
      studentId: auth.userId,
      ...body,
      status: "Pending",
    };

    const newApplication = await HostelApplication.create(applicationData);

    return NextResponse.json(
      { message: "Hostel application submitted successfully", application: newApplication },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Hostel Application Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

// GET - List hostel applications
export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query: any = {};

    // Students can only see their own applications
    if (auth.role === "student") {
      query.studentId = auth.userId;
    }

    // Filter by status if provided
    if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
      query.status = status;
    }

    const applications = await HostelApplication.find(query)
      .populate("studentId", "name regNo email mobile course branch semester year session dob")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error: any) {
    console.error("Get Hostel Applications Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
