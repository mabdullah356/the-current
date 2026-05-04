import { connectDB } from "@/lib/mongodb";
import Message from "@/Models/message.Model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";
import User from "@/Models/user.Model";

export async function GET(req:NextRequest,{params}:{params:Promise<{receiverId:string}>}){

    const session = await getServerSession(authOptions);
    if(!session){
        return NextResponse.json({message:"unauthorized"},{status:401})
    };

    const {receiverId} =await params;
    if(!receiverId){
        return NextResponse.json({message:"receiver ID is required!"},{status:400})
    };


    try {
        
        await connectDB();
        const messages = await Message.find({
            $or: [
                { sender: session.user.id, receiver: receiverId },
                { sender: receiverId, receiver: session.user.id }
            ]
        }).sort({ createdAt: 1 })

        const receiver= await User.findById(receiverId).select("username fullName profilePicture")
        
        if(!receiver){
            return NextResponse.json({message:"User not found"},{status:404})
        };

        if(!messages){
            return NextResponse.json({message:"messages not found"},{status:404})
        };

        return NextResponse.json({message:"messages fetch successfully",totalMessage:messages.length,messages,receiver},{status:200})

    } catch (error) {
        console.log(error);
        return NextResponse.json({message:"Internal server error"},{status:500});
    }
}