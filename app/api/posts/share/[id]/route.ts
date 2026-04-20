import Post from "@/Models/post.Model";
import Story from "@/Models/story.Model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
    const {id} = await params;
    if(!id){
        return NextResponse.json({message:"POST ID is required!"},{status:400})
    };
    
    try {
        
        const post = await Post.findById(id);

    if(!post){
        return NextResponse.json({message:"Post not found"},{status:404})
    };

    const newStory =await Story.create({user:"69e34c9c4d861425ef7ec7dc",media:post.media[0]});

         await newStory.save();
         return NextResponse.json({message:"Story posted successfully",story:newStory},{status:201});
         
    } catch (error) {
        
        console.log(error);
        return NextResponse.json({message:"Internal server error"},{status:500});

    }
    
}