"use client";
import { use, useEffect, useState } from "react";
import { CiSearch, CiVideoOn } from "react-icons/ci";
import { IoCallOutline } from "react-icons/io5";
import { FaCircleInfo } from "react-icons/fa6";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { TbMessageShare } from "react-icons/tb";



const Chat = ({ params }: { params: Promise<{id:string}> }) => {

  const {id} = use(params)  
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!id) return;
    setSending(true);
    try {
      const res = await axios.post("/api/chat", { content, receiver: id });
      setMessages((prev) => [...prev, res.data.message]);
      setContent("");
    } catch (error) {
      console.log(error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!id || !session?.user.id) return;
    setLoading(true);
    axios.get(`/api/chat/${id}`).then(res => {
      setMessages(res.data.messages || []);
      // console.error(res.data.messages)
      setLoading(false);
    }).catch(() => setLoading(false));

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_DOMAIN?.replace('https://', 'wss://')}api/ws?userId=${session.user.id}`);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.sender === id || message.receiver === id) {
        setMessages((prev) => prev.some((m: any) => m._id === message._id) ? prev : [...prev, message]);
      }
    };
    return () => ws.close();
  }, [id, session?.user.id]);

  if (!id) return <MsgDemo />;

  return (
    <main className="relative md:w-1/2 min-h-screen mb-12">
      <section className="border-b border-b-zinc-600 px-4 py-2 flex items-center justify-between">
        <div className="flex gap-3">
          <div className="h-12 w-12 relative rounded-full">
            <Image src="https://images.unsplash.com/photo-1565194637906-8f45f3351a5d" alt="avatar" fill className="rounded-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{messages[0]?.receiver.fullName|| "fullName"}</h2>
            <h2 className="text-sm text-zinc-300">{ messages[0]?.receiver.username ||"username"}</h2>
          </div>
        </div>
        <div className="flex gap-3">
          <CiVideoOn size={22} />
          <IoCallOutline size={22} />
          <FaCircleInfo size={22} />
        </div>
      </section>
      <section className="p-4 h-[70vh] overflow-hidden">
        {loading ? <p className="text-center text-zinc-400">Loading...</p> : messages.length === 0 ? <p className="text-center text-zinc-400">No messages</p> : messages.map((msg) => (
          <div key={msg._id} className={`mb-2 flex ${msg.sender === session?.user.id ? "justify-end" : "justify-start"}`}>
            <p className={`px-3 py-2 rounded-lg max-w-xs ${msg.sender === session?.user.id ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-200"}`}>{msg.content}</p>
          </div>
        ))}
      </section>
      <section className="bg-[#0c1014] w-full mt-4 rounded-2xl py-3 flex items-center justify-between absolute md:bottom-6 bottom-26 px-4">
        <div className="flex items-center gap-4 w-full">
          <CiSearch size={18} />
          <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message..." className="outline-none bg-transparent w-full" />
        </div>
        <button onClick={handleSubmit} disabled={sending} className="bg-blue-600 px-3 py-1 rounded-lg">{sending ? "sending..." : "send"}</button>
      </section>
    </main>
  );
};

export default Chat

const MsgDemo = () => (
  <main className="flex flex-col items-center justify-center w-full min-h-screen gap-2">
    <TbMessageShare size={40} />
    <h2>Your messages</h2>
    <p>Send private photos and messages to a friend or group.</p>
    <button className="font-bold bg-[#4a5df9] px-2 py-1 rounded-lg">Send message</button>
  </main>
);
