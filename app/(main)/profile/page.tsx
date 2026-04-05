"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MdOutlineGrid3X3 } from "react-icons/md";
import { CiBookmark } from "react-icons/ci";
import { IoHeartDislikeCircleOutline } from "react-icons/io5";
import { BiSolidVideos } from "react-icons/bi";
import { FiEdit2, FiShare2, FiTrash2, FiX, FiAlertTriangle, FiLoader } from "react-icons/fi";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { FaUser } from "react-icons/fa6";

type SessionUser = {
  id?: string;
  username?: string;
  fullName?: string;
  profilePicture?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

type userInfo = {
  username: string;
  name: string;
  profilePicture: string;
  followers: string[];
  following: string[];
  posts: string[];
  savedPosts: string[];
  likedPosts: string[];
  savedReels: any[];
  likedReels: any[];
};

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
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const [userInfo, setUserInfo] = useState<userInfo | null>(null);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const { data: session, status } = useSession();
  const sessionUser = session?.user as SessionUser | undefined;
  const [tab, setTab] = useState("posts");

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl md:px-8 md:py-10">
        <div className="">
          <section className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="relative mx-auto h-28 w-28 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 p-1 md:h-32 md:w-32">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-950">
                <Image
                  src={
                    sessionUser?.profilePicture ||
                    userInfo?.profilePicture ||
                    "/profile.png"
                  }
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="border rounded-2xl border-gray-300 space-y-4 text-center lg:text-left">
              <div>
                <p className="text-3xl font-semibold tracking-tight md:text-4xl flex  items-center justify-center gap-2 md:justify-start mt-2">
                  <FaUser/>
                  {sessionUser?.username || userInfo?.username || "loading..."}
                </p>
                <p className="text-sm text-slate-400 md:text-base">
                  {sessionUser?.name || userInfo?.name || "loading..."}
                </p>
              </div>
              <p className="max-w-xl text-sm text-slate-400">
                no bio yes
              </p>
              <div className="grid grid-cols-3 gap-3 rounded-3xl bg-slate-950/80 p-4 text-center text-sm sm:text-base">
                <div className="rounded-3xl bg-slate-900/80 px-4 py-4">
                  <p className="text-lg font-semibold">{posts?.length || 0}</p>
                  <p className="text-slate-400">posts</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 px-4 py-4">
                  <p className="text-lg font-semibold">{userInfo?.followers?.length || 0}</p>
                  <p className="text-slate-400">followers</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 px-4 py-4">
                  <p className="text-lg font-semibold">{userInfo?.following?.length || 0}</p>
                  <p className="text-slate-400">following</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button className="inline-flex items-center justify-center gap-2 rounded-3xl bg-linear-to-r from-slate-800 to-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:from-slate-700 hover:to-slate-800">
                  <FiEdit2 size={18} /> Edit Profile
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  <FiShare2 size={18} /> Share Profile
                </button>
              </div>
            </div>
          </section>

          <nav className="mt-8 flex items-center justify-center gap-4 rounded-3xl bg-slate-950/80 p-3 text-slate-400 shadow-inner sm:p-4">
            {[
              { id: "posts", icon: MdOutlineGrid3X3 },
              { id: "favourites", icon: CiBookmark },
              { id: "savedReels", icon: BiSolidVideos },
              { id: "likedReels", icon: IoHeartDislikeCircleOutline },
              { id: "liked", icon: IoHeartDislikeCircleOutline },
            ].map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl transition ${active ? "bg-linear-to-br from-slate-700 to-slate-800 text-white shadow-lg" : "hover:bg-white/10 text-slate-400"}`}
                  aria-label={item.id}
                >
                  <Icon size={24} />
                </button>
              );
            })}
          </nav>

          <section className="mt-8">
            {tab === "posts" && <Posts data={posts} />}
            {tab === "favourites" && <SavedPosts data={userInfo?.savedPosts} />}
            {tab === "savedReels" && <SavedReels data={userInfo?.savedReels} />}
            {tab === "likedReels" && <LikedReels data={userInfo?.likedReels} />}
            {tab === "liked" && <LikedPosts data={userInfo?.likedPosts} />}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;

function Posts({ data }: any) {
  const [showPost, setShowPost] = useState<any | null>(null);

  const handleOpenPost = (post: any) => {
    setShowPost(post);
  };

  const handleClose = () => {
    setShowPost(null);
  };

  if (!data || data.length === 0) {
    return (
      <section className="h-40">
        <p className="text-gray-400">No Posts</p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4">
      {data.map((post: any, i: number) => (
        <div
          onClick={() => handleOpenPost(post)}
          className="relative aspect-square w-full bg-gray-700 rounded-xl overflow-hidden"
          key={i}
        >
          <Image
            src={post?.media?.[0]?.url || "/default-profile.png"}
            alt="Post"
            fill
            className="object-cover rounded-xl"
          />
        </div>
      ))}
      {showPost && <ShowPost post={showPost} onClose={handleClose} />}
    </section>
  );
}

function SavedPosts({ data }: any) {
  if (!data || data.length === 0) {
    return (
      <section className="h-40">
        <p className="text-gray-400">No saved posts</p>
      </section>
    );
  }
  return (
    <section>
      <h2 className="text-white text-lg font-semibold mb-4">Saved Posts</h2>
      <p className="text-gray-400">{data?.length || 0} saved post{data.length === 1 ? "" : "s"}</p>
    </section>
  );
}

function SavedReels({ data }: any) {
  if (!data || data.length === 0) {
    return (
      <section className="h-40">
        <p className="text-gray-400">No saved reels</p>
      </section>
    );
  }
  return (
    <section>
      <h2 className="text-white text-lg font-semibold mb-4">Saved Reels</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((reel: any, i: number) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            <div className="relative h-48 w-full">
              <Image
                src={reel?.media?.[0]?.url || "/default-profile.png"}
                alt={reel?.user?.username || "Reel"}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-white">
                {reel?.user?.username || "Unknown"}
              </p>
              <p className="text-xs text-slate-400 mt-1">{reel?.likes?.length ?? 0} likes</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LikedReels({ data }: any) {
  if (!data || data.length === 0) {
    return (
      <section className="h-40">
        <p className="text-gray-400">No liked reels</p>
      </section>
    );
  }
  return (
    <section>
      <h2 className="text-white text-lg font-semibold mb-4">Liked Reels</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((reel: any, i: number) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            <div className="relative h-48 w-full">
              <Image
                src={reel?.media?.[0]?.url || "/default-profile.png"}
                alt={reel?.user?.username || "Reel"}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-white">
                {reel?.user?.username || "Unknown"}
              </p>
              <p className="text-xs text-slate-400 mt-1">{reel?.likes?.length ?? 0} likes</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LikedPosts({ data }: any) {
  if (!data || data.length === 0) {
    return (
      <section className="h-40">
        <p className="text-gray-400">No Liked Posts</p>
      </section>
    );
  }
  return (
    <section>
      <div className="h-40">
        <h3 className="text-gray-400">{data?.length || 0} posts</h3>
      </div>
    </section>
  );
}

interface Media {
  type: "image" | "video";
  url: string;
}
interface Post {
  _id: string;
  media?: Media[];
  user?: { fullName: string; profilePicture?: string };
}
interface ShowPostProps {
  post: Post;
  onClose: () => void;
  onDeleted?: (id: string) => void;
}

const Spinner = () => <FiLoader className="animate-spin" />;

const ConfirmDialog = ({
  open,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) =>
  !open ? null : (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-60 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-500/10 rounded-full">
            <FiAlertTriangle className="text-red-400 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Delete post?</h2>
            <p className="text-gray-400 text-sm mt-1">
              This action is permanent and cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white bg-red-600 hover:bg-red-500 disabled:opacity-60 transition-colors min-w-25 justify-center"
          >
            {loading ? (
              <Spinner />
            ) : (
              <>
                <FiTrash2 /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

const ShowPost = ({ post, onClose, onDeleted }: ShowPostProps) => {
  const { data: session, status } = useSession();
  const sessionUser = session?.user as SessionUser | undefined;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVideo = post?.media?.[0]?.type === "video";
  const mediaUrl = post?.media?.[0]?.url ?? "";

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    setError(null);
    try {
      await axios.delete(`/api/posts/${post._id}`);
      setConfirmOpen(false);
      onDeleted?.(post._id);
      onClose();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setError(
        e.response?.data?.message ?? "Failed to delete post. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  }, [post._id, onClose, onDeleted]);

  if (status === "loading")
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <Spinner />
      </div>
    );

  if (!session)
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <p className="text-white text-lg font-medium">
          Please sign in to view this content.
        </p>
      </div>
    );

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setError(null);
          }
        }}
      />
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
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
              alt={post?.user?.fullName ?? "Post"}
              fill
              className="object-cover rounded-xl"
            />
          )}

          <div className="absolute top-4 left-4 flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-md">
              <Image
                src={sessionUser?.profilePicture ?? "/profile.png"}
                alt="avatar"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-white font-semibold drop-shadow-md">
              {sessionUser?.fullName ?? "Unknown user"}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>

          {error && (
            <div
              role="alert"
              className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-600/90 text-white text-sm px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm"
            >
              {error}
            </div>
          )}

          <div className="absolute bottom-10 flex gap-3 px-4 py-3 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl font-mono text-sm">
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
              aria-label="Delete"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 px-4 py-2 rounded-xl transition-colors text-white"
            >
              <FiTrash2 /> Delete
            </button>
            <Link href={`/edit-post/${post._id}`}>
              <button
                aria-label="Edit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition-colors text-white"
              >
                <FiEdit2 /> Edit
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
