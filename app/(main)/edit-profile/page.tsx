'use client'
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { signIn } from 'next-auth/react';

const EditProfile = () => {
    const [fullName, setFullName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    return (
        <main className='w-full min-h-screen bg-black text-white px-4 py-8 md:py-16'>
            <div className='max-w-3xl mx-auto flex flex-col gap-6 w-full border border-gray-800 p-6 md:p-10 rounded-2xl bg-black shadow-2xl'>
                <div className='border-b border-gray-800 pb-4'>
                    <h1 className='text-xl md:text-2xl font-bold'>Edit Profile</h1>
                </div>
                <div className="flex flex-col w-full gap-2">
                    <EditProfileTemplate type="fullName" value={fullName} onChange={setFullName} placeholder="Enter your full name" buttonText="Update" api="/api/users/update/fullName" />
                </div>
            </div>
        </main>
    )
}

export default EditProfile;

function EditProfileTemplate({ type, value, onChange, placeholder, buttonText, api }: { type: "fullName" | "username" | "bio" | "profilePicture" | "email"; value: string; onChange: (value: string) => void; placeholder: string; buttonText: string; api: string }) {

    const { data: session, update } = useSession();
    const [loading, setLoading] = useState<boolean>(false);
    const handleUpdate = async () => {
        try {
            setLoading(true);
            const res = await axios.put(api, {
                fullName: value,
            });
            if (res.status === 200) {
                console.log(res.data.message);
                await update({ fullName: value });
            } else {
                console.error(res.data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user && type === "fullName" && value === "") {
            onChange((session.user as any).fullName || session.user.name || "");
        }
    }, [session, type, value, onChange]);

    return (
        <section className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 border-b border-gray-800 w-full py-6'>
            <label htmlFor="name" className='font-semibold text-gray-300 text-sm sm:w-1/4 sm:text-right'>
                {type === "fullName" ? "Full Name" : type === "username" ? "Username" : type === "bio" ? "Bio" : type === "profilePicture" ? "Profile Picture" : "Email"}
            </label>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:w-3/4'>
                <input
                    type="text"
                    id="name"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className='flex-1 w-full bg-transparent border border-gray-800 rounded-xl px-4 py-2.5'
                    placeholder={placeholder}
                    autoComplete="off"
                />
                <button className='bg-white hover:bg-gray-200 text-black text-sm font-bold px-6 py-2.5 rounded-lg transition-colors w-full sm:w-auto h-10' onClick={handleUpdate}>
                    {loading ? "Updating..." : buttonText}
                </button>
            </div>
        </section>
    )
}