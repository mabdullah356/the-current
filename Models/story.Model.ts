import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStory extends Document {
    user: mongoose.Types.ObjectId;
    media: {
        url: string;
        type: "image" | "video";
    };
    likes: number;
    viewedBy: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const storySchema = new Schema<IStory>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        media: 
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
        likes: 
            {
                type: Number,
                default:0
            },
        viewedBy: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },        
          ],
        },
    {
        timestamps: true,
    }
);


const Story: Model<IStory> =
    mongoose.models.Story || mongoose.model<IStory>("Story", storySchema);

export default Story;
