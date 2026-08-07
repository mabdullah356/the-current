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

  let sinceDate: Date | undefined;
  if (since) {
    sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid 'since' timestamp" },
        { status: 400 },
      );
    }
  }

  try {
    await connectDB();

    const query: any = {
      $or: [
        { sender: session.user.id, receiver: receiverId },
        { sender: receiverId, receiver: session.user.id }
      ]
    };

    if (sinceDate) query.createdAt = { $gt: sinceDate };

    const messages = await Message.find(query).sort({ createdAt: 1 });

    return NextResponse.json(
      { messages, timestamp: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
