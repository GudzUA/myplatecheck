import { NextResponse } from "next/server";
import { bucket } from "@/utils/firebase-admin";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { base64, type } = body;

    if (!base64 || !type) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const buffer = Buffer.from(base64.split(",")[1], "base64");
    const fileExtension = type.split("/")[1];
    const fileName = `${uuidv4()}.${fileExtension}`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: type,
        cacheControl: "public,max-age=31536000",
      },
      public: true,
    });

    const url = `https://storage.googleapis.com/${file.bucket.name}/${file.name}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
