import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Test from "../../../models/Test";

import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function POST(req: NextRequest) {
  await dbConnect();
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let userId = null;
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();
  try {
    const test = await Test.create({
      ...data,
      createdBy: userId,
    });
    return NextResponse.json({ success: true, test });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();
  const tests = await Test.find().sort({ createdAt: -1 });
  return NextResponse.json({ tests });
}
