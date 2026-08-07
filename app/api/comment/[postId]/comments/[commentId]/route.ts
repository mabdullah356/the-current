import Comment from "@/Models/comment.Model"
import Post from "@/Models/post.Model";
import { getServerSession } from "next-auth";
import { NextRequest,NextResponse } from "next/server"
import { authOptions } from "@/lib/nextAuth";
import { connectDB } from "@/lib/mongodb";

export async function DELETE (req:NextRequest,{params}:{params:Promise<{commentId:string}>}){
    
    const session = await getServerSession(authOptions);
    if(!session){
        return NextResponse.json({message:"Unauthorized"},{status:401})
    };

  try {
    await connectDB();
    const {commentId} = await params;
    if(!commentId){
        return NextResponse.json({message:"CommentID is required!"},{status:400})
    };
    
    const comment = await Comment.findById(commentId);

    if(!comment){
        return NextResponse.json({message:"Comment not found"},{status:404})
    };

    const post = await Post.findById(comment.postId);
    if(!post){
        return NextResponse.json({message:"Post not found"},{status:404})
    };

    if(comment.userId.toString() !== session.user.id && post.user.toString() !== session.user.id){
        return NextResponse.json({message:"Unauthorized"},{status:401})
    };

    comment.content="This comment has been deleted.";
    await comment.save();

    return NextResponse.json({message:"Comment deleted successfully!"},{status:200})
    
  } catch {
    return NextResponse.json({message:"Internal server error"},{status:500})
  }
}