'use client'
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const EditProfile = () => {
    const { data: session } = useSession();
    const [fullName, setFullName] = useState<string>(session?.user?.fullName || "");
    const [username, setUsername] = useState<string>(session?.user?.username || "");
    const [bio, setBio] = useState<string>(session?.user?.bio || "");
    const [profilePicture, setProfilePicture] = useState<string>(session?.user?.profilePicture || "");
    const [email, setEmail] = useState<string>(session?.user?.email || "");

    return (
        <main className='w-full min-h-screen bg-black text-white px-4 py-8 md:py-16'>
            <div className='max-w-3xl mx-auto flex flex-col gap-6 w-full border border-gray-800 p-6 md:p-10 rounded-2xl bg-black shadow-2xl'>
                <div className='border-b border-gray-800 pb-4'>
                    <h1 className='text-xl md:text-2xl font-bold'>Edit Profile</h1>
                </div>
                <div className="flex flex-col w-full gap-2">
                    <EditProfileTemplate type="fullName" value={fullName} onChange={setFullName} placeholder="Enter your full name" buttonText="Update" api="/api/users/update/fullName" />
                    <EditProfileTemplate type="username" value={username} onChange={setUsername} placeholder="Enter your username" buttonText="Update" api="/api/users/update/username" />
                    <EditProfileTemplate type="bio" value={bio} onChange={setBio} placeholder="Enter your bio" buttonText="Update" api="/api/users/update/bio" />
                </div>
                <EditEmail />
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
                [type]: value,
            });
            if (res.status === 200) {
                console.log(res.data.message);
                await update({ [type]: value });
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
        if (session?.user && value === "") {
            const sessionUser = session.user as any;
            const initialValue = sessionUser[type] || (type === "fullName" ? sessionUser.name : "");
            if (initialValue) {
                onChange(initialValue);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, type]);

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
};



function EditEmail() {
    const { data: session, update } = useSession();
    const [email, setEmail] = useState<string>(session?.user?.email || "");
    const [loading, setLoading] = useState<boolean>(false);
    const [verifying, setVerifying] = useState<boolean>(false);
    const [code, setCode] = useState<string>("");

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const res = await axios.put("/api/users/update/email", {
                email,
            });
            if (res.status === 200) {
                console.log(res.data.message);
                setVerifying(true);
            } else {
                console.error(res.data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        try {
            setLoading(true);
            const res = await axios.post("/api/users/verify-email", {
                code,
                email,
            });
            if (res.status === 200) {
                console.log(res.data.message);
                await update({ email });
                setVerifying(false);
                setCode("");
                signOut();
            } else {
                console.error(res.data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 border-b border-gray-800 w-full py-6'>
            <label htmlFor="email" className='font-semibold text-gray-300 text-sm sm:w-1/4 sm:text-right'>
                Email
            </label>
            <div className='flex flex-col gap-3 sm:w-3/4'>
                <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='flex-1 w-full bg-transparent border border-gray-800 rounded-xl px-4 py-2.5'
                        placeholder="Enter your email"
                        autoComplete="off"
                        disabled={verifying}
                    />
                    <button className='bg-white hover:bg-gray-200 text-black text-sm font-bold px-6 py-2.5 rounded-lg transition-colors w-full sm:w-auto h-10' onClick={handleUpdate} disabled={loading || verifying}>
                        {loading && !verifying ? "Updating..." : "Update"}
                    </button>
                </div>
                {verifying && (
                    <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className='flex-1 w-full bg-transparent border border-gray-800 rounded-xl px-4 py-2.5'
                            placeholder="Enter 6-digit code"
                            autoComplete="off"
                        />
                        <button className='bg-white hover:bg-gray-200 text-black text-sm font-bold px-6 py-2.5 rounded-lg transition-colors w-full sm:w-auto h-10' onClick={handleVerify} disabled={loading}>
                            {loading ? "Verifying..." : "Verify"}
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}