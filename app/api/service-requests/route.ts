import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ServiceRequest from "@/models/ServiceRequest";
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

// POST - Create new service request (student only)
export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "student") {
      return NextResponse.json(
        { message: "Only students can create service requests" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      serviceType,
      purpose,
      purposeType,
      academicYear,
      reasonForLeaving,
      lastSemesterCompleted,
      organizationName,
      departmentClearances,
      admissionFee,
      tuitionFee,
      registrationFee,
      examFee,
      developmentFee,
      otherCharges,
    } = body;

    if (!serviceType) {
      return NextResponse.json(
        { message: "Service type is required" },
        { status: 400 }
      );
    }

    const validTypes = ["Bonafide", "FeeStructure", "TC", "CharacterCertificate", "NOC", "NoDues"];
    if (!validTypes.includes(serviceType)) {
      return NextResponse.json(
        { message: "Invalid service type" },
        { status: 400 }
      );
    }

    // Validate required fields based on service type
    if (serviceType === "Bonafide" && !purposeType) {
      return NextResponse.json({ message: "Purpose type is required for Bonafide" }, { status: 400 });
    }
    if (serviceType === "FeeStructure" && !academicYear) {
      return NextResponse.json({ message: "Academic year is required for Fee Structure" }, { status: 400 });
    }
    if (serviceType === "TC" && (!reasonForLeaving || !lastSemesterCompleted)) {
      return NextResponse.json({ message: "Reason and last semester are required for TC" }, { status: 400 });
    }
    if (serviceType === "CharacterCertificate" && !purposeType) {
      return NextResponse.json({ message: "Purpose type is required for Character Certificate" }, { status: 400 });
    }
    if (serviceType === "NOC" && (!purposeType || !organizationName)) {
      return NextResponse.json({ message: "Purpose and organization name are required for NOC" }, { status: 400 });
    }

    await connectToDatabase();

    const requestData: any = {
      studentId: auth.userId,
      serviceType,
      status: "Pending",
    };

    // Add service-specific fields
    if (purpose) requestData.purpose = purpose;
    if (purposeType) requestData.purposeType = purposeType;
    if (academicYear) requestData.academicYear = academicYear;
    if (reasonForLeaving) requestData.reasonForLeaving = reasonForLeaving;
    if (lastSemesterCompleted) requestData.lastSemesterCompleted = lastSemesterCompleted;
    if (organizationName) requestData.organizationName = organizationName;
    if (departmentClearances) requestData.departmentClearances = departmentClearances;
    // Fee fields for Fee Structure
    if (admissionFee !== undefined) requestData.admissionFee = Number(admissionFee);
    if (tuitionFee !== undefined) requestData.tuitionFee = Number(tuitionFee);
    if (registrationFee !== undefined) requestData.registrationFee = Number(registrationFee);
    if (examFee !== undefined) requestData.examFee = Number(examFee);
    if (developmentFee !== undefined) requestData.developmentFee = Number(developmentFee);
    if (otherCharges !== undefined) requestData.otherCharges = Number(otherCharges);

    const serviceRequest = await ServiceRequest.create(requestData);

    return NextResponse.json(
      { message: "Service request created successfully", request: serviceRequest },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Service Request Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

// GET - List service requests
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

    // Students can only see their own requests
    if (auth.role === "student") {
      query.studentId = auth.userId;
    }

    // Filter by status if provided
    if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
      query.status = status;
    }

    // Filter by service type if provided
    const serviceType = searchParams.get("serviceType");
    if (serviceType) {
      query.serviceType = serviceType;
    }

    const requests = await ServiceRequest.find(query)
      .populate("studentId", "name regNo email mobile course branch semester year session dob fatherName motherName admissionDate expectedCompletionYear")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error: any) {
    console.error("Get Service Requests Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
