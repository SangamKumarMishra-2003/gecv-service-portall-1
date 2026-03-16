import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import HostelRequest from "../../../models/HostelRequest";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

async function verifyAuth(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || (auth.role !== "hostel-incharge" && auth.role !== "academics")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const requests = await HostelRequest.find({})
      .populate({
        path: "student",
        select: "name regNo email branch year mobile"
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error fetching hostel requests", error: error.message },
      { status: 500 }
    );
  }
}
