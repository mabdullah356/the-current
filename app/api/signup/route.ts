import { NextResponse } from "next/server";
import User from "@/Models/user.Model";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
    try {
        let body: Record<string, unknown>;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { message: "Invalid JSON body" },
                { status: 400 }
            );
        }

        const { name: bodyName, userName: bodyUserName, email: bodyEmail, password: bodyPassword } = body;
        const name = typeof bodyName === "string" ? bodyName.trim() : "";
        const userName = typeof bodyUserName === "string" ? bodyUserName.trim() : "";
        const email = typeof bodyEmail === "string" ? bodyEmail.trim().toLowerCase() : "";
        const password = typeof bodyPassword === "string" ? bodyPassword : "";

        if (!name || !userName || !email || !password) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        if (name.length > 50) {
            return NextResponse.json(
                { message: "Name must be at most 50 characters" },
                { status: 400 }
            );
        }

        if (userName.length < 3 || userName.length > 30) {
            return NextResponse.json(
                { message: "Username must be 3-30 characters" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json(
                { message: "Please use a valid email address" },
                { status: 400 }
            );
        }

        await connectDB();

        const userExists = await User.findOne({
            $or: [
                { email },
                { username: userName.toLowerCase() }
            ]
        });

        if (userExists) {
            const field = userExists.email === email ? "Email" : "Username";
            return NextResponse.json(
                { message: `${field} already exists` },
                { status: 400 }
            );
        }

        const newUser = await User.create({
            fullName: name,
            username: userName.toLowerCase(),
            email,
            password
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
