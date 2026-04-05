"use client";

import React from "react";
import { RiHomeHeartLine } from "react-icons/ri";
import { FaInstagram } from "react-icons/fa6";
import { BiSolidVideos } from "react-icons/bi";
import { LuMessageCircleHeart } from "react-icons/lu";
import { CiSquarePlus } from "react-icons/ci";
import { MdOutlineExplore } from "react-icons/md";
import { CiLogout } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";


import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type NavLink = {
  name: string;
  icon: React.ElementType;
  link: string;
  action?: () => void;
};

const PcNavbar = () => {
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
    { name: "Explore", icon: MdOutlineExplore, link: "/explore" },
    { name: "Profile", icon: CgProfile, link: "/profile" },
    { name: "Logout", icon: CiLogout, action: handleLogout, link: "/" }
  ];

  return (
    <nav className="fixed bottom-4 left-0 right-0 w-full flex items-center justify-between p-4 bg-background z-50 md:fixed md:left-0 md:top-0 md:h-full md:flex-col md:items-start md:gap-4 md:p-6 md:w-auto md:right-auto">
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
              <span
                className="hidden font-normal text-sm md:group-hover:block md:absolute md:left-full md:ml-4 md:bg-white md:text-black md:dark:bg-zinc-900 md:dark:text-white md:px-3 md:py-2 md:rounded-md md:shadow-xl md:z-50 lg:static lg:ml-0 lg:p-0 lg:shadow-none lg:bg-transparent lg:dark:bg-transparent">
                {link.name}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default PcNavbar;

