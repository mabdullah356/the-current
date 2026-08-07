import {NextResponse } from "next/server";
import User from "@/Models/user.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";
import { connectDB } from "@/lib/mongodb";

export async function GET (){
    
    const session = await getServerSession(authOptions);
    
    if(!session){
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

     try {
        await connectDB();
        const friends = await User.findById(session.user.id)
        .select("username")
        .populate("friends","username fullName profilePicture")

        if (!friends) {
            return NextResponse.json({ error: "friends not found" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            friends,
            message: "Friends lists fetched successfully",
        }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}