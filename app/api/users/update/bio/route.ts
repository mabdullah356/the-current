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
        const { bio } = await request.json();

        if (typeof bio !== "string" || bio.length > 150) {
            return NextResponse.json({ error: "Bio must be a string of at most 150 characters" }, { status: 400 });
        }

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        user.bio = bio;
        await user.save();
        return NextResponse.json({ message: "Bio updated successfully" }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Failed to update bio" }, { status: 500 });
    }
}