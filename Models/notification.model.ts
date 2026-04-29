import { Schema, Types, model, models } from "mongoose";

export type NotificationType = "follow" | "unfollow" | "like" | "comment" | "friend" | "viewProfile";

export interface INotification {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  type: NotificationType;
  postId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  groupKey?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["follow","unfollow", "like", "comment", "friend", "viewProfile"],
      required: true,
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    groupKey: {
      type: String,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ receiver: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ receiver: 1, type: 1, postId: 1 });

export default models.Notification ||
  model<INotification>("Notification", NotificationSchema);