import { authOptions } from "@/lib/nextAuth";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import Story from "@/Models/story.Model";
import { connectDB } from "@/lib/mongodb";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
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
              folder: "instagram-lite/stories",
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
      user: session.user.id,
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
  } catch (error) {
    console.error("Story Upload Error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {

  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized access" },
      { status: 401 },
    );
  }

  try {
    
    const stories = await Story.find()
      .populate("user", "username fullName profilePicture")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (!stories) {
      return NextResponse.json(
        { message: "Stories not founds" },
        { status: 404 },
      );
    }

    const formatted = stories.map((s: any) => ({
      id: s._id,
      type:s.media.type,
      media: s.media?.url || "",
      isView: s?.viewedBy?.includes(session.user.id) ? true : false,
      user: {
        username: s.user?.username,
        fullName: s.user?.fullName,
        profilePicture: s.user?.profilePicture || "/default-profile.png",
      },
    }));

    return NextResponse.json(
      { message: "stories found successfully", totalStories: formatted.length, stories: formatted },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
}