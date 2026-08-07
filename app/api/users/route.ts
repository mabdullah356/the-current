import { connectDB } from "@/lib/mongodb";
import User from "@/Models/user.Model";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        await connectDB();

        const users = await User.find({})
            .select("_id fullName username profilePicture following friends")
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
    } catch {
        return NextResponse.json(
            {
                success: false,
                message: "Failed to retrieve users",
            },
            { status: 500 }
        );
    }
}
