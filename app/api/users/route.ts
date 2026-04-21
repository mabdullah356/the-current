import { connectDB } from "@/lib/mongodb";
import User from "@/Models/user.Model";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();

        const users = await User.find({})
            .select("_id fullName username profilePicture followers following friends")
            .limit(10) 
            .lean();

        if (!users || users.length === 0) {
            return NextResponse.json(
                { success: true, message: "No users found", data: [] },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Users retrieved successfully",
                data: users,
                count: users.length,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("API Users Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to retrieve users",
                error: error.message || "Internal server error",
            },
            { status: 500 }
        );
    }
}
