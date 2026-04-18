"use client"
import React, {useState, useEffect } from 'react'
import Reel from '@/Components/Reel';
import axios from 'axios';


type ReelData = any;

const Reels = () => {
  const [reels, setReels] = useState<ReelData[]>([]);
  
  const fetchReels = async () => {
    try {
      const res = await axios.get("/api/reels");
      setReels(res.data.reels);
    } catch (error) {
      console.error("Error fetching reels:", error);
    }
  }
  
  useEffect(() => {
    fetchReels();
  }, []);

  return (
    <main>
      <section className='flex flex-col gap-4 items-center justify-center'>
        {reels?.length === 0 ? (
          <p>No reels found.</p>
        ) : (
          reels?.map((reel, i) => (
            <Reel key={i} data={reel} />
          ))
        )}
      </section>
    </main>
  )
}

export default Reels