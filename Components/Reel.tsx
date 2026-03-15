import React from "react";
import { FaRegHeart, FaRegComment } from "react-icons/fa";
import { PiShareFatLight } from "react-icons/pi";
import { CiBookmark } from "react-icons/ci";
import { GoVerified } from "react-icons/go";
import Image from "next/image";

const Reel = ({data}) => {
  return (
    <main className="w-full flex justify-center bg-black">
      <div className="relative w-full md:max-w-md h-screen bg-black overflow-hidden">

        <video
          src={data.media[0].url}
          className="w-full h-full object-cover"
          loop
          muted
          autoPlay
          playsInline
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-6 left-4 right-16 text-white space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-full overflow-hidden border border-white/30">
              <Image
                src={data.user.profilePicture}
                alt="profile"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex items-center gap-1 font-semibold text-sm">
              {data.user.username}
              {data.user.isVerified && (
                <GoVerified className="text-blue-500 text-base" />
              )}
            </div>

            <button className="ml-2 px-3 py-1 text-xs font-semibold border border-white rounded-full hover:bg-white hover:text-black transition">
              Follow
            </button>

          </div>

          <p className="text-sm text-white/90">
            Taj dare hara • Original Audio
          </p>
        </div>

        <div className="absolute bottom-6 right-4 flex flex-col items-center gap-6 text-white">
          <div className="flex flex-col items-center text-sm">
            <FaRegHeart className="text-2xl mb-1 cursor-pointer hover:scale-110 transition" />
            {data.likes.length}
          </div>

          <div className="flex flex-col items-center text-sm">
            <FaRegComment className="text-2xl mb-1 cursor-pointer hover:scale-110 transition" />
            34
          </div>

          <div className="flex flex-col items-center text-sm">
            <PiShareFatLight className="text-2xl mb-1 cursor-pointer hover:scale-110 transition" />
            12
          </div>

          <CiBookmark className="text-2xl cursor-pointer hover:scale-110 transition" />
        </div>

      </div>
    </main>
  );
};

export default Reel;