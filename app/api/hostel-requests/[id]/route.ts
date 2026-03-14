import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import HostelRequest from "../../../../models/HostelRequest";
import Hosteler from "../../../../models/Hosteler";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  const { action } = await req.json();
  const hostelRequest = await HostelRequest.findById(id);
  if (!hostelRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (action === "approve") {
    hostelRequest.status = "approved";
    await hostelRequest.save();
    // Add to hostelers
    await Hosteler.create({ student: hostelRequest.student, roomType: hostelRequest.roomType });
  } else if (action === "reject") {
    hostelRequest.status = "rejected";
    await hostelRequest.save();
  }
  return NextResponse.json({ success: true });
}
