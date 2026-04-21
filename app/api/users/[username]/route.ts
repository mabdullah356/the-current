import { NextRequest, NextResponse } from "next/server";
import User from "@/Models/user.Model";
import Post from "@/Models/post.Model";

export async function GET (req:NextRequest,{params}:{params:Promise<{username:string}>}){
    const {username} = await params;
    console.log(username)
    if(!username){
        return NextResponse.json({message:"Username is required!"},{status:400})
    };

     try {
        const user = await User.findOne({username}).select("-password");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const posts = await Post.find({ user: user._id }).populate('user').lean();
        return NextResponse.json({
            success: true,
            user,
            posts,
            message: "Profile fetched successfully",
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}