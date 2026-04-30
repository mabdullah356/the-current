import mongoose from "mongoose";

const { Schema, model, models } = mongoose;


const AttachmentSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "audio", "document", "other"],
      required: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 255,
    },
  },
);

const MessageSchema = new Schema(
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
      enum: ["text", "image", "video", "audio", "document"],
      default: "text",
    },
    content: {
      type: String,
      trim: true,
      maxlength: 10000,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


const Message = models.Message || model("Message", MessageSchema);

export default Message;