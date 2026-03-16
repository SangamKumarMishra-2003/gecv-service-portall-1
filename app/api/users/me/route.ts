import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

type AuthPayload = {
  userId?: string;
  email?: string;
};

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1] || null;
}

export async function GET(req: Request) {
  try {
    // Prefer Authorization header; fallback to cookie for browser sessions.
    const bearerToken = getBearerToken(req);
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const token = bearerToken || cookieToken;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    let decoded: AuthPayload;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    } catch {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let user = null;
    if (decoded.userId) {
      user = await (User as any).findById(decoded.userId).select("-password");
    }
    if (!user && decoded.email) {
      user = await (User as any).findOne({ email: decoded.email }).select("-password");
    }

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
