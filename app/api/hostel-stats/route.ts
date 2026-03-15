import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Hosteler from "@/models/Hosteler";
import HostelApplication from "@/models/HostelApplication";

export async function GET() {
  try {
    await connectToDatabase();

    const totalHostelers = await Hosteler.countDocuments();
    const pendingRequests = await HostelApplication.countDocuments({ status: "Pending" });
    
    // For now, these are static as we don't have a Room model yet, but we can extrapolate
    const totalRooms = 150; 
    const occupiedRooms = Math.min(totalHostelers, totalRooms); // Simplified logic
    const availableRooms = totalRooms - occupiedRooms;

    return NextResponse.json({
        totalStudents: totalHostelers,
        totalRooms,
        occupiedRooms,
        availableRooms,
        pendingRequests
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching stats", error: error.message }, { status: 500 });
  }
}
