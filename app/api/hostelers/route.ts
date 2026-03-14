import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Hosteler from "../../../models/Hosteler";
import User from "../../../models/User";

export async function GET() {
  await dbConnect();
  const hostelers = await Hosteler.find({})
    .populate({
      path: "student",
      select: "name regNo branch year mobile"
    })
    .sort({ joinedAt: -1 });
  // Flatten for frontend
  const flat = hostelers.map(h => ({
    _id: h._id,
    name: h.student.name,
    regNo: h.student.regNo,
    branch: h.student.branch,
    year: h.student.year,
    mobile: h.student.mobile,
  }));
  return NextResponse.json({ hostelers: flat });
}
