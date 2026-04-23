import mongoose from "mongoose"
import User from "@/Models/user.Model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/nextAuth";
import { createNotification } from "@/lib/notification";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const { userId } =await  params;

  if (!userId) {
    return NextResponse.json(
      { message: "user ID is required!" },
      { status: 400 },
    );
  }

  try {
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return NextResponse.json(
        { message: "User to follow not found" },
        { status: 404 },
      );
    }

    const loginUser = await User.findById(session.user.id);
    if (!loginUser) {
      return NextResponse.json(
        { message: "Login user not found" },
        { status: 404 },
      );
    }

    const isFollowing = loginUser.following.some(
      (id: any) => id.toString() === userToFollow._id.toString(),
    );

    if (isFollowing) {
      loginUser.following = loginUser.following.filter(
        (id: any) => id.toString() !== userToFollow._id.toString(),
      );

      userToFollow.followers = userToFollow.followers.filter(
        (id: any) => id.toString() !== loginUser._id.toString(),
      );

      loginUser.friends = loginUser.friends.filter(
        (id: any) => id.toString() !== userToFollow._id.toString(),
      );

      userToFollow.friends = userToFollow.friends.filter(
        (id: any) => id.toString() !== loginUser._id.toString(),
      );
    } else {
      loginUser.following.push(userToFollow._id);
      userToFollow.followers.push(loginUser._id);

      const theyFollowBack = userToFollow.following.some(
        (id: any) => id.toString() === loginUser._id.toString(),
      );

      if (theyFollowBack) {
        loginUser.friends.push(userToFollow._id);
        userToFollow.friends.push(loginUser._id);
      }
    }

    await loginUser.save();
    await userToFollow.save();

    const isFriend = loginUser.friends.some(
      (id: any) => id.toString() === userToFollow._id.toString(),
    );

    if (!isFollowing) {
      await createNotification({
        sender: new mongoose.Types.ObjectId(session.user.id),
        receiver: new mongoose.Types.ObjectId(userToFollow._id),
        type: "follow",
      });
    }

    return NextResponse.json(
      {
        success: true,
        following: !isFollowing,
        isFriend,
        message: isFollowing
          ? "Unfollowed"
          : isFriend
          ? "Followed - now you both are friends"
          : "Followed",
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}