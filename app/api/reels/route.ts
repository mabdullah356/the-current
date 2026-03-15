import { connectDB } from "@/lib/mongodb";
import { authOptions } from "@/lib/nextAuth";
import Post from "@/Models/post.Model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user.id) {
            return NextResponse.json(
                { message: "Unauthorized access" },
                { status: 401 },
            );
        }

        const reels = await Post.find({ "media.type": "video" })
            .populate("user", "username fullName profilePicture isVerified")
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();;

        if (!reels || reels.length === 0) {
            return NextResponse.json(
                { message: "Reels not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ message: "Reels found successfully", totalReels: reels.length, reels }, { status: 200 });

    } catch (error) {
        console.error("Error fetching reels:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}