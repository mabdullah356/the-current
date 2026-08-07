import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { authOptions } from "@/lib/nextAuth";
import Comment from "@/Models/comment.Model";
import Post from "@/Models/post.Model";
import { getServerSession } from "next-auth";
import { NextRequest,NextResponse } from "next/server";
import { createNotification } from "@/lib/notification";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    
    if(!session){
        return NextResponse.json({message:"unauthorized"},{status:401})
    };

    try {
        await connectDB();

        const { postId, content } = await request.json();

        if (!postId) {
            return NextResponse.json({ message: "Post ID is required" }, { status: 400 });
        }

        const trimmed = typeof content === "string" ? content.trim() : "";
        if (!trimmed) {
            return NextResponse.json({ message: "Comment content is required" }, { status: 400 });
        }

        if (trimmed.length > 1000) {
            return NextResponse.json({ message: "Comment must be at most 1000 characters" }, { status: 400 });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ message: "POST not found" }, { status: 404 });
        }

        if (post.allowComments === false) {
            return NextResponse.json({ message: "Comments are disabled on this post" }, { status: 403 });
        }

        const comment  = await Comment.create({userId:session.user.id,postId,content:trimmed});
        
        await createNotification({
                sender: new mongoose.Types.ObjectId(session.user.id),
                receiver: new mongoose.Types.ObjectId(post.user),
                commentId:new mongoose.Types.ObjectId(comment._id),
                postId,
                type: "comment",
              });
        return NextResponse.json({message:"Comment created successfully",comment},{status:201})
        
    } catch {
        return NextResponse.json({message:"Internal server error"},{status:500});
    }
}