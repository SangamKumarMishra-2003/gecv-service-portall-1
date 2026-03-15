import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Hosteler from "../../../../models/Hosteler";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  await Hosteler.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
