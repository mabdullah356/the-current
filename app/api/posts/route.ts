import { NextRequest, NextResponse } from "next/server";
import Post from "@/Models/post.Model";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const formData = await req.formData();
        const caption = (formData.get("caption") as string) || "";
        const location = (formData.get("location") as string) || "";
        const hashtagsStr = (formData.get("hashtags") as string) || "";
        const taggedUsersStr = (formData.get("taggedUsers") as string) || "";
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "Media file is required" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult: any = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: "instagram-lite",
                        resource_type: "auto",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                )
                .end(buffer);
        });

        const hashtags = hashtagsStr
            ? hashtagsStr
                .split(",")
                .map((h) => h.trim().toLowerCase().replace("#", ""))
                .filter(Boolean)
            : [];

        const captionHashtags =
            caption.match(/#(\w+)/g)?.map((h) => h.substring(1).toLowerCase()) || [];
        const finalHashtags = Array.from(
            new Set([...hashtags, ...captionHashtags])
        );

        let taggedUsers = [];
        if (taggedUsersStr) {
            try {
                taggedUsers = JSON.parse(taggedUsersStr).map((id: string) => ({
                    user: id,
                }));
            } catch {
                taggedUsers = [];
            }
        }

        const post = await Post.create({
            user: (session.user as any).id,
            caption,
            media: [
                {
                    url: uploadResult.secure_url,
                    type: uploadResult.resource_type === "video" ? "video" : "image",
                },
            ],
            location,
            taggedUsers,
            hashtags: finalHashtags,
            allowComments: formData.get("allowComments") !== "false",
            hideLikes: formData.get("hideLikes") === "true",
        });

        await post.populate("user", "username fullName profilePicture");

        return NextResponse.json(
            {
                success: true,
                message: "Post created successfully",
                post,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Post Creation Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }


        const posts = await Post.find()
            .populate("user", "username fullName profilePicture")
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return NextResponse.json({ posts }, { status: 200 });
    } catch (error: any) {
        console.error("Get Posts Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { postId: string } }) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { postId } = params;
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        if (post.user.toString() !== (session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await post.deleteOne();
        return NextResponse.json({ success: true, message: "Post deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Delete Post Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest, { params }: { params: { postId: string } }) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { postId } = params;
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        if (post.user.toString() !== (session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const formData = await req.formData();
        const caption = (formData.get("caption") as string) || "";
        const location = (formData.get("location") as string) || "";
        const hashtags = (formData.get("hashtags") as string) || "";
        const taggedUsers = (formData.get("taggedUsers") as string) || "";
        const allowComments = formData.get("allowComments") !== "false";
        const hideLikes = formData.get("hideLikes") === "true";
        const file = formData.get("file") as File | null;
        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadResult: any = await new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            folder: "instagram-lite",
                            resource_type: "auto",
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    )
                    .end(buffer);
            });
            post.media.push({
                url: uploadResult.secure_url,
                type: uploadResult.resource_type === "video" ? "video" : "image",
            });
        }
        post.caption = caption;
        post.location = location;
        post.hashtags.push(...hashtags);
        // post.taggedUsers.push(...taggedUsers);
        post.allowComments = allowComments;
        post.hideLikes = hideLikes;
        await post.save();
        return NextResponse.json({ success: true, message: "Post updated successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Update Post Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}