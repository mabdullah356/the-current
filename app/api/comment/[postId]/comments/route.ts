import { NextRequest, NextResponse } from "next/server";
import Post from "@/Models/post.Model";
import Comment from "@/Models/comment.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";
import { connectDB } from "@/lib/mongodb";

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { postId } = await params;

    if (!postId) {
      return NextResponse.json({ message: "Post ID is required" }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const comments = await Comment.find({ postId })
      .populate({ path: "userId", select: "username fullName profilePicture" })
      .limit(3)
      .sort({ createdAt: -1 });

    return NextResponse.json({ message: "Comment fetch successfully", totalComments: comments.length, comments }, { status: 200 });

  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}