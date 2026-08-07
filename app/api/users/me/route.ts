import { connectDB } from "@/lib/mongodb";
import User from "@/Models/user.Model";
import Post from "@/Models/post.Model";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";




export async function GET(request: Request) {

    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { id?: string } | undefined;

    if (!sessionUser?.id) {
        return NextResponse.json({ error: "Unauthorized unable to fetch profile" }, { status: 401 })
    }

    try {
        await connectDB();
        const user = await User.findById(sessionUser.id).select("-password");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const posts = await Post.find({ user: user._id }).populate("user", "username fullName profilePicture").lean();
        const savedPosts = await Post.find({
            _id: { $in: user.savedPosts ?? [] },
        }).populate("user", "username fullName profilePicture").lean();
        const likedPostsData = await Post.find({
            _id: { $in: user.likedPosts ?? [] },
        }).populate("user", "username fullName profilePicture").lean();

        return NextResponse.json({
            success: true,
            user,
            posts,
            savedPosts,
            likedPostsData,
            message: "Profile fetched successfully",
        }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}