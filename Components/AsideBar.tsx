"use client"
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from './ToastProvider'

export type UserSuggestion = {
  _id: string
  username: string
  fullName: string
  profilePicture: string
  followers?: string[]
  following?: string[]
  friends?: string[]
}

const AsideBar = () => {

  const router = useRouter()
  const {data:session} = useSession();
  const { showToast } = useToast()
  const [users, setUsers] = useState<UserSuggestion[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAllUsers = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/api/users");
      if (res.data.success) {
        setUsers(res.data.data)
      }
    } catch {
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
       showToast(res.data.message, "success");
       fetchAllUsers();

      } catch (error: any) {
       showToast(error?.response?.data?.error || "Failed to follow user", "error");
      }
  };

  const handleRelation = (user: UserSuggestion): string => {
    if (!user || !session?.user?.id) return "Follow";

    if (user.friends?.some((id) => id.toString() === session.user.id)) {
      return "Friends";
    }

    if (user.following?.some((id) => id.toString() === session.user.id)) {
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
                  <div className="h-12 w-12 rounded-full bg-white/10" />
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 bg-white/10 rounded" />
                    <div className="h-3 w-16 bg-white/10 rounded" />
                  </div>
                </div>
                <div className="h-8 w-16 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <section className="flex items-center justify-between" key={user._id}>
              <div className="flex items-center gap-3">
                <div 
                onClick={()=>router.push(user._id === session?.user?.id ? `/profile` : `/user/${user.username}`)}
                className="relative h-12 w-12 rounded-full overflow-hidden border border-white/10">
                  <Image
                    src={user.profilePicture || ""}
                    alt={user.fullName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div 
                onClick={()=>router.push(user._id === session?.user?.id ? `/profile` : `/user/${user.username}`)}
                className="flex flex-col leading-tight">
                  <h2 className="font-semibold text-sm flex items-center gap-1">
                    {user.fullName}
                    {user._id === session?.user?.id && <span className="text-[10px] text-gray-400 font-medium">ME</span>}
                  </h2>
                  <p className="text-zinc-500 text-xs">@{user.username}</p>
                </div>
              </div>
              {user._id !== session?.user?.id && (
              <button 
              onClick={()=>handleFollow(user._id)}
              className="text-[#0095f6] hover:text-[#1877f2] text-xs font-bold transition-colors">
                {handleRelation(user)}
              </button>
              )}
            </section>
          ))
        ) : (
          <p className="text-zinc-500 text-sm italic">No suggestions found</p>
        )}
      </section>
    </aside>
  )
}

export default AsideBar
