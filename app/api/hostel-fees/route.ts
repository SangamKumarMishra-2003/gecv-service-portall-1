import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import HostelFee from "@/models/HostelFee";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    const fees = await HostelFee.find({})
      .populate("student", "name regNo")
      .sort({ paymentDate: -1 });
    return NextResponse.json({ fees });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching fees", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const fee = await HostelFee.create(body);
    return NextResponse.json({ message: "Fee record created", fee }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Error creating fee record", error: error.message }, { status: 500 });
  }
}
