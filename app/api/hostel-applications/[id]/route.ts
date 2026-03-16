import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import HostelApplication from "@/models/HostelApplication";
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only non-student (admin/faculty) can approve/reject
    if (auth.role === "student") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, rejectionReason } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      );
    }

    if (action === "reject" && !rejectionReason) {
      return NextResponse.json(
        { message: "Rejection reason is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const application = await HostelApplication.findById(id);
    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    if (application.status !== "Pending" && !(application.status === "Approved" && action === "approve")) {
      return NextResponse.json(
        { message: `Application is already ${application.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    application.status = action === "approve" ? "Approved" : "Rejected";
    application.approvedBy = auth.userId;
    
    if (action === "approve") {
      application.approvedAt = new Date();
    } else {
      application.rejectedAt = new Date();
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    return NextResponse.json(
      { message: `Application ${action}d successfully`, application },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Hostel Application Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
