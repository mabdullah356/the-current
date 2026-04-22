import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import User from "@/Models/user.Model";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const email = body?.email?.trim();
    const otp = body?.otp?.toString().trim();

    if (!email) {
      return NextResponse.json(
        { error: "User Email is required" },
        { status: 400 }
      );
    }

    if (!otp) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (
      !user.emailVerifToken ||
      !user.emailVerifTokenExpiry ||
      new Date(user.emailVerifTokenExpiry) < new Date()
    ) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    if (user.emailVerifToken !== otp) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.emailVerifToken = undefined;
    user.emailVerifTokenExpiry = undefined;

    await user.save();

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}