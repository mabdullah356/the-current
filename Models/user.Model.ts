import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    fullName: string;
    bio: string;
    profilePicture: string;
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    friends:mongoose.Types.ObjectId[];
    posts: mongoose.Types.ObjectId[];
    savedPosts: mongoose.Types.ObjectId[];
    likedPosts: mongoose.Types.ObjectId[];
    isPrivate: boolean;
    isVerified: boolean;
    role: "user" | "admin";
    isEmailVerified: boolean;
    emailVerifToken?: string;
    verifyEmail?: string;
    emailVerifTokenExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
    matchPassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3,
            maxlength: 30,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
            index: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        bio: {
            type: String,
            default: "",
            maxlength: 150,
        },
        profilePicture: {
            type: String,
            default: "https://plus.unsplash.com/premium_photo-1739786996022-5ed5b56834e2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHVzZXIlMjBhdmF0YXJ8ZW58MHx8MHx8fDA%3D",
        },
        followers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        following: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        savedPosts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        likedPosts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        isPrivate: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerifToken: {
            type: String,
            default: "",
        },
        verifyEmail: {
            type: String,
            default: "",
        },
        emailVerifTokenExpiry: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
});


userSchema.methods.matchPassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};


if (mongoose.models.User) {
    delete mongoose.models.User;
}
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export async function migrateUserEntities() {
    const result = await User.updateMany(
        {
            $or: [
                { isEmailVerified: { $exists: false } },
                { emailVerifToken: { $exists: false } },
                { verifyEmail: { $exists: false } },
                { emailVerifTokenExpiry: { $exists: false } },
            ],
        },
        {
            $set: {
                isEmailVerified: false,
                emailVerifToken: "",
                verifyEmail: "",
                emailVerifTokenExpiry: new Date(),
            },
        }
    );
    return result;
}

export default User;
