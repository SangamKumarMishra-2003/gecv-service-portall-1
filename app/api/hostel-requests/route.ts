import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import HostelRequest from "../../../models/HostelRequest";
import User from "../../../models/User";

export async function GET() {
  await dbConnect();
  const requests = await HostelRequest.find({})
    .populate({
      path: "student",
      select: "name regNo email branch year mobile"
    })
    .sort({ createdAt: -1 });
  return NextResponse.json({ requests });
}
