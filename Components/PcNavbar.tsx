"use client";

import React, { useEffect, useState } from "react";
import { RiHomeHeartLine } from "react-icons/ri";
import { FaInstagram } from "react-icons/fa6";
import { BiSolidVideos } from "react-icons/bi";
import { LuMessageCircleHeart } from "react-icons/lu";
import { CiSquarePlus } from "react-icons/ci";
// import { MdOutlineExplore } from "react-icons/md";
import { CiLogout } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { HiOutlineMenu } from "react-icons/hi";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications,setNotifications] = useState<number>();


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
    { name: "Logout", icon: CiLogout, action: handleLogout, link: "/" }
  ];

  const mobileQuickLinkNames = ["Home", "Reels", "New Post", "Profile", "Logout"];
  const mobileQuickLinks = navLinks.filter((link) => mobileQuickLinkNames.includes(link.name));
  const mobileMenuLinks = navLinks.filter((link) => !mobileQuickLinkNames.includes(link.name) && link.name !== "");

  
  const fetchNotification = async ()=> {
    try {
      const res = await axios.get("/api/notification/unread")
      setNotifications(res.data.notifications);
      // alert(res.data.message)
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(()=>{
    fetchNotification();
  },[])
  return (
    <>
      <nav className="fixed bottom-4 left-0 right-0 w-full z-30 md:fixed md:left-0 md:top-0 md:h-full md:flex md:flex-col md:items-start md:gap-4 md:p-6 md:w-auto md:right-auto">
        <div className="hidden md:flex flex-col items-start gap-4 w-full">
          {navLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <div
                key={link.name || index}
                onClick={() => {
                  if (link.action) {
                    link.action();
                  } else {
                    router.push(link.link);
                  }
                }}
                className="flex items-center gap-4 transition-all duration-200 cursor-pointer hover:bg-foreground/10 p-2 rounded-lg md:w-full group relative"
              >
                <Icon size={24} className="shrink-0 transition-transform group-hover:scale-105" />
                {link.name && (
                  <span className="hidden font-normal text-sm md:group-hover:block md:absolute md:left-full md:ml-4 md:bg-white md:text-black md:dark:bg-zinc-900 md:dark:text-white md:px-3 md:py-2 md:rounded-md md:shadow-xl md:z-50 lg:static lg:ml-0 lg:p-0 lg:shadow-none lg:bg-transparent lg:dark:bg-transparent">
                    {link.name}
                  </span>
                )}
                {link.name =="Notifications" && notifications!=0 && (
                  <span className="absolute -top-2 -right-1 bg-red-500 rounded-full px-2 font-bold text-lg">{notifications}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-full bg-background/95 px-4 py-2 shadow-lg backdrop-blur-md md:hidden">
          {mobileQuickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.name}
                type="button"
                onClick={() => {
                  if (link.action) {
                    link.action();
                  } else {
                    router.push(link.link);
                  }
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200 hover:bg-foreground/10"
                aria-label={link.name}
              >
                <Icon size={24} />
              </button>
            );
          })}
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="fixed bottom-24 right-4 z-60 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg transition hover:bg-slate-100 md:hidden"
        aria-label="Open menu"
      >
        <HiOutlineMenu size={24} />
      </button>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-background p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold">More actions</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-gray-200 p-2 text-black"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {mobileMenuLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.name}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (link.action) {
                        link.action();
                      } else {
                        router.push(link.link);
                      }
                    }}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-300/20 bg-white/90 px-3 py-4 text-sm text-black shadow-sm transition hover:bg-white"
                  >
                    <Icon size={24} />
                    <span>{link.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PcNavbar;

