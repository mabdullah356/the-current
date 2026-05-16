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

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    try {
        const { postId } = await params;
        const post = await Post.findById(postId).populate("user", "username profilePicture");
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
        return NextResponse.json(post);
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { postId } = await params;
        const post = await Post.findById(postId);
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
        if (post.user.toString() !== (session.user as any).id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await post.deleteOne();
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { postId } = await params;
        const post = await Post.findById(postId);
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
        if (post.user.toString() !== (session.user as any).id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadResult: any = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "pixelfeed", resource_type: "auto" },
                    (error, result) => error ? reject(error) : resolve(result)
                ).end(buffer);
            });
            post.media = [{
                url: uploadResult.secure_url,
                type: uploadResult.resource_type === "video" ? "video" : "image",
            }];
        }

        post.caption = (formData.get("caption") as string) ?? post.caption;
        post.location = (formData.get("location") as string) ?? post.location;
        const hashtags = formData.get("hashtags") as string;
        if (hashtags) post.hashtags = hashtags.split(",").filter(Boolean);

        await post.save();
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
