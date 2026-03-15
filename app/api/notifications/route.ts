// POST - Send notification to all students
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== "faculty") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const { title, message, type } = await req.json();
    // Find all students
    const students = await User.find({ role: "student" });
    const notifications = await Notification.insertMany(
      students.map((student: any) => ({
        userId: student._id,
        title,
        message,
        type: type || "info",
      }))
    );
    return NextResponse.json({ success: true, count: notifications.length });
  } catch (error: any) {
    console.error("Send Notification Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Notification from "@/models/Notification";
import "@/models/ServiceRequest";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Helper to verify token and get user
async function verifyAuth(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    return decoded;
  } catch {
    return null;
  }
}

// GET - List notifications for current user
export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const notifications = await Notification.find({ userId: auth.userId })
      .populate("relatedRequestId", "serviceType status")
      .sort({ read: 1, createdAt: -1 }) // Unread first, then by date
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: auth.userId,
      read: false,
    });

    return NextResponse.json({ notifications, unreadCount }, { status: 200 });
  } catch (error: any) {
    console.error("Get Notifications Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, markAllRead } = await req.json();

    await connectToDatabase();

    if (markAllRead) {
      // Mark all notifications as read for this user
      await Notification.updateMany(
        { userId: auth.userId, read: false },
        { $set: { read: true } }
      );
      return NextResponse.json({ message: "All notifications marked as read" }, { status: 200 });
    }

    if (!notificationId) {
      return NextResponse.json(
        { message: "Notification ID or markAllRead is required" },
        { status: 400 }
      );
    }

    // Mark single notification as read
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: auth.userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Notification marked as read", notification }, { status: 200 });
  } catch (error: any) {
    console.error("Update Notification Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
