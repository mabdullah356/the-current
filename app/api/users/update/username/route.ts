import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import User from "@/Models/user.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";

export async function PUT(request: NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const { username } = await request.json();

        const newUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
        if (!newUsername || newUsername.length < 3 || newUsername.length > 30) {
            return NextResponse.json({ error: "Username must be 3-30 characters" }, { status: 400 });
        }

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser && existingUser._id.toString() !== session.user.id) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }
        user.username = newUsername;
        await user.save();
        return NextResponse.json({ message: "Username updated successfully" }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Failed to update username" }, { status: 500 });
    }
}