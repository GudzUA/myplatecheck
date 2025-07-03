import { bucket } from "../utils/firebase-admin";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";


export async function uploadImageToFirebase(base64Data: string) {
  const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid base64 data");

  const mimeType = matches[1];
  const rawBuffer = Buffer.from(matches[2], "base64");
  const buffer = await sharp(rawBuffer).rotate().toBuffer();


  const fileName = `images/${uuidv4()}`;
  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      firebaseStorageDownloadTokens: uuidv4(),
    },
    public: true,
    validation: false,
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
}
