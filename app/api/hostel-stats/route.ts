import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Hosteler from "@/models/Hosteler";
import HostelApplication from "@/models/HostelApplication";
import Room from "@/models/Room";
import Hostel from "@/models/Hostel";
import HostelFee from "@/models/HostelFee";
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

    const totalHostelers = await Hosteler.countDocuments();
    const pendingRequests = await HostelApplication.countDocuments({ status: "Pending" });
    const totalHostels = await Hostel.countDocuments();
    
    // Get live room stats
    const rooms = await Room.find({});
    const totalRooms = rooms.length;
    const occupiedBeds = rooms.reduce((acc, r) => acc + (r.occupied || 0), 0);
    const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const availableBeds = totalCapacity - occupiedBeds;

    const feeCollected = await HostelFee.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalFeeCollected = feeCollected.length > 0 ? feeCollected[0].total : 0;

    return NextResponse.json({
        totalStudents: totalHostelers,
        totalRooms: totalRooms,
        totalHostels,
        availableBeds: availableBeds,
        pendingRequests,
        totalFeeCollected,
        occupiedBeds // Keeping for internal use if needed
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching stats", error: error.message }, { status: 500 });
  }
}
