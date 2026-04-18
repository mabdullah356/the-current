import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import User from "@/Models/user.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions); 

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { code } = await request.json(); 

    if (!code) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.emailVerifTokenExpiry || new Date(user.emailVerifTokenExpiry) < new Date()) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 400 });
    }

    if (user.emailVerifToken !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (!user.verifyEmail) {
      return NextResponse.json(
        { error: "No pending email change found" },
        { status: 400 }
      );
    }

    user.email = user.verifyEmail;
    user.isEmailVerified = true;    
    user.emailVerifToken = undefined;
    user.verifyEmail = undefined;
    user.emailVerifTokenExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Email updated and verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
  }
}