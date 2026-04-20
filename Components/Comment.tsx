"use client";
import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export type CommentType = {
  _id: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
  userId: {
    _id: string;
    username: string;
    fullName: string;
    profilePicture: string;
  };
};

export function Comment({ comment ,postId}: { comment: CommentType; postId: string }) {
  const {data:session} = useSession();
  const [loading,setLoading] = useState(false);

  const handleDeleteComment = async (commentId: string)=>{
  
    try {
      setLoading(true);
      await axios.delete(`/api/comment/${postId}/comments/${commentId}`);
        alert("Comment deleted successfully!");
        comment.content = "This comment has been deleted.";
    } catch (error) {
        console.error("Error deleting comment:", error);
    } finally {
        setLoading(false);
    }
  };


  return (
    <div className="flex items-start gap-3 py-3">
      <Image
        src={comment.userId.profilePicture}
        alt={comment.userId.username}
        width={36}
        height={36}
        className="rounded-full object-cover"
      />

      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-white">
          {comment.userId.fullName || comment.userId.username}
        </p>

        <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2">
          <p className="text-sm text-zinc-200 leading-relaxed">
            {comment.content}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>
            {new Date(comment.createdAt).toLocaleString()}
          </span>
          {comment.isEdited && (
            <span className="italic text-zinc-400">(edited)</span>
          )}
        </div>
      </div>
      {comment.userId._id === session?.user.id && (
        <button 
        onClick={()=>handleDeleteComment(comment._id)}
        className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg text-sm font-medium">
          {loading ? "deleting... " : "Delete"}
        </button>
      )}
        
    </div>
  );
}



export function CommentsList({
  comments,
  postId,
}: {
  comments: CommentType[];
  postId: string;
}) {
  const commentList = comments || [];

  return (
    <div className="space-y-2">
        <>
        <CreateComment postId={postId} />
        </>
      {commentList.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-4">No comments yet. Be the first to comment!</p>
       ) : (      
      commentList.map((c) => (
        <Comment key={c._id} comment={c} postId={postId} />
      ))
       )}
    </div>
  );
};



function CreateComment({ postId }: { postId: string }) {
  const [content,setContent] = useState<string>("");
  const [loading,setLoading] = useState(false);  
    
  const handleCreateComment = async ()=>{
    if (!content.trim()) return;
    try {
        
        setLoading(true);
        const res = await axios.post("/api/comment", { content, postId });
        setContent("");
        alert("Comment created successfully!");
    } catch (error) {
        console.error("Error creating comment:", error);
    } finally {
        setLoading(false);
    }   

} 
  return (
    <div className="flex items-center gap-3">
      <input 
          type="text"
          value={content}
          onChange={(e)=>setContent(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-zinc-800/60 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        className="bg-white text-black px-2 py-1.5 rounded-lg font-semibold text-sm"
        disabled={!content.trim()}
        onClick={handleCreateComment}
      >
       {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );   
}