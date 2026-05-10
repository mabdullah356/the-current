"use client";

import React, { useEffect, useState } from "react";
import { RiHomeHeartLine } from "react-icons/ri";
import { FaInstagram } from "react-icons/fa6";
import { BiSolidVideos } from "react-icons/bi";
import { LuMessageCircleHeart } from "react-icons/lu";
import { CiSquarePlus } from "react-icons/ci";
import { CiLogout } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { IoNotificationsCircleOutline } from "react-icons/io5";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import axios from "axios";

type NavLink = {
  name: string;
  icon: React.ElementType;
  link: string;
  action?: () => void;
};

const PcNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<number>();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const router = useRouter();

  const navLinks: NavLink[] = [
    { name: "", icon: FaInstagram, link: "/" },
    { name: "Home", icon: RiHomeHeartLine, link: "/" },
    { name: "Reels", icon: BiSolidVideos, link: "/reels" },
    { name: "Messages", icon: LuMessageCircleHeart, link: "/messages" },
    { name: "New Post", icon: CiSquarePlus, link: "/create-post" },
    { name: "New Story", icon: CiSquarePlus, link: "/create-story" },
    { name: "Notifications", icon: IoNotificationsCircleOutline, link: "/notifications" },
    { name: "Profile", icon: CgProfile, link: "/profile" },
    { name: "Logout", icon: CiLogout, action: handleLogout, link: "/" },
  ];

  const fetchNotification = async () => {
    try {
      const res = await axios.get("/api/notification/unread");
      setNotifications(res.data.notifications);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchNotification();
  }, []);

  const NavItems = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navLinks.map((link, index) => {
        const Icon = link.icon;
        return (
          <div
            key={link.name || index}
            onClick={() => {
              if (onClick) onClick();
              if (link.action) {
                link.action();
              } else {
                router.push(link.link);
              }
            }}
            className="flex items-center gap-4 transition-all duration-200 cursor-pointer hover:bg-foreground/10 p-2 rounded-lg w-full group relative"
          >
            <Icon size={24} className="shrink-0 transition-transform group-hover:scale-105" />
            {link.name && (
              <span className="text-sm font-normal">{link.name}</span>
            )}
            {link.name === "Notifications" && notifications !== 0 && (
              <span className="absolute -top-2 -right-1 bg-red-500 rounded-full px-2 font-bold text-lg">
                {notifications}
              </span>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-foreground transition hover:bg-foreground/20 md:hidden"
        aria-label="Open sidebar"
      >
        <HiOutlineMenu size={22} />
      </button>

      <nav className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-full md:flex-col md:items-start md:gap-4 md:p-6 md:w-auto md:z-30">
        <div className="flex flex-col items-start gap-4 w-full">
          <NavItems />
        </div>
      </nav>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-background p-4 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10"
                aria-label="Close sidebar"
              >
                <HiOutlineX size={18} />
              </button>
            </div>
            <NavItems onClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default PcNavbar;

