"use client"
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { use } from 'react';
import Image from 'next/image';
import { UserSuggestion } from '@/Components/AsideBar';
import { useSession } from 'next-auth/react';
import { useToast } from '@/Components/ToastProvider';
import { useRouter } from 'next/navigation';

export default  function User  ({ params }: { params: Promise<{ username: string }> }) {

    const {username} = use(params);
    const [user,setUser] = useState();
    const [posts,setPosts] = useState([]);
    const [loading,setLoading] = useState(false);

    const fetchUser = async()=>{
        
        try {
            setLoading(true)
            const res = await axios.get(`/api/users/${username}`);
            setUser(res.data.user);
            setPosts(res.data.posts);

    } catch {
    }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        fetchUser()
    },[])
    

  return (
    <main>
        {loading && (
            <SkeletonLoading/>
        )}

        {user && (
            <UserProfile user={user} posts={posts}/>
        )}
    </main>
  )
};


function UserProfile({user,posts}:{user:any,posts:any}){

    const router = useRouter();
    const {data:session} = useSession();
    const { showToast } = useToast();
    const [relation,setRelation] = useState("Follow");

    const handleRelation = (userObj: UserSuggestion): string => {
      if (!userObj || !session?.user?.id) return "Follow";

      if (userObj.friends?.some((id: any) => id.toString() === session.user.id)) {
        return "Friends";
      }

      if (userObj.following?.some((id: any) => id.toString() === session.user.id)) {
        return "Following";
      }

      return "Follow";
    };  
    
    const handleFollow = async (id:string) => {
      try {
       const res =  await axios.post(`/api/users/follow/${id}`);
      showToast(res.data.message, "success");
      
      // Update relation based on API response
      if (res.data.isFriend) {
        setRelation("Friends");
      } else if (res.data.following) {
        setRelation("Following");
      } else {
        setRelation("Follow");
      }
    } catch {
      }
  };

    // Update relation when user or session changes
    React.useEffect(() => {
      setRelation(handleRelation(user));
    }, [user, session]);



    return (
    <main className="min-h-screen bg-black text-white p-4">

      <div className="flex items-center gap-4">

        <div className='h-22 w-22 relative rounded-full'>
            <Image
                src={user?.profilePicture}
                alt={user.fullName}
                fill
                className='object-contains w-full h-full rounded-full'
                />
        </div>

        <div className="flex flex-1 justify-around">
          <div className="text-center">
            <div className="text-lg font-bold">{posts?.length || 0}</div>
            <div className="text-sm text-zinc-400">posts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{user?.followers?.length || 0}</div>
            <div className="text-sm text-zinc-400">followers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{user?.following?.length || 0}</div>
            <div className="text-sm text-zinc-400">following</div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="font-bold text-lg">{user?.fullName}</div>
        <div className="text-zinc-400">{user?.bio || 'No bio'}</div>
      </div>

      {user._id !== session?.user?.id && (
      <div className="mt-4 flex gap-2">
        <button 
        onClick={()=>handleFollow(user._id)}
        className="flex-1 h-8 bg-blue-600 rounded-lg hover:bg-blue-700">{relation}</button>
        <button 
          onClick={()=>router.push(`/messages/chat/${user._id}`)}
        className="flex-1 h-8 bg-white/10 rounded-lg hover:bg-white/20">Message</button>
      </div>
      )}

      <div className="mt-6 flex gap-4 overflow-hidden">
        {posts?.length > 0 ?(
            posts.map((post:any, i:number) => (
          <div key={i} className="flex flex-col items-center gap-2">
            {post.media[0].type=="image" ? (
                     <div className='h-22 w-22 relative rounded-full border-2 p-8'>
            <Image
                src={post.media[0].url}
                alt={user.fullName}
                fill
                className='object-contains w-full h-full rounded-full'
                />
        </div>
            ):(
                <div className='h-22 w-22 border-2 rounded-full p-8'>

                    <video src={post.media[0].url}>
                </video>
                </div>
            )}
           
            <h2 className="text-xs text-zinc-400">{post?.caption?.slice(0, 10)}</h2>
          </div>
        ))
        ):(
            <h1>no post</h1>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-1">
        {posts?.map((post:any, i:number) => (
          <div key={i} className="aspect-square bg-black border border-zinc-800 overflow-hidden">
            {post.media[0].type=="image" ? (
                <div className='h-full w-full relative'>
            <Image
                src={post.media[0].url}
                alt={user.fullName}
                fill
                className='object-contains w-full h-full'
                />
        </div>
            ):(
                <video src={post.media[0].url}>
                </video>                
            )}
            

          </div>
        ))}
      </div>

    </main>
  );
}


function SkeletonLoading() {
  return (
    <main className="min-h-screen bg-black text-white p-4 animate-pulse">

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-white/10" />
        
        <div className="flex flex-1 justify-around">
          <div className="text-center">
            <div className="w-10 h-4 bg-white/10 mx-auto mb-2 rounded" />
            <div className="w-12 h-3 bg-white/10 mx-auto rounded" />
          </div>
          <div className="text-center">
            <div className="w-10 h-4 bg-white/10 mx-auto mb-2 rounded" />
            <div className="w-12 h-3 bg-white/10 mx-auto rounded" />
          </div>
          <div className="text-center">
            <div className="w-10 h-4 bg-white/10 mx-auto mb-2 rounded" />
            <div className="w-12 h-3 bg-white/10 mx-auto rounded" />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="w-32 h-4 bg-white/10 rounded" />
        <div className="w-full h-3 bg-white/10 rounded" />
        <div className="w-3/4 h-3 bg-white/10 rounded" />
      </div>

      <div className="mt-4 flex gap-2">
        <div className="flex-1 h-8 bg-white/10 rounded-lg" />
        <div className="flex-1 h-8 bg-white/10 rounded-lg" />
      </div>

      <div className="mt-6 flex gap-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-white/10" />
            <div className="w-12 h-3 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="aspect-square bg-white/10" />
        ))}
      </div>

    </main>
  );
}
