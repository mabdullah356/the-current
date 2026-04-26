import notificationModel from "@/Models/notification.model";
import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

//    const session = await getServerSession(authOptions);
//    if(!session){
//     return NextResponse.json({message:"unauthorized"},{status:401})
//    } 
  const { id } = await params;
//   console.log(id)

  if (!id) {
    return NextResponse.json(
      { message: "Notification ID is required!" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    
    const notification = await notificationModel.findById(id);

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    notification.isRead = true
    await notification.save()
    return NextResponse.json(
      { message: "Notification seen successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}