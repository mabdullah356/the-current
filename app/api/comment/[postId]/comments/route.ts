import { NextRequest,NextResponse } from "next/server";
import Post from "@/Models/post.Model";
import Comment from "@/Models/comment.Model";

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    
    if (!postId) {
      return NextResponse.json({ message: "Post ID is required" }, { status: 400 });
    };

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    };

    const comments  = await Comment.find({ postId }).populate({ path: "userId", select: "username fullName profilePicture" }).limit(3).sort({ createdAt: -1 });

    return NextResponse.json({ message: "Comment fetch successfully", totalComments: comments.length , comments }, { status: 200 });
  
} catch (error) {

    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });

}}