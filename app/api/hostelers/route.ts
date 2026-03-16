import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Hosteler from "../../../models/Hosteler";
import Room from "../../../models/Room";
import User from "../../../models/User";
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
    if (!auth) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    if (auth.role === "hostel-incharge") {
      const hostelers = await (Hosteler as any).find({})
        .populate({
          path: "student",
          select: "name regNo rollNo branch year mobile"
        })
        .populate("room", "roomNo", null, { strictPopulate: false })
        .sort({ joinedAt: -1 });

      // Flatten for frontend
      const flat = hostelers.map(h => ({
        _id: h._id,
        name: h.student?.name || "N/A",
        regNo: h.student?.regNo || "N/A",
        rollNo: h.student?.rollNo || "N/A",
        branch: h.student?.branch || "N/A",
        year: h.student?.year || 0,
        mobile: h.student?.mobile || "N/A",
        room: h.room?.roomNo || "Not Assigned",
        bedNo: h.bedNo || "N/A"
      }));
      return NextResponse.json({ hostelers: flat });
    }

    if (auth.role === "student") {
      const hosteler = await (Hosteler as any).findOne({ student: auth.userId })
        .populate("room", "roomNo floor", null, { strictPopulate: false });
      return NextResponse.json({ hosteler });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error: any) {
    console.error("Error in /api/hostelers GET:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch hostelers" }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== "hostel-incharge") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const { studentId, roomId, bedNo } = await req.json();

    if (!studentId || !roomId || !bedNo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for existing assignment to handle transfers
    const existingAssignment = await (Hosteler as any).findOne({ student: studentId });
    
    if (existingAssignment && existingAssignment.room) {
      // Find old room and free up the bed
      const oldRoom = await (Room as any).findById(existingAssignment.room);
      if (oldRoom) {
        const oldBed = oldRoom.beds.find((b: any) => b.bedNo === existingAssignment.bedNo);
        if (oldBed) {
          oldBed.isOccupied = false;
          oldRoom.occupied = Math.max(0, (oldRoom.occupied || 1) - 1);
          if (oldRoom.status === "Full") oldRoom.status = "Available";
          await oldRoom.save();
        }
      }
    }

    // Check if bed is already occupied (redundancy check)
    const room = await Room.findById(roomId);
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const bed = room.beds.find((b: any) => b.bedNo === bedNo);
    if (!bed || bed.isOccupied) {
      return NextResponse.json({ error: "Bed is already occupied or does not exist" }, { status: 400 });
    }

    // Create or Update hosteler record
    let hosteler;
    if (existingAssignment) {
      existingAssignment.room = roomId;
      existingAssignment.bedNo = bedNo;
      existingAssignment.joinedAt = new Date();
      hosteler = await existingAssignment.save();
    } else {
      hosteler = await Hosteler.create({
        student: studentId,
        room: roomId,
        bedNo,
        joinedAt: new Date()
      });
    }

    // Update room occupancy
    bed.isOccupied = true;
    room.occupied = (room.occupied || 0) + 1;
    if (room.occupied >= room.capacity) {
      room.status = "Full";
    }
    await room.save();

    return NextResponse.json({ message: "Student assigned to room successfully", hosteler });
  } catch (error) {
    console.error("Error in /api/hostelers POST:", error);
    return NextResponse.json({ error: "Failed to assign student" }, { status: 500 });
  }
}
