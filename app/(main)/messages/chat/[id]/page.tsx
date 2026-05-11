"use client";
import { use, useEffect, useRef, useState } from "react";
import { CiSearch, CiVideoOn } from "react-icons/ci";
import { IoCallOutline } from "react-icons/io5";
import { FaCircleInfo } from "react-icons/fa6";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { TbMessageShare } from "react-icons/tb";

const Chat = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [receiver, setReceiver] = useState({
    fullName: "loading",
    username: "loading",
    profilePicture:
      "https://images.unsplash.com/photo-1565194637906-8f45f3351a5d",
  });
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const lastTimestampRef = useRef<string | null>(null);

  const handleSubmit = async () => {
    if (!id) return;
    setSending(true);
    try {
      const res = await axios.post("/api/chat", { content, receiver: id });
      setMessages((prev) => [...prev, res.data.message]);
      setContent("");
    } catch {
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!id || !session?.user.id) return;
    setLoading(true);
    lastTimestampRef.current = null;
    axios
      .get(`/api/chat/${id}`)
      .then((res) => {
        const msgs = res.data.messages || [];
        setMessages(msgs);
        setReceiver(res.data.receiver);
        if (msgs.length > 0) {
          lastTimestampRef.current = msgs[msgs.length - 1].createdAt;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, session?.user.id]);

  useEffect(() => {
    if (!id || !session?.user.id) return;
    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      try {
        const since = lastTimestampRef.current;
        const res = await axios.get(
          `/api/chat/${id}/webhook${since ? `?since=${since}` : ""}`,
        );
        const newMessages = res.data.messages || [];
        if (newMessages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m: any) => m._id));
            const filtered = newMessages.filter(
              (m: any) => !existingIds.has(m._id),
            );
            if (filtered.length > 0) {
              const updated = [...prev, ...filtered];
              lastTimestampRef.current =
                filtered[filtered.length - 1].createdAt;
              return updated;
            }
            return prev;
          });
        }
      } catch {
      }
      setTimeout(poll, 3000);
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [id, session?.user.id]);

  if (!id) return <MsgDemo />;
  if (loading) return <ChatSkeleton />;

  return (
    <main className="relative md:w-1/2 min-h-screen mb-12">
      <section className="border-b border-b-zinc-600 px-4 py-2 flex items-center justify-between">
        <div className="flex gap-3">
          <div className="h-12 w-12 relative rounded-full">
            <Image
              src={receiver?.profilePicture}
              alt="avatar"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg">
              {receiver?.fullName || "fullName"}
            </h2>
            <h2 className="text-sm text-zinc-300">
              {receiver?.username || "username"}
            </h2>
          </div>
        </div>
        <div className="flex gap-3">
          <CiVideoOn size={22} />
          <IoCallOutline size={22} />
          <FaCircleInfo size={22} />
        </div>
      </section>
      <section className="p-4 h-[70vh] overflow-auto">
        {messages.length === 0 ? (
          <p className="text-center text-zinc-400">No messages</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`mb-2 flex ${msg.sender === session?.user.id ? "justify-end" : "justify-start"}`}
            >
              <p
                className={`px-3 py-2 rounded-lg max-w-xs ${msg.sender === session?.user.id ? "bg-blue-600 text-white" : "bg-white/10 text-zinc-200"}`}
              >
                {msg.content}
              </p>
            </div>
          ))
        )}
      </section>
      <section className="bg-black border border-zinc-800 w-full mt-4 rounded-2xl py-3 flex items-center justify-between absolute md:bottom-6 bottom-26 px-4">
        <div className="flex items-center gap-4 w-full">
          <CiSearch size={18} />
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Message..."
            className="outline-none bg-transparent w-full"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={sending}
          className="bg-blue-600 px-3 py-1 rounded-lg"
        >
          {sending ? "sending..." : "send"}
        </button>
      </section>
    </main>
  );
};

export default Chat;

const MsgDemo = () => (
  <main className="flex flex-col items-center justify-center w-full min-h-screen gap-2">
    <TbMessageShare size={40} />
    <h2>Your messages</h2>
    <p>Send private photos and messages to a friend or group.</p>
    <button className="font-bold bg-[#4a5df9] px-2 py-1 rounded-lg">
      Send message
    </button>
  </main>
);

const ChatSkeleton = () => (
  <main className="relative md:w-1/2 min-h-screen mb-12">
    <section className="border-b border-b-zinc-600 px-4 py-2 flex items-center justify-between">
      <div className="flex gap-3">
        <div className="h-12 w-12 rounded-full bg-white/10 animate-pulse" />
        <div className="flex flex-col gap-2 py-1">
          <div className="h-5 w-32 rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-6 w-6 rounded bg-white/10 animate-pulse" />
        <div className="h-6 w-6 rounded bg-white/10 animate-pulse" />
        <div className="h-6 w-6 rounded bg-white/10 animate-pulse" />
      </div>
    </section>
    <section className="p-4 h-[70vh] overflow-hidden flex flex-col gap-3">
      <div className="flex justify-start">
        <div className="h-10 w-48 rounded-lg bg-white/10 animate-pulse" />
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-40 rounded-lg bg-white/10 animate-pulse" />
      </div>
      <div className="flex justify-start">
        <div className="h-10 w-56 rounded-lg bg-white/10 animate-pulse" />
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-36 rounded-lg bg-white/10 animate-pulse" />
      </div>
      <div className="flex justify-start">
        <div className="h-10 w-44 rounded-lg bg-white/10 animate-pulse" />
      </div>
    </section>
    <section className="bg-black border border-zinc-800 w-full mt-4 rounded-2xl py-3 flex items-center justify-between absolute md:bottom-6 bottom-26 px-4">
      <div className="flex items-center gap-4 w-full">
        <div className="h-5 w-5 rounded bg-white/10 animate-pulse" />
        <div className="h-5 w-full rounded bg-white/10 animate-pulse" />
      </div>
      <div className="h-8 w-16 rounded-lg bg-white/10 animate-pulse" />
    </section>
  </main>
);
