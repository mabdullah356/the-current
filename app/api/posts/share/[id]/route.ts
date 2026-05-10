import Post from "@/Models/post.Model";
import Story from "@/Models/story.Model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";

export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}) {

     const session = await getServerSession(authOptions);
    if (!session?.user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

    const {id} = await params;
    if(!id){
        return NextResponse.json({message:"POST ID is required!"},{status:400})
    };
    
    try {
        
        const post = await Post.findById(id);

    if(!post){
        return NextResponse.json({message:"Post not found"},{status:404})
    };

    const newStory =await Story.create({user:session.user.id,media:post.media[0]});

         await newStory.save();
         return NextResponse.json({message:"Story posted successfully",story:newStory},{status:201});
         
    } catch {
        return NextResponse.json({message:"Internal server error"},{status:500});

    }
    
}