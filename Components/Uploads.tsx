"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useCallback, useRef, useState, useEffect, DragEvent } from "react";
import { IoArrowBack, IoCloseCircle, IoLocationOutline } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { useToast } from "./ToastProvider";

type UploadMode = "post" | "story";
const MAX_CAPTION = 2_200;
const MAX_MB = 100;

const fmt = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`;

const tags = (t: string) => t.match(/#(\w+)/g)?.map(h => h.slice(1).toLowerCase()) ?? [];

const Avatar = ({ src, name }: { src: string | null; name: string }) =>
    src ? (
        <Image src={src} alt={name} width={32} height={32} className="w-full h-full object-cover" />
    ) : (
        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-linear-to-br from-purple-500 to-pink-500">
            {name[0]?.toUpperCase()}
        </div>
    );

const Toggle = ({ label, desc, checked, onToggle }: { label: string; desc: string; checked: boolean; onToggle: () => void }) => (
    <div className="flex items-center justify-between">
        <div>
            <p className="text-white text-sm font-medium">{label}</p>
            <p className="text-[#8a8f9e] text-xs mt-0.5">{desc}</p>
        </div>
        <button type="button" role="switch" aria-checked={checked} onClick={onToggle}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${checked ? "bg-white" : "bg-[#3a3d44]"}`}>
            <span className={`absolute top-0.75 left-0.75 w-4.5 h-4.5 rounded-full transition-transform duration-200 ${checked ? "translate-x-5 bg-black" : "bg-[#8a8f9e]"}`} />
        </button>
    </div>
);

const DropZone = ({ type, onFile, onError }: { type: UploadMode; onFile: (f: File) => void; onError: (m: string) => void }) => {
    const ref = useRef<HTMLInputElement>(null);
    const [drag, setDrag] = useState(false);

    const pick = useCallback((files: FileList | null) => {
        const f = files?.[0];
        if (!f) return;
        if (f.size > MAX_MB * 1024 * 1024) { onError(`Max ${MAX_MB} MB allowed.`); return; }
        onFile(f);
    }, [onFile, onError]);

    const drop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files); };

    return (
        <div role="button" tabIndex={0} aria-label="Upload media"
            onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={drop}
            onClick={() => ref.current?.click()} onKeyDown={e => e.key === "Enter" && ref.current?.click()}
            className={`flex flex-col items-center justify-center gap-6 px-10 py-16 rounded-b-2xl cursor-pointer outline-none transition-colors duration-200 border-2 ${drag ? "bg-[#1877f2]/10 border-dashed border-[#1877f2]" : "border-transparent"}`}>
            <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-[#1877f2]/10 animate-pulse" />
                <MdOutlinePhotoSizeSelectActual size={36} className="text-white relative z-10" />
                <HiOutlineVideoCamera size={22} className="text-[#1877f2] absolute bottom-0 right-0 z-20 bg-[#1c1f23] rounded-full p-0.5" />
            </div>
            <div className="text-center space-y-1">
                <p className="text-[18px] font-light text-white">{drag ? "Drop to upload" : "Select a photo or video"}</p>
                <p className="text-[#8a8f9e] text-xs">{type === "story" ? "Stories disappear after 24 hours" : "Supports JPG, PNG, MP4, MOV · Max 100 MB"}</p>
            </div>
            <button type="button" onClick={e => { e.stopPropagation(); ref.current?.click(); }}
                className="bg-[#1877f2] hover:bg-[#1468d8] text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all duration-150 hover:-translate-y-px shadow-lg shadow-[#1877f2]/20">
                Select From Computer
            </button>
            <input ref={ref} type="file" accept="image/*,video/*" className="hidden" onChange={e => pick(e.target.files)} />
        </div>
    );
};

const Uploads: React.FC<{ type: UploadMode }> = ({ type }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToast();
    const fileRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState("");
    const [location, setLocation] = useState("");
    const [allowComments, setAllowComments] = useState(true);
    const [hideLikes, setHideLikes] = useState(false);

    const isPost = type === "post";
    const isVideo = file?.type.startsWith("video/") ?? false;
    const username = (session?.user as any)?.username ?? session?.user?.name ?? "you";
    const avatar = session?.user?.image ?? null;

    useEffect(() => {
        if (!file) { setPreview(null); return; }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    useEffect(() => {
        if (!submitting) { setProgress(0); return; }
        const id = setInterval(() => setProgress(p => p >= 85 ? p : p + Math.random() * 8), 300);
        return () => clearInterval(id);
    }, [submitting]);

    const handleFile = useCallback((f: File) => { setFile(f); setError(null); }, []);
    const handleRemove = () => { setFile(null); setPreview(null); setError(null); if (fileRef.current) fileRef.current.value = ""; };

    const handleSubmit = async () => {
        if (!file || submitting) return;
        setSubmitting(true); setError(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            if (isPost) {
                fd.append("caption", caption);
                fd.append("location", location);
                fd.append("hashtags", tags(caption).join(","));
                fd.append("allowComments", String(allowComments));
                fd.append("hideLikes", String(hideLikes));
            }
            const res = await fetch(isPost ? "/api/posts" : "/api/stories", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) { setError(data?.error ?? data?.message ?? "Upload failed."); return; }
            setProgress(100);
            await new Promise(r => setTimeout(r, 400));
            router.push("/"); router.refresh();
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="w-full min-h-screen flex  items-center justify-center bg-black p-4">
            <div className={`bg-[#1c1f23] rounded-2xl overflow-hidden border border-[#2a2d33] shadow-[0_24px_80px_rgba(0,0,0,0.8)] transition-all duration-500 w-full max-w-130 ${isPost && file ? "md:w-220" : ""}`}>

                <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#2a2d33]">
                    {file ? <button type="button" onClick={handleRemove} aria-label="Go back" className="text-white hover:text-[#a0a6b1] transition-colors cursor-pointer"><IoArrowBack size={22} /></button> : <div className="w-6" />}
                    <h1 className="text-[15px] font-bold text-white tracking-[0.2px]">{isPost ? "Create new post" : "Create new story"}</h1>
                    {file ? (
                        <button type="button" onClick={handleSubmit} disabled={submitting}
                            className="text-[#1877f2] hover:text-[#1468d8] text-sm font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                            {submitting ? "Sharing…" : "Share"}
                        </button>
                    ) : <div className="w-6" />}
                </div>

                {submitting && (
                    <div className="w-full h-0.5 bg-[#2a2d33]">
                        <div className="h-full bg-[#1877f2] transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-b border-red-500/20">
                        <IoCloseCircle size={16} className="text-red-400 shrink-0" />
                        <p className="text-red-400 text-xs flex-1">{error}</p>
                        <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-300 cursor-pointer"><IoCloseCircle size={14} /></button>
                    </div>
                )}

                {!file ? <DropZone type={type} onFile={handleFile} onError={setError} /> : (
                    <div className={`flex flex-col md:flex-row ${isPost ? "h-auto md:h-140" : "h-auto md:h-130"}`}>

                        <div className={`relative bg-black overflow-hidden shrink-0 w-full ${isPost ? "md:w-125 h-72 md:h-auto" : "h-[50vh] max-h-[calc(100vh-10rem)] md:h-130"}`}>
                            {isVideo ? (
                                <video src={preview!} controls playsInline className="absolute inset-0 w-full h-full object-contain" />
                            ) : preview ? (
                                <Image src={preview} alt={file.name} fill sizes="500px" className="object-contain" />
                            ) : null}

                            {!isPost && (
                                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-5">
                                    <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2a2d33] shrink-0 ring-2 ring-[#1877f2]">
                                            <Avatar src={avatar} name={username} />
                                        </div>
                                        <span className="text-white text-sm font-semibold drop-shadow">{username}</span>
                                    </div>
                                    <button type="button" onClick={() => fileRef.current?.click()} className="text-[#1877f2] text-xs font-semibold cursor-pointer hover:text-[#1468d8]">Change</button>
                                        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {isPost && (
                            <div className="flex-1 flex flex-col border-t border-[#2a2d33] md:border-t-0 md:border-l overflow-y-auto min-w-0">
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2d33]">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2a2d33] shrink-0"><Avatar src={avatar} name={username} /></div>
                                    <span className="text-white text-sm font-semibold">{username}</span>
                                </div>

                                <div className="px-4 py-3 border-b border-[#2a2d33]">
                                    <textarea value={caption} onChange={e => setCaption(e.target.value.slice(0, MAX_CAPTION))}
                                        placeholder="Write a caption…" rows={7} aria-label="Caption"
                                        className="w-full bg-transparent text-white text-sm placeholder-[#8a8f9e] resize-none outline-none leading-relaxed" />
                                    <div className="flex items-center justify-between mt-1">
                                        <button type="button" aria-label="Add emoji" className="text-[#8a8f9e] hover:text-white transition-colors cursor-pointer"><BsEmojiSmile size={18} /></button>
                                        <span className="text-[#8a8f9e] text-xs">{caption.length}/{MAX_CAPTION}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2d33]">
                                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Add Location"
                                        aria-label="Location" className="w-full bg-transparent text-white text-sm placeholder-[#8a8f9e] outline-none" />
                                    <IoLocationOutline size={18} className="text-[#8a8f9e] shrink-0 ml-2" />
                                </div>

                                <div className="px-4 py-3 border-b border-[#2a2d33] flex flex-col gap-4">
                                    <p className="text-white text-sm font-semibold">Advanced settings</p>
                                    <Toggle label="Turn off commenting" desc="Turn off comments for this post" checked={!allowComments} onToggle={() => setAllowComments(v => !v)} />
                                    <Toggle label="Hide like count" desc="Only you will see the total number of likes" checked={hideLikes} onToggle={() => setHideLikes(v => !v)} />
                                </div>

                                <div className="px-4 py-3 flex items-center gap-3 mt-auto border-t border-[#2a2d33]">
                                    <div className="relative w-8 h-8 rounded-lg bg-[#252830] shrink-0 overflow-hidden border border-[#2a2d33]">
                                        {isVideo ? <div className="w-full h-full flex items-center justify-center"><HiOutlineVideoCamera size={16} className="text-[#8a8f9e]" /></div>
                                            : preview ? <Image src={preview} alt="thumb" fill sizes="32px" className="object-cover rounded-lg" /> : null}
                                    </div>
                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                        <p className="text-white text-xs font-medium truncate">{file.name}</p>
                                        <p className="text-[#8a8f9e] text-[11px]">{isVideo ? "Video" : "Image"} · {fmt(file.size)} · {file.name.split(".").pop()?.toUpperCase()}</p>
                                    </div>
                                    <button type="button" onClick={() => fileRef.current?.click()} className="text-[#1877f2] hover:text-[#1468d8] text-xs font-semibold shrink-0 cursor-pointer">Change</button>
                                    <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};

export default Uploads;
