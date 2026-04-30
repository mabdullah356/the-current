import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/Models/message.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";

export async function POST(req: NextRequest) {
  
    const session = await getServerSession(authOptions);
    if(!session){
        return NextResponse.json({message:"unauthorized"},{status:401})
    };

    const body = await req.json();
    const { content, receiver } = body;

  if (!content || !content.trim()) {
    return NextResponse.json(
      { message: "Message content is required!" },
      { status: 400 }
    );
  }

  if (!receiver) {
    return NextResponse.json(
      { message: "Receiver ID is required!" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const message = await Message.create({
      sender: session.user.id,
      receiver,
      content: content.trim(),
    });

    return NextResponse.json(
      { success: true, message },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}