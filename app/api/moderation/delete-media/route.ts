import { NextResponse } from "next/server";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "@/firebase/config";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const { commentId, mediaUrl } = await req.json();

    if (typeof mediaUrl !== "string") {
      return NextResponse.json({ error: "Invalid URL type" }, { status: 400 });
    }

    let filePath = "";

    if (mediaUrl.includes("/o/")) {
      // Формат: https://firebasestorage.googleapis.com/v0/b/.../o/шлях?alt=media
      const match = mediaUrl.match(/\/o\/(.+?)\?/);
      if (!match || !match[1]) {
        console.error("❌ Неможливо витягти шлях із URL:", mediaUrl);
        return NextResponse.json({ error: "Invalid Firebase URL" }, { status: 400 });
      }
      filePath = decodeURIComponent(match[1]);
    } else if (mediaUrl.includes("storage.googleapis.com")) {
      // Формат: https://storage.googleapis.com/BUCKET/filename
      const parts = mediaUrl.split("/");
      filePath = decodeURIComponent(parts[parts.length - 1]);
    } else {
      console.error("❌ Невідомий формат URL:", mediaUrl);
      return NextResponse.json({ error: "Unsupported URL format" }, { status: 400 });
    }

    const fileRef = ref(storage, filePath);

    // Пробуємо видалити з Firebase
    try {
      await deleteObject(fileRef);
      console.log("✅ Успішно видалено файл:", filePath);
    } catch (error) {
  const firebaseError = error as { code?: string };
  if (firebaseError.code === "storage/object-not-found") {
    console.warn("⚠️ Файл уже був видалений:", filePath);
  } else {
    throw error;
  }
}
    // 🔧 Видалення URL з бази даних
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const mediaArray = Array.isArray(comment.media)
  ? (comment.media as { url: string }[])
  : [];

    const updatedMedia = mediaArray.filter(item => item.url !== mediaUrl);   

    await prisma.comment.update({
      where: { id: commentId },
      data: { media: updatedMedia },
    });

    console.log("✅ URL видалено з бази даних");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Помилка при видаленні:", err);
    return NextResponse.json({ error: "Error deleting media" }, { status: 500 });
  }
}
