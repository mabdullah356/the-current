"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IoArrowBack, IoLocationOutline } from "react-icons/io5";
import axios from "axios";
import { useToast } from "@/Components/ToastProvider";

interface Post {
  caption: string;
  location: string;
  media: { url: string }[];
  user: { username: string; profilePicture?: string };
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    try {
      const res = await axios.get(`/api/posts/${id}`);
      setPost(res.data);
      setCaption(res.data.caption || "");
      setLocation(res.data.location || "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("caption", caption);
      formData.append("location", location);
      formData.append("hashtags", (caption.match(/#(\w+)/g)?.map(h => h.slice(1).toLowerCase()) ?? []).join(","));
      await axios.put(`/api/posts/${id}`, formData);
      router.back();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-medium">Loading...</div>;
  if (!post) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-medium">Post not found.</div>;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="bg-[#1c1f23] w-full max-w-4xl rounded-xl overflow-hidden border border-[#2a2d33] flex flex-col md:flex-row h-[600px] shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 md:hidden border-b border-[#2a2d33]">
          <button onClick={() => router.back()} className="p-1"><IoArrowBack size={24} /></button>
          <span className="font-bold text-sm">Edit info</span>
          <button onClick={handleSave} disabled={saving} className="text-[#1877f2] font-bold text-sm active:opacity-50">{saving ? "Saving..." : "Done"}</button>
        </div>

        <div className="relative bg-black flex-1 md:w-[60%] group">
          <Image src={preview || post.media[0].url} alt="Post" fill className="object-contain" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 hover:bg-black/80 px-4 py-2 rounded-lg text-xs font-semibold backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100"
          >
            Change Image
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        <div className="flex-1 md:w-[40%] flex flex-col border-l border-[#2a2d33]">
          <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-[#2a2d33]">
            <button onClick={() => router.back()} className="p-1 hover:bg-[#2a2d33] rounded-full transition-colors"><IoArrowBack size={24} /></button>
            <span className="font-bold">Edit info</span>
            <button onClick={handleSave} disabled={saving} className="text-[#1877f2] font-bold hover:text-white transition-colors">{saving ? "Saving..." : "Done"}</button>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden relative ring-1 ring-white/10">
              <Image src={post.user.profilePicture || "/default-avatar.png"} alt="Avatar" fill className="object-cover" />
            </div>
            <span className="font-bold text-sm">{post.user.username}</span>
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="flex-1 bg-transparent p-4 text-sm outline-none resize-none placeholder-gray-500"
          />

          <div className="border-t border-[#2a2d33] p-4 flex items-center gap-2">
            <IoLocationOutline size={20} className="text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="bg-transparent text-sm outline-none flex-1 placeholder-gray-500"
            />
          </div>
        </div>
      </div>
    </main>
  );
}