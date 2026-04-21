import React from 'react'

export default async function User  ({ params }: { params: Promise<{ username: string }> }) {

    const {username} = await params;
    
  return (
    <main>
        User {username}
    </main>
  )
}
