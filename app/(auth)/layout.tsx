import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "PixelFeed - Login & Signup",
    description: "Log in to PixelFeed to explore your feed, connect with friends, and share moments. Sign up for a new account.",
    keywords: "PixelFeed, login, signup, social media, photo sharing",
    openGraph: {
        title: "PixelFeed - Login & Signup",
        description: "Connect with friends and share moments on PixelFeed.",
        type: "website",
    },
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white font-sans">
            <main className="grow flex flex-col items-center justify-center">
                {children}
            </main>
            <footer className="w-full p-6 flex flex-col items-center gap-4 text-[#8e8e8e] text-xs">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-4xl px-4 text-center">
                    <a href="#" className="hover:underline">Meta</a>
                    <a href="#" className="hover:underline">About</a>
                    <a href="#" className="hover:underline">Blog</a>
                    <a href="#" className="hover:underline">Jobs</a>
                    <a href="#" className="hover:underline">Help</a>
                    <a href="#" className="hover:underline">API</a>
                    <a href="#" className="hover:underline">Privacy</a>
                    <a href="#" className="hover:underline">Terms</a>
                    <a href="#" className="hover:underline">Locations</a>
                    <a href="#" className="hover:underline">PixelFeed</a>
                    <a href="#" className="hover:underline">Threads</a>
                    <a href="#" className="hover:underline">Contact Uploading & Non-Users</a>
                    <a href="#" className="hover:underline">Meta Verified</a>
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <select className="bg-transparent border-none outline-none cursor-pointer">
                        <option>English (UK)</option>
                        <option>English</option>
                        <option>Español</option>
                        <option>Français</option>
                    </select>
                    <span>© 2026 PixelFeed</span>
                </div>
            </footer>
        </div>
    );
}
