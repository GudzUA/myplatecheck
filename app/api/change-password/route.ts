import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  try {
    const { login, oldPassword, newPassword } = await req.json();

    if (!login || !oldPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { login } });

    if (!user || user.password !== oldPassword) {
      return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 403 });
    }

    await prisma.user.update({
      where: { login },
      data: { password: newPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
