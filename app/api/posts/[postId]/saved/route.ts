import { connectDB } from "@/lib/mongodb";
import { authOptions } from "@/lib/nextAuth";
import Post from "@/Models/post.Model";
import User from "@/Models/user.Model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;

  if (!sessionUser?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { postId } = await params;
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const user = await User.findById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.savedPosts) {
      user.savedPosts = [];
    }

    const alreadySaved = user.savedPosts.some((id) => id.equals(post._id));

    if (alreadySaved) {
      user.savedPosts = user.savedPosts.filter((id) => !id.equals(post._id));
      await user.save();
      return NextResponse.json({ message: "Post unsaved successfully" }, { status: 200 });
    }

    user.savedPosts.push(post._id);
    await user.save();
    return NextResponse.json({ message: "Post saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error saving reel:", error);
    return NextResponse.json({ message: "Failed to save reel" }, { status: 500 });
  }
}
