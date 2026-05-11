'use client'
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useToast } from '@/Components/ToastProvider';
import { FaUser, FaAt, FaCommentDots, FaEnvelope, FaLock } from 'react-icons/fa6';
import { FaUserCircle } from 'react-icons/fa';

const EditProfile = () => {
    const { data: session } = useSession();
    const [fullName, setFullName] = useState<string>(session?.user?.fullName || "");
    const [username, setUsername] = useState<string>(session?.user?.username || "");
    const [bio, setBio] = useState<string>(session?.user?.bio || "");

    return (
        <main className='w-full min-h-screen bg-black text-white px-4 sm:px-6 py-6 md:py-12'>
            <div className='max-w-3xl mx-auto flex flex-col gap-6 w-full border border-gray-800/50 md:border-gray-800 p-4 sm:p-6 md:p-10 rounded-xl md:rounded-2xl bg-black shadow-2xl'>
                <div className='border-b border-gray-800 pb-4'>
                    <h1 className='text-xl md:text-2xl font-bold flex items-center gap-3'>
                        <FaUserCircle className='text-gray-500' />
                        Edit Profile
                    </h1>
                </div>
                <div className="flex flex-col w-full gap-2">
                    <EditProfileTemplate type="fullName" value={fullName} onChange={setFullName} placeholder="Enter your full name" buttonText="Update" api="/api/users/update/fullName" icon={<FaUser />} />
                    <EditProfileTemplate type="username" value={username} onChange={setUsername} placeholder="Enter your username" buttonText="Update" api="/api/users/update/username" icon={<FaAt />} />
                    <EditProfileTemplate type="bio" value={bio} onChange={setBio} placeholder="Enter your bio" buttonText="Update" api="/api/users/update/bio" icon={<FaCommentDots />} />
                </div>
                <EditEmail />
                <EditProfilePicture />
                <EditPassword />
            </div>
        </main>
    )
}

export default EditProfile;

function EditProfileTemplate({ type, value, onChange, placeholder, buttonText, api, icon }: { type: "fullName" | "username" | "bio" | "profilePicture" | "email"; value: string; onChange: (value: string) => void; placeholder: string; buttonText: string; api: string; icon: React.ReactNode }) {

    const { data: session, update } = useSession();
    const { showToast } = useToast();
    const [loading, setLoading] = useState<boolean>(false);
    const handleUpdate = async () => {
        try {
            setLoading(true);
            const res = await axios.put(api, {
                [type]: value,
            });
            if (res.status === 200) {
                showToast(`${type === "fullName" ? "Full name" : type === "username" ? "Username" : "Bio"} updated`, "success");
                await update({ [type]: value });
            } else {
                showToast(res.data.error || "Failed to update", "error");
            }
        } catch (error: any) {
            showToast(error?.response?.data?.error || `Failed to update ${type}`, "error");
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
            <label htmlFor={type} className='font-semibold text-gray-300 text-sm sm:w-1/4 sm:text-right flex items-center sm:justify-end gap-2'>
                <span className='text-gray-500'>{icon}</span>
                {type === "fullName" ? "Full Name" : type === "username" ? "Username" : type === "bio" ? "Bio" : type === "profilePicture" ? "Profile Picture" : "Email"}
            </label>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:w-3/4'>
                <input
                    type="text"
                    id={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className='flex-1 w-full bg-transparent border border-gray-800 rounded-xl px-4 py-2.5 focus:border-gray-500 focus:outline-none transition-colors'
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
                setVerifying(true);
            }
        } catch {
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
                await update({ email });
                setVerifying(false);
                setCode("");
                signOut();
            }
        } catch {
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 border-b border-gray-800 w-full py-6'>
            <label htmlFor="email" className='font-semibold text-gray-300 text-sm sm:w-1/4 sm:text-right flex items-center sm:justify-end gap-2'>
                <span className='text-gray-500'><FaEnvelope /></span>
                Email
            </label>
            <div className='flex flex-col gap-3 sm:w-3/4'>
                <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='flex-1 w-full bg-transparent border border-gray-800 rounded-xl px-4 py-2.5 focus:border-gray-500 focus:outline-none transition-colors'
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
                            className='flex-1 w-full bg-transparent border border-gray-800 rounded-xl px-4 py-2.5 focus:border-gray-500 focus:outline-none transition-colors'
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
};


function EditProfilePicture() {
    const { data: session, update } = useSession();
    const [profilePicture, setProfilePicture] = useState<string>(session?.user?.profilePicture || "https://plus.unsplash.com/premium_photo-1678371209761-07b1800c9b4b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzNXx8fGVufDB8fHx8fA%3D%3D");
    const [loading, setLoading] = useState<boolean>(false);
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        if (image) {
            const url = URL.createObjectURL(image);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreviewUrl(null);
    }, [image]);

    const handleUpdate = async () => {
        if (!image) return;
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("profilePicture", image);

            const res = await axios.put("/api/users/update/profilePicture", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.status === 200) {
                setProfilePicture(res.data.profilePictureUrl);
                await update({ profilePicture: res.data.profilePictureUrl });
                showToast("Profile picture updated successfully", "success");
                setImage(null);
            } else {
                showToast(res.data.error || "Failed to update", "error");
            }
        } catch (error: any) {
            showToast(error?.response?.data?.error || "Failed to update profile picture", "error");
        } finally {
            setLoading(false);
        }
    };
    return (
        <section className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 border-b border-gray-800 w-full py-6'>
            <label htmlFor="profilePicture" className='font-semibold text-gray-300 text-sm sm:w-1/4 sm:text-right flex items-center sm:justify-end gap-2'>
                <span className='text-gray-500'><FaUserCircle /></span>
                Profile Picture
            </label>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:w-3/4'>
                <div className='relative w-24 h-24 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-800'>
                    {previewUrl ? (
                        <Image src={previewUrl} alt="Profile Picture" fill className='object-cover' />
                    ) : (
                        <Image src={profilePicture} alt="Profile Picture" fill className='object-cover' />
                    )}
                </div>
                <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className='flex-1 w-full bg-transparent border border-gray-800 rounded-xl px-4 py-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:cursor-pointer'
                    autoComplete="off"
                />
                <button className='bg-white hover:bg-gray-200 text-black text-sm font-bold px-6 py-2.5 rounded-lg transition-colors w-full sm:w-auto h-10' onClick={handleUpdate} disabled={loading || !image}>
                    {loading ? "Updating..." : "Update"}
                </button>
            </div>
        </section>
    )
};


function EditPassword() {

    const [oldPassword, setOldPassword] = useState<string>("user1234");
    const [newPassword, setNewPassword] = useState<string>("00009999");
    const [loading, setLoading] = useState<boolean>(false);
    const { showToast } = useToast();

    const handleUpdate = async ()=>{
        try {
            setLoading(true);
            const res = await axios.put("/api/users/update/password", {
                oldPassword,
                newPassword,
            });
            if (res.status === 200) {
                showToast("Password updated successfully", "success");
            } else {
                showToast(res.data.error || "Failed to update password", "error");
            }
        } catch (error: any) {
            showToast(error?.response?.data?.error || "Failed to update password", "error");
        } finally {
            setLoading(false);
        }
    }
    return(
        <section className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 border-b border-gray-800 w-full py-6'>
            <label htmlFor="password" className='font-semibold text-gray-300 text-sm sm:w-1/4 sm:text-right flex items-center sm:justify-end gap-2'>
                <span className='text-gray-500'><FaLock /></span>
                Old Password
            </label>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:w-3/4'>
                <input
                    type="password"
                    id="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className='flex-1 w-full bg-transparent border border-gray-800 rounded-xl px-4 py-2.5 focus:border-gray-500 focus:outline-none transition-colors'
                    placeholder="Enter your old password"
                    autoComplete="off"
                />
            </div>
                <label htmlFor="newPassword" className='font-semibold text-gray-300 text-sm sm:w-1/4 sm:text-right flex items-center sm:justify-end gap-2'>
                <span className='text-gray-500'><FaLock /></span>
                New Password
            </label>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:w-3/4'>
                <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className='flex-1 w-full bg-transparent border border-gray-800 rounded-xl px-4 py-2.5 focus:border-gray-500 focus:outline-none transition-colors'
                    placeholder="Enter your new password"
                    autoComplete="off"
                />
                <button className='bg-white hover:bg-gray-200 text-black text-sm font-bold px-6 py-2.5 rounded-lg transition-colors w-full sm:w-auto h-10' onClick={handleUpdate} disabled={loading}>
                    {loading ? "Updating..." : "Update"}
                </button>
            </div>          

        </section>
    )
}