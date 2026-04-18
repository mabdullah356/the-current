import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import User from "@/Models/user.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";
import { sendEmail } from "@/lib/nodemailer";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions); 

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.email === email) {
      return NextResponse.json(
        { error: "New email must be different from your current email" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const verifyToken = Math.floor(100000 + Math.random() * 900000).toString();

    await sendEmail({
      to: email,
      subject: "Verify your new email",
      text: `Your verification code is ${verifyToken}`,
    });

    user.emailVerifToken = verifyToken;
    user.verifyEmail = email;
    user.emailVerifTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    return NextResponse.json(
      { message: "Verification code sent to new email" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 });
  }
}