import { connectDB } from "@/lib/mongodb";
import Message from "@/Models/message.Model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ receiverId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

  const { receiverId } = await params;
  if (!receiverId) return NextResponse.json({ message: "receiver ID required" }, { status: 400 });

  const since = req.nextUrl.searchParams.get('since');

  await connectDB();

  const query: any = {
    $or: [
      { sender: session.user.id, receiver: receiverId },
      { sender: receiverId, receiver: session.user.id }
    ]
  };

  if (since) query.createdAt = { $gt: new Date(since) };

  const messages = await Message.find(query).sort({ createdAt: 1 });

  return NextResponse.json({ messages, timestamp: new Date().toISOString() });
}
