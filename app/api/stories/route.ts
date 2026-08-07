import { authOptions } from "@/lib/nextAuth";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import Story from "@/Models/story.Model";
import { connectDB } from "@/lib/mongodb";

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { id?: string } | undefined;

    if (!sessionUser?.id) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Story image or video is required" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult: UploadApiResponse = await new Promise(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "pixelfeed/stories",
              resource_type: "auto",
            },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result);
            },
          )
          .end(buffer);
      },
    );

    const story = await Story.create({
      user: sessionUser.id,
      media: {
        url: uploadResult.secure_url,
        type: uploadResult.resource_type === "video" ? "video" : "image",
      },
    });

    return NextResponse.json(
      {
        message: "Story created successfully",
        story,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized access" },
      { status: 401 },
    );
  }

  await connectDB();

  try {
    const stories = await Story.find()
      .populate("user", "username fullName profilePicture _id")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (stories.length === 0) {
      return NextResponse.json(
        { message: "Stories not found" },
        { status: 404 },
      );
    }

    const formatted = stories.map((s: any) => ({
      id: s._id.toString(),
      type: s.media?.type || "",
      media: s.media?.url || "",
      user: {
        id: s.user?._id?.toString(),
        username: s.user?.username || "",
        fullName: s.user?.fullName || "",
        profilePicture: s.user?.profilePicture || "/default-profile.png",
      },
    }));
    return NextResponse.json(
      { message: "stories found successfully", totalStories: formatted.length, stories: formatted },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}