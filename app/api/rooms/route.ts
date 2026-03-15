import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Room from "@/models/Room";

export async function GET() {
  try {
    await connectToDatabase();
    const rooms = await Room.find({}).sort({ roomNo: 1 });
    return NextResponse.json({ rooms });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching rooms", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const room = await Room.create(body);
    return NextResponse.json({ message: "Room created", room }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Error creating room", error: error.message }, { status: 500 });
  }
}
