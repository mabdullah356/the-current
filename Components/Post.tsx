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
import { CommentsList } from "./Comment";
import { IoClose } from "react-icons/io5";
import { FiSend } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

const testComments = [
  {
    _id: "1",
    content: "This is a comment",
    createdAt: new Date().toISOString(),
    isEdited: false,
    userId: {
      _id: "user1",
      username: "john_doe",
      fullName: "John Doe",
      profilePicture: "https://res.cloudinary.com/dujmr03is/image/upload/v1776505140/profile_pictures/oyyiqxs7x3gtoivsaamu.jpg"
    }
  }
];


const Post = ({ post }: any) => {

  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(post?.likes?.length ?? 0);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [curPostInd,setCurPostInd] = useState("");  
  const [comments,setComments] = useState(testComments);
  const [showSharePopUp,setShowSharePopup] = useState(false);


  useEffect(() => {
    if (session?.user?.id && post?.likes) {
      setLiked(post.likes.includes(session.user.id));
    }
  }, [session, post]);

  if (!post) return null;

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    const wasLiked = liked;
    setLikeCount((prev) => prev + (wasLiked ? 0 : 1));
    if (wasLiked) setLiked(false);
    else setLiked(true);
    try {
      const res = await axios.post(`/api/posts/${post._id}/like`);
      if (res.data.message === "Post liked successfully") {
        setLiked(true);
        showToast("Post liked!");
      } else if (res.data.message === "Post un-liked successfully") {
        setLiked(false);
        setLikeCount((prev) => prev - 1);
        showToast("Post unliked");
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount((prev) => prev + (wasLiked ? 0 : -1));
      showToast("Failed to update like", "error");
    } finally {
      setLiking(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const wasSaved = saved;
    setSaved(!wasSaved);
    try {
      const res = await axios.post(`/api/posts/${post._id}/saved`);
      if (res.data.message === "Post saved successfully") {
        setSaved(true);
        showToast("Post saved!");
      } else if (res.data.message === "Post unsaved successfully") {
        setSaved(false);
        showToast("Post unsaved");
      }
    } catch {
      setSaved(wasSaved);
      showToast("Failed to update save", "error");
    } finally {
      setSaving(false);
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


  const handleFetchComment = async (post_id: string)=>{
      setCurPostInd((prev)=> prev === post_id ? "" : post_id);
      try {
        const res = await axios.get(`/api/comment/${post_id}/comments`);
        setComments(res.data.comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
  }


  return (
    <article className="w-full max-w-118 mx-auto border-b border-zinc-800 mb-1">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="p-0.5 rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 shrink-0">
            <div className="bg-black p-0.5 rounded-full">
              <div 
              onClick={()=>router.push(`/user/${post.user.username}`)}
              className="relative h-8 w-8 rounded-full overflow-hidden">
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
            <div 
              onClick={()=>router.push(`/user/${post.user.username}`)}
            className="flex items-center gap-1">
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
        {post.media[0].type=="image"?(

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
        ):(
          <video controls={false} loop className="w-full h-full object-cover">
            <source src={post.media?.[0]?.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )
      }
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
            <button 
            onClick={()=>handleFetchComment(post._id)}
            className="cursor-pointer active:scale-90 transition-transform">
              <FaRegComment className="text-[26px] text-white" />
            </button>
            <button 
            onClick={()=>setShowSharePopup(!showSharePopUp)}
            className="cursor-pointer active:scale-90 transition-transform">
              <PiShareFatLight className="text-[27px] text-white" />
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="cursor-pointer active:scale-90 transition-transform disabled:opacity-50"
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
        {curPostInd && <CommentsList comments={comments} postId={post._id} />}
        {showSharePopUp && (
          <ShareStoryPopUp setShowSharePopup={setShowSharePopup} postId={post._id}/>
        )}
    </article>
  );
};

export default Post;

type ShareStoryPopUpProps = {
  setShowSharePopup: React.Dispatch<React.SetStateAction<boolean>>;
  postId:string
};


export function ShareStoryPopUp({setShowSharePopup , postId}:ShareStoryPopUpProps) {

  const [loading,setLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  const handleShareStory = async () => {

    try {
      setLoading(true);
      await axios.post(`/api/posts/share/${postId}`);
      showToast("Story shared successfully", "success");

    } catch (error) {
      console.log(error);
      showToast("Failed to share story", "error");

    }finally{
          setLoading(false);
      setShowSharePopup(false);

    }

  }


  return (
    <main className="fixed top-1/3 right-6 z-999 w-full max-w-xs shadow-lg p-4 rounded-t-2xl bg-zinc-800 ">
      
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Share this post to your story
        </h2>
        <button 
        onClick={()=>setShowSharePopup(false)}
        className="text-gray-500 text-xl">
          <IoClose />
        </button>
      </div>

      <div className="flex justify-between mt-6">
        <button 
        onClick={()=>setShowSharePopup(false)}
        className="flex items-center gap-2 px-4 py-2 text-gray-200 bg-zinc-600 rounded-lg">
          <IoClose />
          Cancel
        </button>

        <button 
        onClick={()=>handleShareStory()}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
          <FiSend />
        {loading ? "sharing...":"share"}
        </button>
      </div>
      
    </main>
  );
}