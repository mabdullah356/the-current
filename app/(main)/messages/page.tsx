"use client";
import { useEffect, useState } from "react";
import { BiDownArrowAlt, FaRegEdit } from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import { CiVideoOn, IoCallOutline, FaCircleInfo } from "react-icons/io5";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { TbMessageShare } from "react-icons/tb";

interface User {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string;
}

const Messages = () => {
  const [currUser, setCurrUser] = useState<User | null>(null);
  return (
    <main className="flex w-full min-h-screen gap-8">
      <section className="w-1/3">
        <AllUsers data={setCurrUser} />
      </section>
      <section className="w-2/3">
        <CurrUser data={currUser} />
      </section>
    </main>
  );
};

export default Messages;

const AllUsers = ({ data }: { data: (user: User) => void }) => {
  const [users, setUsers] = useState<User[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    axios.get("/api/users/friends").then(res => setUsers(res.data.friends.friends)).catch(console.log);
  }, []);

  return (
    <main className="flex flex-col justify-center">
      <aside className="w-full flex flex-col">
        <section className="flex items-center justify-between mb-6">
          <h1 className="font-semibold text-lg flex items-center gap-1">
            {session?.user.username}
            <BiDownArrowAlt className="text-xl" />
          </h1>
          <FaRegEdit className="text-xl cursor-pointer hover:text-gray-300 transition" />
        </section>
        <div className="flex items-center bg-[#1a1f24] rounded-xl px-4 py-2 mb-6">
          <CiSearch className="text-gray-400 text-lg" />
          <input type="text" placeholder="Search" className="bg-transparent flex-1 px-3 text-sm placeholder:text-gray-400 outline-none" />
        </div>
      </aside>
      <h2 className="py-2 font-bold text-xl">Messages</h2>
      <section className="flex flex-col gap-4">
        {users?.map((user, i) => (
          <div key={i} className="bg-zinc-800 rounded-2xl flex items-center justify-baseline px-4 py-2 gap-4" onClick={() => data(user)}>
            <div className="h-12 w-12 relative rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <Image src={user?.profilePicture || "https://plus.unsplash.com/premium_photo-1739580360043-f2c498c1d861?w=600"} alt={user.fullName} fill className="object-cover rounded-full h-full w-full p-1" />
            </div>
            <div>
              <h2 className="font-bold">{user.fullName}</h2>
              <p className="line-clamp-1 text-sm text-zinc-500">{"This is my last message"}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

const CurrUser = ({ data }: { data: User | null }) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!data?._id) return;
    setSending(true);
    try {
      const res = await axios.post("/api/chat", { content, receiver: data._id });
      setMessages((prev) => [...prev, res.data.message]);
      setContent("");
    } catch (error) {
      console.log(error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!data?._id || !session?.user.id) return;
    setLoading(true);
    axios.get(`/api/chat/${data._id}`).then(res => {
      setMessages(res.data.messages || []);
      setLoading(false);
    }).catch(() => setLoading(false));

    const ws = new WebSocket(`ws://localhost:3000/api/ws?userId=${session.user.id}`);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.sender === data._id || message.receiver === data._id) {
        setMessages((prev) => prev.some((m: any) => m._id === message._id) ? prev : [...prev, message]);
      }
    };
    return () => ws.close();
  }, [data?._id, session?.user.id]);

  if (!data) return <MsgDemo />;

  return (
    <main className="relative h-full">
      <section className="border-b border-b-zinc-600 px-4 py-2 flex items-center justify-between">
        <div className="flex gap-3">
          <div className="h-12 w-12 relative rounded-full">
            <Image src="https://images.unsplash.com/photo-1565194637906-8f45f3351a5d" alt="avatar" fill className="rounded-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{data.fullName}</h2>
            <h2 className="text-sm text-zinc-300">{data.username}</h2>
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
      <section className="bg-[#0c1014] w-full mt-4 rounded-2xl py-3 flex items-center justify-between absolute bottom-4 px-4">
        <div className="flex items-center gap-4 w-full">
          <CiSearch size={18} />
          <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message..." className="outline-none bg-transparent w-full" />
        </div>
        <button onClick={handleSubmit} disabled={sending} className="bg-blue-600 px-3 py-1 rounded-lg">{sending ? "sending..." : "send"}</button>
      </section>
    </main>
  );
};

const MsgDemo = () => (
  <main className="flex flex-col items-center justify-center w-full min-h-screen gap-2">
    <TbMessageShare size={40} />
    <h2>Your messages</h2>
    <p>Send private photos and messages to a friend or group.</p>
    <button className="font-bold bg-[#4a5df9] px-2 py-1 rounded-lg">Send message</button>
  </main>
);
