"use client"
import React, { useEffect, useState } from "react"
import axios from "axios"
import { FiBell } from "react-icons/fi"
import Image from "next/image"
import { useRouter } from "next/navigation"

type NotificationType = {
  _id: string
  type: string
  isRead: boolean
  createdAt: string
  sender: {
    _id: string
    fullName: string
    profilePicture: string
  }
}

const Notification = () => {

  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotification = async () => {
    try {
      const res = await axios.get("/api/notification")
      const sorted = res.data.notifications.sort(
        (a: NotificationType, b: NotificationType) =>
          Number(a.isRead) - Number(b.isRead)
      )
      setNotifications(sorted)
    } catch {
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

  const unread = notifications.filter(n => !n.isRead)
  const read = notifications.filter(n => n.isRead)

  const NotificationItem = ({ n }: { n: NotificationType }) => (
    <div
    onClick={()=>router.push(`/notify/${n._id}`)}
      className={`flex items-center gap-3 p-3 rounded-xl border ${
        n.isRead
          ? "border-zinc-800 bg-black"
          : "border-zinc-700 bg-white/5"
      }`}
    >
      <div className="w-10 h-10 rounded-full relative">
        <Image
          fill
          src={n.sender.profilePicture}
          alt=""
          className="w-full h-full rounded-full object-cover"
        />
      </div>

      {n.isRead ? (
        <div className="flex-1">
          <div className="text-sm text-zinc-400">
            <h2 className="font-bold text-white text-lg">{n.sender.fullName}</h2>
            {renderMessage(n)}
          </div>
          <span className="text-xs text-zinc-500">
            {new Date(n.createdAt).toLocaleString()}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <h2 className="font-bold">{n.sender.fullName}</h2>
          <p className="text-sm font-light">{renderMessage(n)}</p>
          <span className="text-xs text-zinc-400">
            {new Date(n.createdAt).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white p-3 flex justify-center">
      <div className="w-full max-w-2xl flex flex-col gap-5">

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <FiBell size={22} />
            <p>No notifications</p>
          </div>
        ) : (
          <>
            {unread.length > 0 && (
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold px-1">Unread</h2>
                {unread.map(n => (
                  <NotificationItem key={n._id} n={n} />
                ))}
              </div>
            )}

            {read.length > 0 && (
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold px-1">Earlier</h2>
                {read.map(n => (
                  <NotificationItem key={n._id} n={n} />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </main>
  )
}

export default Notification