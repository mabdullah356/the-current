"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MdOutlineGrid3X3 } from "react-icons/md";
import { CiBookmark } from "react-icons/ci";
import { IoHeartDislikeCircleOutline } from "react-icons/io5";
import { FiEdit2, FiShare2, FiTrash2, FiX, FiAlertTriangle, FiLoader } from "react-icons/fi";
import axios from "axios";
import Link from "next/link";
import { FaUser } from "react-icons/fa6";

type SessionUser = { id?: string; username?: string; fullName?: string; profilePicture?: string; name?: string | null; image?: string | null; email?: string | null; };
type UserInfo = { username: string; name: string; profilePicture: string; followers: string[]; following: string[]; posts: string[]; savedPosts: string[]; likedPosts: string[]; };
interface Media { type: "image" | "video"; url: string; }
interface PostProps { _id: string; media?: Media[]; user?: { _id?: string; username?: string; fullName: string; profilePicture?: string }; }

const Spinner = () => <FiLoader className="animate-spin" />;

export default function ProfilePage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as SessionUser | undefined;
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [tab, setTab] = useState("posts");

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/users/me");
        setUserInfo(res.data.user);
        setPosts(res.data.posts);
        setSavedPosts(res.data.savedPosts);
        setLikedPosts(res.data.likedPostsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const profilePic = sessionUser?.profilePicture || userInfo?.profilePicture || "/profile.png";
  const username = sessionUser?.username || userInfo?.username || "loading...";
  const fullName = sessionUser?.name || userInfo?.name || "loading...";

  return (
    <main className="min-h-screen bg-black text-white w-full overflow-y-auto pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
          <div className="relative h-28 w-28 md:h-36 md:w-36 rounded-full border-2 border-gray-800 p-1 shrink-0">
            <Image src={profilePic} alt="Profile" fill className="object-cover rounded-full p-1" />
          </div>

          <div className="flex flex-col items-center md:items-start gap-4 flex-1 w-full">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <h1 className="text-xl md:text-2xl flex items-center gap-2 font-medium">
                <FaUser className="text-gray-400" /> {username}
              </h1>
              <div className="flex gap-2">
                <Link href="/edit-profile" className="bg-gray-800 hover:bg-gray-700 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                  <FiEdit2 /> Edit Profile
                </Link>
                <button className="bg-gray-800 hover:bg-gray-700 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                  <FiShare2 /> Share Profile
                </button>
              </div>
            </div>

            <div className="flex gap-8 md:gap-10 text-base">
              <div className="flex md:block gap-1"><span className="font-semibold">{posts?.length || 0}</span> posts</div>
              <div className="flex md:block gap-1"><span className="font-semibold">{userInfo?.followers?.length || 0}</span> followers</div>
              <div className="flex md:block gap-1"><span className="font-semibold">{userInfo?.following?.length || 0}</span> following</div>
            </div>

            <div className="text-sm md:text-base text-center md:text-left mt-2 md:mt-0">
              <p className="font-semibold">{fullName}</p>
              <p className="text-gray-400 mt-1">no bio yes</p>
            </div>
          </div>
        </header>

        <nav className="flex justify-center border-t border-gray-800 mt-12 mb-2 gap-12 text-xs md:text-sm text-gray-400 font-semibold tracking-widest uppercase">
          {[
            { id: "posts", icon: MdOutlineGrid3X3, label: "Posts" },
            { id: "saved", icon: CiBookmark, label: "Saved" },
            { id: "liked", icon: IoHeartDislikeCircleOutline, label: "Liked" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 py-4 ${tab === item.id ? "text-white border-t border-white -mt-[1px]" : "hover:text-white transition-colors"}`}
            >
              <item.icon size={18} /> <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <section>
            {tab === "posts" && <PostsGrid data={posts} isOwnPost />}
            {tab === "saved" && <PostsGrid data={savedPosts} />}
            {tab === "liked" && <PostsGrid data={likedPosts} />}
          </section>
        )}
      </div>
    </main>
  );
}

function PostsGrid({ data, isOwnPost }: { data: PostProps[]; isOwnPost?: boolean }) {
  const [showPost, setShowPost] = useState<PostProps | null>(null);
  if (!data?.length) return <div className="text-center text-gray-500 py-16 font-medium">No Posts Yet</div>;

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {data.map((post) => (
          <div key={post._id} onClick={() => setShowPost(post)} className="relative aspect-square cursor-pointer group bg-gray-900 overflow-hidden md:rounded-md">
            <Image src={post?.media?.[0]?.url || "/default-profile.png"} alt="Post" fill className="object-cover group-hover:opacity-75 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        ))}
      </div>
      {showPost && <PostModal post={showPost} onClose={() => setShowPost(null)} isOwnPost={isOwnPost} />}
    </>
  );
}

function PostModal({ post, onClose, isOwnPost }: { post: PostProps; onClose: () => void; isOwnPost?: boolean }) {
  const { data: session } = useSession();
  const sessionUser = session?.user as SessionUser | undefined;
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isVideo = post?.media?.[0]?.type === "video";
  const url = post?.media?.[0]?.url || "";
  const author = post?.user;
  const canModify = isOwnPost && sessionUser?.id === author?._id;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/api/posts/${post._id}`);
      window.location.reload();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      {showConfirm ? (
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <FiAlertTriangle className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Delete Post?</h3>
          <p className="text-gray-400 text-sm mb-8">This action is permanent and cannot be undone.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setShowConfirm(false)} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors" disabled={deleting}>Cancel</button>
            <button onClick={handleDelete} className="flex gap-2 items-center px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors" disabled={deleting}>
              {deleting ? <Spinner /> : <><FiTrash2 /> Delete</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-5xl h-[85vh] flex flex-col md:flex-row bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/60 text-white rounded-full hover:bg-black/90 md:hidden"><FiX size={20} /></button>
          <div className="flex-1 relative bg-black flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-800 min-h-[40vh] md:min-h-0">
            {isVideo ? <video src={url} controls autoPlay className="max-h-full max-w-full" /> : <Image src={url} alt="" fill className="object-contain" />}
          </div>
          <div className="w-full md:w-[350px] lg:w-[400px] flex flex-col bg-gray-950 h-[50vh] md:h-full">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-700">
                  <Image src={author?.profilePicture || "/profile.png"} alt="" fill className="object-cover" />
                </div>
                <span className="font-semibold text-sm">{author?.username || author?.fullName || "User"}</span>
              </div>
              <button onClick={onClose} className="hidden md:block p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"><FiX size={22} /></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto"></div>
            {canModify && (
              <div className="p-4 border-t border-gray-800 flex gap-3">
                <button onClick={() => setShowConfirm(true)} className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-gray-900 border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 text-red-500 rounded-xl text-sm font-bold transition-all"><FiTrash2 /> Delete</button>
                <Link href={`/edit-post/${post._id}`} className="flex-1">
                  <button className="w-full flex justify-center items-center gap-2 py-2.5 bg-white hover:bg-gray-200 text-black rounded-xl text-sm font-bold transition-colors"><FiEdit2 /> Edit</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
