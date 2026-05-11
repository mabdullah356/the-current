"use client";
import { useEffect, useState } from "react";
import { BiDownArrowAlt } from "react-icons/bi";
import { FaRegEdit } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string;
}

const Messages = () => {
  return (
    <main className="flex w-full min-h-screen gap-8">
        <AllUsers  />
    </main>
  );
};

export default Messages;

const AllUsers = () => {

  const router = useRouter()
  const [users, setUsers] = useState<User[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    axios.get("/api/users").then(res => setUsers(res.data.data)).catch(() => {});
  }, []);

  return (
    <main className="w-full md:w-1/2 flex flex-col justify-center">
      <aside className="w-full flex flex-col">
        <section className="flex items-center justify-between mb-6">
          <h1 className="font-semibold text-lg flex items-center gap-1">
            {session?.user.username}
            <BiDownArrowAlt className="text-xl" />
          </h1>
          <FaRegEdit className="text-xl cursor-pointer hover:text-gray-300 transition" />
        </section>
        <div className="flex items-center bg-black border border-zinc-800 rounded-xl px-4 py-2 mb-6">
          <CiSearch className="text-gray-400 text-lg" />
          <input type="text" placeholder="Search" className="bg-transparent flex-1 px-3 text-sm placeholder:text-gray-400 outline-none" />
        </div>
      </aside>
      <h2 className="py-2 font-bold text-xl">Messages</h2>
      <section className="flex flex-col gap-4">
        {users?.map((user, i) => (
          <div 
          key={i}
          onClick={user._id === session?.user?.id ? undefined : ()=>router.push(`/messages/chat/${user._id}`)}
          className={`rounded-2xl flex items-center justify-baseline px-4 py-2 gap-4 ${user._id === session?.user?.id ? 'bg-white/5 cursor-default' : 'bg-black border border-zinc-800 cursor-pointer'}`}>
            <div className="h-12 w-12 relative rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <Image src={user?.profilePicture || "https://plus.unsplash.com/premium_photo-1739580360043-f2c498c1d861?w=600"} alt={user.fullName} fill className="object-cover rounded-full h-full w-full p-1" />
            </div>
            <div>
              <h2 className="font-bold flex items-center gap-1">
                {user.fullName}
                {user._id === session?.user?.id && <span className="text-[10px] text-gray-400 font-medium">ME</span>}
              </h2>
              <p className="line-clamp-1 text-sm text-zinc-500">{"This is my last message"}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

