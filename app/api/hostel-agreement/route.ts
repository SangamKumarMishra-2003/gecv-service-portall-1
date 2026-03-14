import { NextRequest, NextResponse } from "next/server";
import { uploadToGoogleDrive } from "../../utils/uploadToGoogleDrive";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const fileName = formData.get("fileName") || "agreement.pdf";
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  try {
    const driveRes = await uploadToGoogleDrive(file, fileName);
    return NextResponse.json({
      id: driveRes.id,
      webViewLink: driveRes.webViewLink,
      webContentLink: driveRes.webContentLink,
    });
  } catch (e) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
