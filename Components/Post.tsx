"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { PiShareFatLight } from "react-icons/pi";
import { CiBookmark } from "react-icons/ci";
import { BsBookmarkFill, BsThreeDots } from "react-icons/bs";
import { GoVerified } from "react-icons/go";
import axios from "axios";
import { useSession } from "next-auth/react";

const Post = ({ post }: any) => {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(post?.likes?.length ?? 0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (session?.user?.id && post?.likes) {
      setLiked(post.likes.includes(session.user.id));
    }
  }, [session, post]);

  if (!post) return null;

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    setLikeCount((prev) => prev + 1);
    try {
      const res = await axios.post(`/api/posts/${post._id}/like`);
      if (res.data.message === "Post liked successfully") {
        setLiked(true);
      } else if (res.data.message === "Post un-liked successfully") {
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
    } finally {
      setLiking(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  return (
    <article className="w-full max-w-[470px] mx-auto border-b border-zinc-800 mb-1">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="p-0.5 rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 shrink-0">
            <div className="bg-black p-0.5 rounded-full">
              <div className="relative h-8 w-8 rounded-full overflow-hidden">
                <Image
                  src={
                    post.user?.profilePicture ||
                    "https://images.unsplash.com/photo-1702478553542-3aa3c0148543?w=100&auto=format&fit=crop&q=60"
                  }
                  alt={post.user?.username || "User"}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-white">
                {post.user?.username || post.user?.fullName || "unknown"}
              </span>
              <GoVerified className="text-blue-500 text-xs" />
            </div>
            {post.location && (
              <span className="text-xs text-zinc-400">{post.location}</span>
            )}
          </div>
        </div>
        <button className="text-white p-1 cursor-pointer">
          <BsThreeDots />
        </button>
      </div>

      <div className="relative w-full aspect-square bg-zinc-900">
        <Image
          src={
            post.media?.[0]?.url ||
            "https://images.unsplash.com/photo-1772223610205-0a8f53d83b42?w=600&auto=format&fit=crop&q=60"
          }
          alt="Post"
          fill
          sizes="(max-width: 768px) 100vw, 470px"
          priority
          className="object-cover"
        />
      </div>

      <div className="px-3 pt-3 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} disabled={liking} className="cursor-pointer active:scale-90 transition-transform disabled:opacity-50">
              {liked ? (
                <FaHeart className="text-[26px] text-red-500" />
              ) : (
                <FaRegHeart className="text-[26px] text-white" />
              )}
            </button>
            <button className="cursor-pointer active:scale-90 transition-transform">
              <FaRegComment className="text-[26px] text-white" />
            </button>
            <button className="cursor-pointer active:scale-90 transition-transform">
              <PiShareFatLight className="text-[27px] text-white" />
            </button>
          </div>
          <button
            onClick={() => setSaved((prev) => !prev)}
            className="cursor-pointer active:scale-90 transition-transform"
          >
            {saved ? (
              <BsBookmarkFill className="text-[22px] text-white" />
            ) : (
              <CiBookmark className="text-[26px] text-white" />
            )}
          </button>
        </div>

        {likeCount > 0 && (
          <p className="text-sm font-semibold text-white mb-1">
            {likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"}
          </p>
        )}

        {post.caption && (
          <p className="text-sm text-white leading-snug">
            <span className="font-semibold mr-1">
              {post.user?.username || post.user?.fullName || "unknown"}
            </span>
            {post.caption}
          </p>
        )}

        {post.hashtags?.length > 0 && (
          <p className="text-sm text-blue-400 mt-1">
            {post.hashtags.map((tag: string) => `#${tag}`).join(" ")}
          </p>
        )}

        <p className="text-[11px] text-zinc-500 mt-2 uppercase tracking-wide">
          {formatDate(post.createdAt)}
        </p>
      </div>
    </article>
  );
};

export default Post;
