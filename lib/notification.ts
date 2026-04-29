import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/Models/notification.model";

interface NotificationProps {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  type: "follow" |"unfollow" | "like" | "comment" | "friend" | "viewProfile";
  postId?: mongoose.Types.ObjectId;
  commentId?: mongoose.Types.ObjectId;
}

export async function createNotification({
  sender,
  receiver,
  type,
  postId,
  commentId,
}: NotificationProps) {
  await connectDB();

  if (!sender || !receiver || !type) {
    throw new Error("Missing required fields");
  }

  if (sender.toString() === receiver.toString()) {
    return null;
  }

  const notification = await Notification.create({
    sender,
    receiver,
    type,
    postId,
    commentId
  });

  return notification;
}