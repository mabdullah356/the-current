"use client"
import React, {useState, useEffect } from 'react'
import Reel from '@/Components/Reel';
import axios from 'axios';


type reel = {
  videoUrl: string,
  userProfilePic: string
  username: string,
  likes: number,
  comments: number,
  shares: number,
  isFav: boolean,
  isFollow: boolean,
  music: string,
  musicOwner: string
}


const Reels = () => {
  const [reel, setReel] = useState<reel[]>([]);
  
  const fetchReels = async () => {
    try {
      const res = await axios.get("/api/reels");
        setReel(res.data.reels);
    } catch (error) {
      console.error("Error fetching reels:", error);
    }
  }
  
  useEffect(()=>{
    fetchReels()
  },[reel])

  return (
    <main>
      <section className='flex flex-col gap-4 items-center justify-center'>
        {reel?.map((reel, i) => (
          <Reel key={i} data={reel} />
        ))}
      </section>
    </main>
  )
}

export default Reels