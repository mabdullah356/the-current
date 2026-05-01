"use client"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import axios from "axios"
import { useSession } from "next-auth/react"

type StoryUser = {
  id:string
  username?: string
  fullName?: string
  profilePicture?: string
}
type SessionUser = {
  username?: string
  fullName?: string
  profilePicture?: string
  email?: string | null
  name?: string | null
  image?: string | null
}
type Story = {
  id: string
  type: "image" | "video"
  media: string
  isView: boolean
  user?: StoryUser
}

const Stories = () => {

  const { data: session }  = useSession()
  const sessionUser = session?.user as SessionUser | undefined;

  const [stories, setStories] = useState<Story[]>([])

  const [loading, setLoading] = useState(true)

  const [showStory, setShowStory] = useState<Story | null>(null)

  const handleOpenStory = (story: Story) => {
    setShowStory(story)
  }

  const handleClose = () => {
    setShowStory(null)
  }

  useEffect(() => {
    const fetchStoriesAsync = async () => {
      try {
        const res = await axios.get("/api/stories")
        setStories(res.data.stories)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchStoriesAsync()
  }, [])

  return (
    <main className="w-full h-full relative">

      <section className="border-b w-full h-[20vh] overflow-x-auto flex gap-5 px-4 items-center">
        {loading && (
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="p-1 rounded-full bg-zinc-800 animate-pulse">
                <div className="bg-zinc-800 p-0.5 rounded-full">
                  <div className="h-16 w-16 rounded-full bg-zinc-800 animate-pulse"></div>
                </div>
              </div>
              <div className="h-4 w-12 bg-zinc-800 animate-pulse mt-1 rounded"></div>
            </div>
          ))
        )} 
        
        {stories.length > 0  && (
          stories.map(story => (
            <div
              key={story.id}
              onClick={() => handleOpenStory(story)}
                className="flex flex-col items-center cursor-pointer"
              >
              <div
                className={`p-1 rounded-full ${
                  story.isView
                    ? "bg-gray-400"
                    : "bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600"
                }`}
              >
                <div className="bg-zinc-800 p-0.5 rounded-full">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden">
                    <Image
                      src={
                        story.user?.profilePicture ||
                        story.media ||
                        "/default-profile.png"
                      }
                      alt={story.user?.fullName || "Story"}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-sm mt-1">
                {story.user?.username === sessionUser?.username ? "ME" : story.user?.username || "Story"}
              </h2>
            </div>
            )
            
          ))}
          {stories.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center  text-zinc-500 gap-3">
              <p className="text-md font-semibold">No stories available</p>
            </div>
            )}
          
      </section>

      {showStory && (
        <ShowStory story={showStory} onClose={handleClose} />
      )}
    </main>
  )
}

export default Stories

type ShowStoryProps = {
  story: Story
  onClose: () => void
}

const ShowStory = ({ story, onClose }: ShowStoryProps) => {

  const { data: session }  = useSession()
  const { showToast } = useToast()
  const [loading,setLoading]= useState(false);
  
  const handleDeleteStory = async ()=>{
    try {
      setLoading(true);
      await axios.delete(`/api/stories/${story.id}`);
      showToast("Story deleted", "success");
      onClose();      
    } catch (error) {
      showToast("Failed to delete story", "error");
    }finally{
      setLoading(false);
    }
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">

      <div className="relative w-full md:w-1/2 h-full flex items-center justify-center">

        
        {story.type === "video" ? (
          <video
            src={story.media}
            controls
            autoPlay
            className="h-full w-full object-contain"
          />
        ) : (
          <Image
            src={story.media || "/default-profile.png"}
            alt={story.user?.fullName || "Story"}
            fill
            className="object-contain"
          />
        )}

        <div className="absolute top-4 left-4 flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white">
            <Image
              src={story.user?.profilePicture || "/default-profile.png"}
              alt={story.user?.fullName || "Story"}
              fill
              className="object-cover w-full h-full"
            />
          </div>
          <span className="text-white font-semibold">
            {story.user?.fullName || "Story"}
          </span>
        </div>
        {session?.user.id==story?.user?.id&& (
          <button 
          onClick={()=>handleDeleteStory()}
          className="absolute top-5 right-15 bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg ">
        {loading ? "Deleting..." : "Delete"}
        </button>
        )}
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