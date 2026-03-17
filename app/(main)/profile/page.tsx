"use client"
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { MdOutlineGrid3X3 } from "react-icons/md";
import { CiBookmark } from "react-icons/ci";
import { IoHeartDislikeCircleOutline } from "react-icons/io5";
import axios from 'axios';


type userInfo = {
    username: string;
    name: string;
    profilePicture: string;
    followers: string[];
    following: string[];
    posts: string[];
    savedPosts: string[];
    likedPosts: string[];
}

const ProfilePage = () => {

    const fetchUserInfo = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/users/me");
            setUserInfo(res.data.user);
            setPosts(res.data.posts);
        } catch (error: any) {
            console.log(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUserInfo();
    }, [])

    const [userInfo, setUserInfo] = useState<userInfo | null>(null)
    const [loading, setLoading] = useState<boolean | null>(null)
    const [error, setError] = useState(null)
    const [posts, setPosts] = useState([])
    const [favourites, setFavourites] = useState([])
    const [likedPosts, setLikedPosts] = useState([])
    const { data: session, status } = useSession()
    const [tab, setTab] = useState("posts")

    return (
        <main className='max-w-7xl mx-auto p-8'>
            <section className='flex items-center gap-8'>
                <div className='h-28 w-28 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 relative'>
                    <Image src={session?.user?.profilePicture || userInfo?.profilePicture || "/profile.png"} alt="Profile" fill className='object-cover rounded-full p-1' />
                </div>
                <div>
                    <div>
                        <p className='text-3xl font-bold'>{session?.user?.username || userInfo?.username || "loading..."}</p>
                        <p className='text-sm font-light'>{session?.user?.name || userInfo?.name || "loading..."}</p>
                        <p className='text-gray-400 text-xs'>no bio yes</p>
                    </div>
                    <div className='flex gap-4 py-3 font-mono text-sm bg-gray-900 px-3 rounded-xl my-2'>
                        <h3>{posts?.length || 0} posts</h3>
                        <h3>{userInfo?.followers?.length || 0} followers</h3>
                        <h3>{userInfo?.following?.length || 0} following</h3>
                    </div>
                </div>
            </section>

            <section className='flex gap-2 my-4 max-w-xl'>
                <button className='font-bold bg-gray-700 px-4 py-2 rounded-xl w-full hover:bg-gray-600 transition-colors'>Edit Profile</button>
                <button className='font-bold bg-gray-700 px-4 py-2 rounded-xl w-full hover:bg-gray-600 transition-colors'>Share Profile</button>
            </section>

            <div className='flex text-5xl gap-12 py-2 text-center max-w-xl mx-auto'>
                <button onClick={() => setTab("posts")} className={tab === "posts" ? "text-white" : "text-gray-400"}>
                    <MdOutlineGrid3X3 size={32} />
                </button>
                <button onClick={() => setTab("favourites")} className={tab === "favourites" ? "text-white" : "text-gray-400"}>
                    <CiBookmark size={32} />
                </button>
                <button onClick={() => setTab("liked")} className={tab === "liked" ? "text-white" : "text-gray-400"}>
                    <IoHeartDislikeCircleOutline size={32} />
                </button>
            </div>
            <section>
                {tab === "posts" && <Posts data={posts} />}
                {tab === "favourites" && <Favourites data={userInfo?.savedPosts} />}
                {tab === "liked" && <LikedPosts data={userInfo?.likedPosts} />}
            </section>

            
        </main>
    )
}

export default ProfilePage;


function Posts({ data }: any) {


    const [showPost, setShowPost] = useState<any | null>(null)


    const handleOpenPost = (post: any) => {
        setShowPost(post)
    }

    const handleClose = () => {
        setShowPost(null)
    }

    if (!data || data.length === 0) {
        return (
            <section className='h-40'>
                <p className='text-gray-400'>No Posts</p>
            </section>
        )
    }

    return (
        <section className='grid grid-cols-3 gap-4 py-4'>
            {data.map((post: any, i: number) => (
                <div
                    onClick={() => handleOpenPost(post)}
                    className='h-40 w-40 bg-gray-700 rounded-xl relative'
                    key={i}
                >
                    <Image src={post?.media?.[0]?.url || "/default-profile.png"} alt="Post" fill className='object-cover rounded-xl' />
                </div>
            ))}
            {showPost && <ShowPost post={showPost} onClose={handleClose} />}
        </section>
    )
}

function Favourites({ data }: any) {
    if (!data) {
        return (
            <section className='h-40'>
                <p className='text-gray-400'>No Favourites</p>
            </section>
        )
    }
    return (
        <section>
            <div className='flex gap-4 py-3 font-mono text-sm bg-gray-900 px-3 rounded-xl my-2'>
                <h3>{data?.length || 0} posts</h3>
                <h3>100 followers</h3>
                <h3>100 following</h3>
            </div>
        </section>
    )
}

function LikedPosts({ data }: any) {
    if (data?.length == 0) {
        return (
            <section className='h-40'>
                <p className='text-gray-400'>No Liked Posts</p>
            </section>
        )
    }
    return (
        <section>
            <div className='h-40'>
                <h3 className='text-gray-400'>{data?.length || 0} posts</h3>
            </div>
        </section>
    )
}



type ShowPostProps = {
  post: any
  onClose: () => void
}

const ShowPost = ({ post, onClose }: ShowPostProps) => {
  const isVideo = post?.media?.[0]?.type === "video"
  const mediaUrl = post?.media?.[0]?.url || ""
    const { data: session } = useSession()
    if(!session) {
        return <h2>Please sign in to view this content.</h2>;
    }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full md:w-1/2 h-full flex items-center justify-center">
        {isVideo ? (
          <video
            src={mediaUrl}
            controls
            autoPlay
            className="h-full w-full object-contain"
          />
        ) : (
          <Image
            src={mediaUrl}
            alt={post?.user?.fullName || "Post"}
            fill
            className="object-contain"
          />
        )}

        <div className="absolute top-4 left-4 flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white">
            <Image
              src={session?.user?.profilePicture || "/profile.png"}
              alt={session?.user?.fullName || "Post"}
              fill
              className="object-cover w-full h-full"
            />
          </div>
          <span className="text-white font-semibold">
            {session?.user?.fullName || "Post User"}
          </span>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl"
        >
          ✕
        </button>
      </div>
    </div>
  )
}