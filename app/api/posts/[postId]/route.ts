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

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await params;
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

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await params;
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
        post.hashtags.push(...(hashtags ? [hashtags] : []));
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
