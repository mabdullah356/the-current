import React from 'react'

export default async function User  ({ params }: { params: Promise<{ username: string }> }) {

    const {username} = await params;

  return (
    <main>
        User {username}
        <SkeletonLoading/>
    </main>
  )
};



function SkeletonLoading() {
  return (
    <main className="min-h-screen bg-black text-white p-4 animate-pulse">

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-zinc-800" />
        
        <div className="flex flex-1 justify-around">
          <div className="text-center">
            <div className="w-10 h-4 bg-zinc-800 mx-auto mb-2 rounded" />
            <div className="w-12 h-3 bg-zinc-800 mx-auto rounded" />
          </div>
          <div className="text-center">
            <div className="w-10 h-4 bg-zinc-800 mx-auto mb-2 rounded" />
            <div className="w-12 h-3 bg-zinc-800 mx-auto rounded" />
          </div>
          <div className="text-center">
            <div className="w-10 h-4 bg-zinc-800 mx-auto mb-2 rounded" />
            <div className="w-12 h-3 bg-zinc-800 mx-auto rounded" />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="w-32 h-4 bg-zinc-800 rounded" />
        <div className="w-full h-3 bg-zinc-800 rounded" />
        <div className="w-3/4 h-3 bg-zinc-800 rounded" />
      </div>

      <div className="mt-4 flex gap-2">
        <div className="flex-1 h-8 bg-zinc-800 rounded-lg" />
        <div className="flex-1 h-8 bg-zinc-800 rounded-lg" />
      </div>

      <div className="mt-6 flex gap-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-zinc-800" />
            <div className="w-12 h-3 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="aspect-square bg-zinc-800" />
        ))}
      </div>

    </main>
  );
}
