"use client"
import React, { useState, useEffect } from "react"
import Post, { ToastContainer } from "./Post"
import axios from "axios"

interface PostType {
  _id: string
  [key: string]: any
}

const Posts = () => {
  const [posts, setPosts] = useState<PostType[]>([])
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/api/posts")
      const fetchedPosts = res.data.posts ?? []
      setPosts(fetchedPosts)
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load posts"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <main className="border-t flex flex-col items-center w-full py-2">
      <ToastContainer />
      {error && <p className="text-red-400 text-sm py-4">{error}</p>}

      {loading ? (
        <>
          <SkeletonLoading />
          <SkeletonLoading />
          <SkeletonLoading />
        </>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
          <span className="text-5xl">📷</span>
          <p className="text-sm">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="w-full">
          {posts.map((post) => <Post key={post._id} post={post} />)}
        </div>
      )}
    </main>
  )
}

export default Posts

const SkeletonLoading = () => {
  return (
    <div className="w-full max-w-[470px] mx-auto border-b border-zinc-800 mb-1 animate-pulse">
      <div className="flex items-center gap-3 px-3 py-3">
        <div className="size-10 rounded-full bg-zinc-800 shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-3 w-28 bg-zinc-800 rounded" />
          <div className="h-2 w-16 bg-zinc-800 rounded" />
        </div>
        <div className="h-4 w-4 bg-zinc-800 rounded ml-auto" />
      </div>

      <div className="w-full aspect-square bg-zinc-800" />

      <div className="px-3 pt-3 pb-4">
        <div className="flex gap-4 mb-3">
          <div className="h-6 w-6 bg-zinc-800 rounded-full" />
          <div className="h-6 w-6 bg-zinc-800 rounded-full" />
          <div className="h-6 w-6 bg-zinc-800 rounded-full" />
          <div className="h-6 w-6 bg-zinc-800 rounded-full ml-auto" />
        </div>
        <div className="h-3 w-20 bg-zinc-800 rounded mb-2" />
        <div className="h-3 w-full bg-zinc-800 rounded mb-1" />
        <div className="h-3 w-3/4 bg-zinc-800 rounded" />
      </div>
    </div>
  )
}


