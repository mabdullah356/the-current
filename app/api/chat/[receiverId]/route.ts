import { connectDB } from "@/lib/mongodb";
import Message from "@/Models/message.Model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest,{params}:{params:Promise<{receiverId:string}>}){

    const {receiverId} =await params;
    if(!receiverId){
        return NextResponse.json({message:"receiver ID is required!"},{status:400})
    };


    try {
        
        await connectDB();
        const messages = await Message.find({sender:"69e34c9c4d861425ef7ec7dc",receiver:receiverId})

        if(!messages){
            return NextResponse.json({message:"messages not found"},{status:404})
        };

        return NextResponse.json({message:"messages fetch successfully",totalMessage:messages.length,messages},{status:200})

    } catch (error) {
        console.log(error);
        return NextResponse.json({message:"Internal server error"},{status:500});
    }
}