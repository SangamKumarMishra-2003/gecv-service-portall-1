import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import HostelFee from "@/models/HostelFee";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

async function verifyAuth(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
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
    if (!auth || auth.role !== "hostel-incharge") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const fees = await HostelFee.find({})
      .populate("student", "name regNo")
      .sort({ paymentDate: -1 });
    return NextResponse.json({ fees });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching fees", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== "hostel-incharge") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const body = await req.json();
    const fee = await HostelFee.create(body);
    return NextResponse.json({ message: "Fee record created", fee }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Error creating fee record", error: error.message }, { status: 500 });
  }
}
