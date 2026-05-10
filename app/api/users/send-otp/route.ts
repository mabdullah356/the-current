import User from "@/Models/user.Model";
import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/nodemailer";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  let body;

  try {
    await connectDB();

    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid or empty JSON body" },
      { status: 400 }
    );
  }

  const email = body?.email?.trim();

  if (!email) {
    return NextResponse.json(
      { message: "email is required!" },
      { status: 400 }
    );
  }

  try {
    const user = await User.findOne({email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: "User is already verified" },
        { status: 200 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExp = new Date(Date.now() + 5 * 60 * 1000);

    user.emailVerifToken = otp;
    user.emailVerifTokenExpiry = otpExp;

    await user.save();

    await sendVerificationEmail(user.email, otp);

    return NextResponse.json(
      { message: "OTP sent to your email" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}