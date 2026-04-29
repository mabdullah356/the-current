"use client"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { use } from "react"
import { FiBell, FiUserPlus, FiMessageCircle, FiHeart } from "react-icons/fi"
import Image from "next/image"

type NotificationType = {
  _id: string
  type: string
  isRead: boolean
  createdAt: string
  updatedAt: string
  sender: {
    _id: string
    username: string
    fullName: string
    profilePicture: string
  }
  postId?: {
    _id: string
    caption: string
    media: Array<{
      url: string
      type: string
    }>
    location: string
    likes: string[]
  }
  commentId?: {
    _id: string
    content: string
  }
}

export default function User({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [notification, setNotification] = useState<NotificationType | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/api/notification/${id}`)
        setNotification(res.data.notification)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotification()
  }, [id])

  const handleDelete = async () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setDeleting(true)
      await axios.delete(`/api/notification/${id}`)
      setNotification(null)
      setShowDeleteModal(false)
    } catch (error) {
      console.log(error)
      alert("Failed to delete notification")
    } finally {
      setDeleting(false)
    }
  }

  const renderMessage = (n: NotificationType) => {
    if (n.type === "follow") {
      return `${n.sender.fullName} started following you`
    }
    if (n.type === "unfollow") {
      return `${n.sender.fullName} unfollowed you`
    }
    if (n.type === "comment") {
      return `${n.sender.fullName} commented on your post`
    }
    if (n.type === "like") {
      return `${n.sender.fullName} liked your post`
    }
    if (n.type === "friend") {
      return `${n.sender.fullName} is now your friend`
    }
    if (n.type === "viewProfile") {
      return `${n.sender.fullName} viewed your profile`
    }
    return "New notification"
  }

  const renderIcon = (type: string) => {
    if (type === "follow" || type === "unfollow" || type === "friend") return <FiUserPlus size={20} />
    if (type === "comment") return <FiMessageCircle size={20} />
    if (type === "like") return <FiHeart size={20} />
    return <FiBell size={20} />
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 flex justify-center">
      <div className="w-full max-w-xl">

        {loading ? (
          <div className="h-16 rounded-xl bg-zinc-800 animate-pulse" />
        ) : notification ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-700 bg-neutral-800">
              <div className="w-12 h-12 relative rounded-full">
                <Image
                  src={notification.sender.profilePicture}
                  alt={notification.sender.fullName}
                  fill
                  className="object-cover rounded-full"
                />
              </div>

              <div className="flex-1">
                <p className="text-sm">{renderMessage(notification)}</p>
                <span className="text-xs text-neutral-400">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {renderIcon(notification.type)}
                {!notification.isRead && (
                  <span className="text-xs text-blue-400">New</span>
                )}
              </div>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>  
            </div>

            {(notification.type === "comment" || notification.type === "like") && notification.postId ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-neutral-700 bg-neutral-800 overflow-hidden">
                  {notification.postId.media && notification.postId.media.length > 0 && (
                    <div className="relative w-full h-78 bg-neutral-900">
                      {notification.postId.media[0].type === "image" ? (
                        <Image
                          src={notification.postId.media[0].url}
                          alt="post"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <video
                          src={notification.postId.media[0].url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm text-white mb-2">{notification.postId.caption}</p>
                    {notification.postId.location && (
                      <p className="text-xs text-neutral-400">📍 {notification.postId.location}</p>
                    )}
                    <p className="text-xs text-neutral-500 mt-2">❤️ {notification.postId.likes.length} likes</p>
                  </div>
                </div>

                {notification.type === "comment" && notification.commentId && (
                  <div className="rounded-xl border border-neutral-700 bg-neutral-800 p-4">
                    <p className="text-xs text-neutral-400 mb-2 font-semibold">Comment:</p>
                    <p className="text-sm text-white">{notification.commentId.content}</p>
                  </div>
                )}
              </div>
            ) : (notification.type === "comment" || notification.type === "like") ? (
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <p className="text-sm text-neutral-400">Post details not available</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 gap-2">
            <FiBell size={22} />
            <p>No notification found</p>
          </div>
        )}

      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div 
            className="w-full bg-neutral-900 border-t border-neutral-700 rounded-t-2xl p-6"
            style={{
              animation: "slideUp 0.3s ease-out forwards",
            }}
          >
            <style>{`
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(100%);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
            <h3 className="text-white text-lg font-semibold mb-2">Delete Notification?</h3>
            <p className="text-neutral-400 text-sm mb-6">This action cannot be undone.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}