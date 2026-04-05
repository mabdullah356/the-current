import { connectDB } from "@/lib/mongodb";
import User from "@/Models/user.Model";
import Post from "@/Models/post.Model";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";




export async function GET(request: Request) {

    await connectDB();
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { id?: string } | undefined;

    if (!sessionUser?.id) {
        return NextResponse.json({ error: "Unauthorized unable to fetch profile" }, { status: 401 })
    }

    try {
        const user = await User.findById(sessionUser.id).select("-password");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const posts = await Post.find({ user: user._id });
        const savedReels = await Post.find({
            _id: { $in: user.savedPosts ?? [] },
            "media.type": "video",
        }).lean();
        const likedReels = await Post.find({
            _id: { $in: user.likedPosts ?? [] },
            "media.type": "video",
        }).lean();

        return NextResponse.json({
            success: true,
            user,
            posts,
            savedReels,
            likedReels,
            message: "Profile fetched successfully",
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}