"use client"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { use } from "react"
import { FiBell, FiUserPlus } from "react-icons/fi"
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
}

export default function User({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [notification, setNotification] = useState<NotificationType | null>(null)
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    fetchNotification()
  }, [])

  const renderMessage = (n: NotificationType) => {
    if (n.type === "follow") {
      return `${n.sender.fullName} started following you`
    }
    return "New notification"
  }

  const renderIcon = (type: string) => {
    if (type === "follow") return <FiUserPlus size={20} />
    return <FiBell size={20} />
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 flex justify-center">
      <div className="w-full max-w-xl">

        {loading ? (
          <div className="h-16 rounded-xl bg-zinc-800 animate-pulse" />
        ) : notification ? (
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

          </div>
        ) : (
          <div className="flex flex-col items-center py-10 gap-2">
            <FiBell size={22} />
            <p>No notification found</p>
          </div>
        )}

      </div>
    </main>
  )
}