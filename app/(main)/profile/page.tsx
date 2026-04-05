"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MdOutlineGrid3X3 } from "react-icons/md";
import { CiBookmark } from "react-icons/ci";
import { IoHeartDislikeCircleOutline } from "react-icons/io5";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import {
  FiTrash2,
  FiEdit2,
  FiX,
  FiAlertTriangle,
  FiLoader,
} from "react-icons/fi";

type userInfo = {
  username: string;
  name: string;
  profilePicture: string;
  followers: string[];
  following: string[];
  posts: string[];
  savedPosts: string[];
  likedPosts: string[];
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
  const [tab, setTab] = useState("posts");

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
      <section className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
        <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 md:h-28 md:w-28">
          <Image
            src={
              session?.user?.profilePicture ||
              userInfo?.profilePicture ||
              "/profile.png"
            }
            alt="Profile"
            fill
            className="object-cover rounded-full p-1"
          />
        </div>
        <div className="w-full md:max-w-2xl">
          <div>
            <p className="text-2xl font-bold md:text-3xl">
              {session?.user?.username || userInfo?.username || "loading..."}
            </p>
            <p className="text-sm font-light mt-1 md:text-base">
              {session?.user?.name || userInfo?.name || "loading..."}
            </p>
            <p className="text-gray-400 text-xs mt-1">no bio yes</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 py-3 font-mono text-sm bg-gray-900 px-3 rounded-xl my-3">
            <h3>{posts?.length || 0} posts</h3>
            <h3>{userInfo?.followers?.length || 0} followers</h3>
            <h3>{userInfo?.following?.length || 0} following</h3>
          </div>
        </div>
      </section>

      <section className="flex flex-col sm:flex-row gap-2 my-4 max-w-xl">
        <button className="font-bold bg-gray-700 px-4 py-3 rounded-xl w-full hover:bg-gray-600 transition-colors">
          Edit Profile
        </button>
        <button className="font-bold bg-gray-700 px-4 py-3 rounded-xl w-full hover:bg-gray-600 transition-colors">
          Share Profile
        </button>
      </section>

      <div className="flex justify-center text-3xl sm:text-4xl md:text-5xl gap-10 py-2 text-center max-w-xl mx-auto">
        <button
          onClick={() => setTab("posts")}
          className={tab === "posts" ? "text-white" : "text-gray-400"}
        >
          <MdOutlineGrid3X3 size={24} />
        </button>
        <button
          onClick={() => setTab("favourites")}
          className={tab === "favourites" ? "text-white" : "text-gray-400"}
        >
          <CiBookmark size={24} />
        </button>
        <button
          onClick={() => setTab("liked")}
          className={tab === "liked" ? "text-white" : "text-gray-400"}
        >
          <IoHeartDislikeCircleOutline size={24} />
        </button>
      </div>
      <section>
        {tab === "posts" && <Posts data={posts} />}
        {tab === "favourites" && <Favourites data={userInfo?.savedPosts} />}
        {tab === "liked" && <LikedPosts data={userInfo?.likedPosts} />}
      </section>
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

function Favourites({ data }: any) {
  if (!data) {
    return (
      <section className="h-40">
        <p className="text-gray-400">No Favourites</p>
      </section>
    );
  }
  return (
    <section>
      <div className="flex gap-4 py-3 font-mono text-sm bg-gray-900 px-3 rounded-xl my-2">
        <h3>{data?.length || 0} posts</h3>
        <h3>100 followers</h3>
        <h3>100 following</h3>
      </div>
    </section>
  );
}

function LikedPosts({ data }: any) {
  if (data?.length == 0) {
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
                src={session.user?.profilePicture ?? "/profile.png"}
                alt="avatar"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-white font-semibold drop-shadow-md">
              {session.user?.fullName ?? "Unknown user"}
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
