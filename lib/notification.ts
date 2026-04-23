import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/Models/notification.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const {sender,receiver,type,postId,commentId} =body

    if (!sender || !receiver || !type) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (sender === receiver) {
      return NextResponse.json(
        { message: "Cannot notify yourself" },
        { status: 200 }
      );
    }

   const newNotification=   await Notification.create({
        sender,
        receiver,
        type,
        postId,
        commentId,
      });


    return NextResponse.json(
      { message: "Notification created" ,notification:newNotification},
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}