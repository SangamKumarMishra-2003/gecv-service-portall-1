import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Room from "@/models/Room";
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
    
    const { searchParams } = new URL(req.url);
    const hostelId = searchParams.get("hostelId");
    
    let query: any = {};
    if (hostelId) query = { hostelId };
    
    const rooms = await Room.find(query).sort({ roomNo: 1 });
    return NextResponse.json({ rooms });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching rooms", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || (auth.role !== "hostel-incharge" && auth.role !== "academics")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const body = await req.json();

    if (!body.hostelId) {
        return NextResponse.json({ message: "Hostel ID is required" }, { status: 400 });
    }
    
    // Auto-generate beds if missing or empty
    if (body.capacity > 0 && (!body.beds || body.beds.length === 0)) {
       body.beds = Array.from({ length: body.capacity }, (_, i) => ({
         bedNo: `${body.roomNo}-${i + 1}`,
         isOccupied: false
       }));
    }

    // Auto-generate default inventory if missing or if arrays are empty
    if (!body.inventory || (body.inventory.tables?.length === 0 && body.inventory.chairs?.length === 0)) {
        const count = body.capacity || 1;
        body.inventory = {
            tables: Array.from({ length: count }, (_, i) => ({ serialNo: `T-${body.roomNo}-${i + 1}`, condition: "Good" })),
            chairs: Array.from({ length: count }, (_, i) => ({ serialNo: `C-${body.roomNo}-${i + 1}`, condition: "Good" }))
        };
    } else {
        // Handle cases where inventory exists but specific arrays are empty
        if (!body.inventory.tables || body.inventory.tables.length === 0) {
            body.inventory.tables = Array.from({ length: body.capacity || 1 }, (_, i) => ({ serialNo: `T-${body.roomNo}-${i + 1}`, condition: "Good" }));
        }
        if (!body.inventory.chairs || body.inventory.chairs.length === 0) {
            body.inventory.chairs = Array.from({ length: body.capacity || 1 }, (_, i) => ({ serialNo: `C-${body.roomNo}-${i + 1}`, condition: "Good" }));
        }
    }

    const room = await Room.create(body);
    return NextResponse.json({ message: "Room created", room }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Error creating room", error: error.message }, { status: 500 });
  }
}
