import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Hostel from "@/models/Hostel";
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
    if (!auth || (auth.role !== "hostel-incharge" && auth.role !== "academics")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const hostels = await Hostel.find({}).populate("createdBy", "name").sort({ createdAt: -1 });
    return NextResponse.json({ hostels });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching hostels", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || (auth.role !== "hostel-incharge" && auth.role !== "academics")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const body = await req.json();
    
    const hostel = await Hostel.create({
        ...body,
        createdBy: auth.userId
    });
    
    return NextResponse.json({ message: "Hostel created", hostel }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Error creating hostel", error: error.message }, { status: 500 });
  }
}
