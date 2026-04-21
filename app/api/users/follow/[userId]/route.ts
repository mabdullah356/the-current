import User from "@/Models/user.Model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/nextAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
    
    const session = await getServerSession(authOptions);
    if(!session){
        return NextResponse.json({message:"unauthorized"},{status:401});
    }
    
  const { userId } = await params;
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
      (id) => id.toString() === userToFollow._id.toString(),
    );

    if (isFollowing) {
      loginUser.following.pull(userToFollow._id);
      userToFollow.followers.pull(loginUser._id);
       loginUser.friends.pull(userToFollow._id);
      userToFollow.friends.pull(loginUser._id);

    } else {
      loginUser.following.push(userToFollow._id);
      userToFollow.followers.push(loginUser._id);
      loginUser.friends.push(userToFollow._id);
        userToFollow.friends.push(loginUser._id);
    }

    await loginUser.save();
    await userToFollow.save();
    
    return NextResponse.json({
      success: true,
      following: !isFollowing,
      message: isFollowing ? "Unfollowed" : "Followed - now you both are friends",
    },{status:200});

  } catch (error) {
    
    console.log(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
