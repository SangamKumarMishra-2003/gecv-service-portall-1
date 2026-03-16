import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || (auth.role !== "hostel-incharge" && auth.role !== "academics")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    const body = await req.json();

    const room = await Room.findById(id);
    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    // If capacity is changed, we might need to regenerate beds/inventory
    // But for simplicity in this edit, we'll only update basic fields 
    // and let the user handle inventory/beds elsewhere if needed, 
    // OR we regenerate if it's a simple type change.
    
    if (body.capacity && body.capacity !== room.capacity) {
        // Only regenerate if no one is assigned? 
        if (room.occupied > 0 && body.capacity < room.occupied) {
            return NextResponse.json({ message: "Cannot reduce capacity below current occupancy" }, { status: 400 });
        }
        
        // Regenerate beds if requested or if it's a simple capacity change
        if (!body.beds || body.beds.length === 0) {
            body.beds = Array.from({ length: body.capacity }, (_, i) => {
                const existingBed = room.beds[i];
                return existingBed || { bedNo: `${body.roomNo || room.roomNo}-${i + 1}`, isOccupied: false };
            });
        }

        if (!body.inventory || (body.inventory.tables?.length === 0 || body.inventory.chairs?.length === 0)) {
            const currentTables = body.inventory?.tables || [];
            const currentChairs = body.inventory?.chairs || [];
            
            body.inventory = {
                tables: Array.from({ length: body.capacity }, (_, i) => (currentTables[i] || room.inventory?.tables?.[i] || { serialNo: `T-${body.roomNo || room.roomNo}-${i+1}`, condition: "Good" })),
                chairs: Array.from({ length: body.capacity }, (_, i) => (currentChairs[i] || room.inventory?.chairs?.[i] || { serialNo: `C-${body.roomNo || room.roomNo}-${i+1}`, condition: "Good" }))
            };
        }
    }

    const updatedRoom = await Room.findByIdAndUpdate(id, body, { new: true });

    return NextResponse.json({ message: "Room updated successfully", room: updatedRoom });
  } catch (error: any) {
    console.error("Error updating room:", error);
    return NextResponse.json({ message: "Error updating room", error: error.message }, { status: 500 });
  }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth || (auth.role !== "hostel-incharge" && auth.role !== "academics")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const room = await Room.findById(id);
        if (!room) return NextResponse.json({ message: "Room not found" }, { status: 404 });

        if (room.occupied > 0) {
            return NextResponse.json({ message: "Cannot delete room with active assignments" }, { status: 400 });
        }

        await Room.findByIdAndDelete(id);
        return NextResponse.json({ message: "Room deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ message: "Error deleting room", error: error.message }, { status: 500 });
    }
}
