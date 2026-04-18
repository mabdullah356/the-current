import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import User from "@/Models/user.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";

export async function PUT(request: NextRequest) {

    const session = await getServerSession(authOptions);

    try {
        await connectDB();
        const { bio } = await request.json();
        const user = await User.findById(session?.user?.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        user.bio = bio;
        await user.save();
        return NextResponse.json({ message: "Bio updated successfully" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to update bio" }, { status: 500 });
    }
}