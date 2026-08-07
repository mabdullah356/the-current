"use client";
import React, { useState } from "react";
import axios from "axios";
import { FaRegHeart, FaRegComment } from "react-icons/fa";
import { PiShareFatLight } from "react-icons/pi";
import { CiBookmark } from "react-icons/ci";
import { GoVerified } from "react-icons/go";
import Image from "next/image";
import { ShareStoryPopUp } from "./Post";
import { CommentsList } from "./Comment";
import { useToast } from "./ToastProvider";

const Reel = ({ data }: { data: any }) => {
  const { showToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading,setLoading] = useState<boolean>(false);
  const [showSharePopUp,setShowSharePopup] = useState(false);
  const [curPostInd,setCurPostInd] = useState("");  
  const [comments,setComments] = useState([]);
  


  const handleSave = async () => {
    if (saving || !data?._id) return;
    setSaving(true);
    try {
      const res = await axios.post(`/api/posts/${data._id}/saved`);
      setSaved(res.data.message === "Post saved successfully");
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleLike = async (reelId:string) => {

    try {
      setLoading(true);
      const res = await axios.post(`/api/posts/${reelId}/like`);
      if (res.data.message === "Post liked successfully") {
        showToast("Reel liked!", "success");
      } else if (res.data.message === "Post un-liked successfully") {
        showToast("Reel unliked", "info");
      }
    } catch {
      showToast("Failed to like reel", "error");
    } finally {
       setLoading(false); 
    }
  };

  const handleFetchComment = async (post_id: string)=>{
      setCurPostInd((prev)=> prev === post_id ? "" : post_id);
      setLoading(true);
      try {
        const res = await axios.get(`/api/comment/${post_id}/comments`);
        setComments(res.data.comments);
      } catch {
      }finally{
        setLoading(false);
      }
  }


  return (
    <main className="w-full flex flex-col md:flex-row gap-8 justify-center items-center bg-black">
      <div className="relative w-full md:max-w-md h-screen bg-black overflow-hidden">

        <video
          src={data.media[0].url}
          className="w-full h-full object-cover"
          loop
          muted
          autoPlay
          playsInline
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-6 left-4 right-16 text-white space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-full overflow-hidden border border-white/30">
              <Image
                src={data.user.profilePicture}
                alt="profile"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex items-center gap-1 font-semibold text-sm">
              {data.user.username}
              {data.user.isVerified && (
                <GoVerified className="text-blue-500 text-base" />
              )}
            </div>

            <button className="ml-2 px-3 py-1 text-xs font-semibold border border-white rounded-full hover:bg-white hover:text-black transition">
              Follow
            </button>

          </div>

          <p className="text-sm text-white/90">
            Unknown • Original Audio
          </p>
        </div>

        <div className="absolute bottom-6 right-4 flex flex-col items-center gap-6 text-white">
          <button
          onClick={()=>handleLike(data._id)}
          className="flex flex-col items-center text-sm">
            <FaRegHeart className="text-2xl mb-1 cursor-pointer hover:scale-110 transition" />
            {/* {loading && "linking"} */}
            {data.likes.length}
          </button>

          <button 
            onClick={()=>handleFetchComment(data._id)}
          className="flex flex-col items-center text-sm">
            <FaRegComment className="text-2xl mb-1 cursor-pointer hover:scale-110 transition" />
            {loading?"Loading...":comments.length}

          </button>

          <button 
            onClick={()=>setShowSharePopup(!showSharePopUp)}
          className="flex flex-col items-center text-sm">
            <PiShareFatLight className="text-2xl mb-1 cursor-pointer hover:scale-110 transition" />
          </button>

          <div className="flex flex-col items-center text-sm">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-2xl mb-1 cursor-pointer hover:scale-110 transition disabled:opacity-50"
            >
              <CiBookmark className={saved ? "text-blue-400" : "text-white"} />
            </button>
            {saved ? "Saved" : "Save"}
          </div>
        </div>
         {showSharePopUp &&(
           <ShareStoryPopUp setShowSharePopup={setShowSharePopup} postId={data._id}/>
          )} 
               
      </div>
          {curPostInd &&(
            <div className="relative w-full md:max-w-md h-screen bg-black overflow-hidden items-center justify-center flex flex-col">
            <h1 className="text-2xl font-bold text-center pb-8">Comments Section</h1>
          <CommentsList comments={comments} postId={data._id} />

      </div>
      )}
    </main>
  );
};

export default Reel;