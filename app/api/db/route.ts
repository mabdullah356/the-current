import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        return NextResponse.json({ message: "MongoDB connected" });
    } catch {
        return NextResponse.json({ message: "Failed to connect to MongoDB" }, { status: 500 });
    }
}