"use client"
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

type UserSuggestion = {
  _id: string
  username: string
  fullName: string
  profilePicture: string
  followers?: string[]
  following?: string[]
  friends?: string[]
}

const AsideBar = () => {
  const {data:session} = useSession();
  const [users, setUsers] = useState<UserSuggestion[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAllUsers = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/api/users");
      if (res.data.success) {
        setUsers(res.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchAllUsers()
  }, [])

  const handleFollow = async (id:string) => {
      try {
       const res =  await axios.post(`/api/users/follow/${id}`);
        alert(res.data.message);

      } catch (error) {
        console.log(error);
      }
  };

  const handleRelation = (user: UserSuggestion): string => {
    if (!user || !session?.user?.id) return "Follow";

    if (user.friends?.includes(session.user.id)) {
      return "Friends";
    }

    if (user.following?.includes(session.user.id)) {
      return "Following";
    }

    return "Follow";
  };

  return (
    <aside className="w-full max-w-sm p-4">
      <h2 className='font-semibold py-4 font-serif text-lg'>Suggested for you</h2>
      <section className='flex flex-col gap-4'>
        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-zinc-800" />
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 bg-zinc-800 rounded" />
                    <div className="h-3 w-16 bg-zinc-800 rounded" />
                  </div>
                </div>
                <div className="h-8 w-16 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <section className="flex items-center justify-between" key={user._id}>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden border border-zinc-800">
                  <Image
                    src={user.profilePicture || ""}
                    alt={user.fullName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <h2 className="font-semibold text-sm">{user.fullName}</h2>
                  <p className="text-gray-500 text-xs">@{user.username}</p>
                </div>
              </div>
              <button 
              onClick={()=>handleFollow(user._id)}
              className="text-[#0095f6] hover:text-[#1877f2] text-xs font-bold transition-colors">
                {handleRelation(user)}
              </button>
            </section>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">No suggestions found</p>
        )}
      </section>
    </aside>
  )
}

export default AsideBar