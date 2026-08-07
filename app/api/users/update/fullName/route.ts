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
        const { fullName } = await request.json();

        const name = typeof fullName === "string" ? fullName.trim() : "";
        if (!name || name.length > 50) {
            return NextResponse.json({ error: "Full name must be 1-50 characters" }, { status: 400 });
        }

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        user.fullName = fullName;
        await user.save();
        return NextResponse.json({ message: "Full name updated successfully" }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Failed to update full name" }, { status: 500 });
    }
}