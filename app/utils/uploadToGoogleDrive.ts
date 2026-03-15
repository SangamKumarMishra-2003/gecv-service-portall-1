import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

export async function uploadToGoogleDrive(file: File, fileName: string, folderId?: string) {
  // You must set up OAuth2 credentials and tokens for your app
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH, // Path to service account key JSON
    scopes: SCOPES,
  });
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: folderId ? [folderId] : undefined,
    },
    media: {
      mimeType: file.type,
      body: file.stream(),
    },
    fields: "id, webViewLink, webContentLink",
  });
  return res.data;
}
