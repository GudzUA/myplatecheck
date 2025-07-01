import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const { email, join } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { joinRadioDraw: join },
    });

    return NextResponse.json({ success: true, joinRadioDraw: updated.joinRadioDraw });
  } catch (err) {
    console.error("❌ Update joinRadioDraw error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
