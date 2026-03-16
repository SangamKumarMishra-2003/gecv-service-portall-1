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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || (auth.role !== "hostel-incharge" && auth.role !== "academics")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    await connectToDatabase();

    const updatedHostel = await Hostel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedHostel) {
      return NextResponse.json({ message: "Hostel not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Hostel updated successfully", hostel: updatedHostel });
  } catch (error: any) {
    console.error("Update hostel error:", error);
    return NextResponse.json(
      { message: "Failed to update hostel", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await connectToDatabase();

    const hostel = await Hostel.findById(id).populate("createdBy", "name");

    if (!hostel) {
      return NextResponse.json({ message: "Hostel not found" }, { status: 404 });
    }

    return NextResponse.json({ hostel });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error fetching hostel", error: error.message },
      { status: 500 }
    );
  }
}
