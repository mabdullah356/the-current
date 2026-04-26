import { connectDB } from "@/lib/mongodb";
import { authOptions } from "@/lib/nextAuth";
import notificationModel from "@/Models/notification.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    const session = await getServerSession(authOptions);
    if(!session){
        return NextResponse.json({message:"unauthorized"},{status:401})
    };

    try {
        
        await connectDB();

        const notifications = await notificationModel.find({receiver:session.user.id,isRead:false})

        if(!notifications){
            return NextResponse.json({message:"Notification not found"},{status:404})
        };
        return NextResponse.json({message:"Notification fetch successfully",notification:notifications.length},{status:200})
    } catch (error) {
        console.log(error);
        return NextResponse.json({message:"Internal server error"},{status:500})
    }
}