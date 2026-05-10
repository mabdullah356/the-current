import User from "@/Models/user.Model";
import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/nodemailer";
import { connectDB } from "@/lib/mongodb";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const email = body?.email?.trim();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "If that email is registered, you'll receive a reset link" },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetExpiry;
    await user.save();

    const domain = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";
    const resetLink = `${domain}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    return NextResponse.json(
      { message: "If that email is registered, you'll receive a reset link" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
