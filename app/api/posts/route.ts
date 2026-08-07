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
                        folder: "pixelfeed",
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
                taggedUsers = JSON.parse(taggedUsersStr).filter((id: unknown) => typeof id === "string" && id.trim());
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
    } catch {
        return NextResponse.json(
            { error: "Internal Server Error" },
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
    } catch {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
