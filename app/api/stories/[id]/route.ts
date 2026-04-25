import { NextRequest, NextResponse } from "next/server"
import Story from '@/Models/story.Model'; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    
    const session = await getServerSession(authOptions);
    if(!session){
        return NextResponse.json({message:"Unauthorized"},{status:401})
    };
    
    const {id} = await params
    if(!id){
        return NextResponse.json({message:"Story ID is required!"},{status:400})
    };

    try {
        
        const story = await Story.findById(id);
    if(!story){
        return NextResponse.json({message:"Story not found"},{status:404})
    };
    
    if(story.user.toString()!==session.user.id){
        return NextResponse.json({message:"Unauthorized"},{status:401})
    };
     await Story.findByIdAndDelete(id);

     return NextResponse.json({message:"Story deleted successfully"},{status:200})
    

    } catch (error) {
        return NextResponse.json({message:"Internal server error"},{status:500})        
    }
    

}   