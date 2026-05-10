import { NextResponse } from "next/server";
import User from "@/Models/user.Model";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
    try {
        const { name, userName, email, password } = await req.json();

        if (!name || !userName || !email || !password) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        await connectDB();

        const userExists = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: userName.toLowerCase() }
            ]
        });

        if (userExists) {
            const field = userExists.email === email.toLowerCase() ? "Email" : "Username";
            return NextResponse.json(
                { message: `${field} already exists` },
                { status: 400 }
            );
        }

        const newUser = await User.create({
            fullName: name,
            username: userName.toLowerCase(),
            email: email.toLowerCase(),
            password: password
        });

        return NextResponse.json(
            {
                message: "User registered successfully",
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email
                }
            },
            { status: 201 }
        );

    } catch {
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
