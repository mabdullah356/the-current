import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
    user: mongoose.Types.ObjectId;
    caption: string;
    media: {
        url: string;
        type: "image" | "video";
    }[];
    location?: string;
    taggedUsers: mongoose.Types.ObjectId[];
    likes: mongoose.Types.ObjectId[];
    hashtags: string[];
    allowComments: boolean;
    hideLikes: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        caption: {
            type: String,
            trim: true,
            maxlength: 2200,
            default: "",
        },
        media: [
            {
                url: {
                    type: String,
                    required: true,
                },
                type: {
                    type: String,
                    enum: ["image", "video"],
                    default: "image",
                    required: true,
                },
            },
        ],
        location: {
            type: String,
            trim: true,
        },
        taggedUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        hashtags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],
        allowComments: {
            type: Boolean,
            default: true,
        },
        hideLikes: {
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

postSchema.index({ createdAt: -1 });
postSchema.index({ hashtags: 1 });

const Post: Model<IPost> =
    mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);

export default Post;
