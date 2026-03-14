import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function GET() {
  try {
    // Get token from cookies (Next.js App Router way)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify JWT
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    // Connect DB
    await connectToDatabase();

    // Make sure 'email' exists in your User schema, otherwise use a valid field
    const user = await (User as any).findOne(
      { email: decoded.email as string }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}