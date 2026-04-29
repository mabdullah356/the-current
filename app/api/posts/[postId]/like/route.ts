import { connectDB } from "@/lib/mongodb"
import { authOptions } from "@/lib/nextAuth"
import Post from "@/Models/post.Model"
import User from "@/Models/user.Model"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { createNotification } from "@/lib/notification"


export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        await connectDB();
        const { postId } = await params;
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }
        const userId = new mongoose.Types.ObjectId(session.user.id);
        if (post.likes.some(id => id.equals(userId))) {
            post.likes = post.likes.filter(id => !id.equals(userId));
            await User.findByIdAndUpdate(session.user.id, { $pull: { likedPosts: postId } });
            await post.save();
            return NextResponse.json({ message: "Post un-liked successfully" }, { status: 200 });
        } else {
            post.likes.push(userId);
            await post.save();
            await User.findByIdAndUpdate(session.user.id, { $addToSet: { likedPosts: postId } });
            
            await createNotification({
                sender: new mongoose.Types.ObjectId(session.user.id),
                receiver: new mongoose.Types.ObjectId(post.user),
                postId: new mongoose.Types.ObjectId(postId),
                type: "like",
            });

            return NextResponse.json({ message: "Post liked successfully" }, { status: 200 });
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Failed to like the post" }, { status: 500 });
    }
}