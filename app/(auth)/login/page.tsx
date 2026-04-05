"use client";

import React, { useState } from 'react';
import { FaFacebook } from 'react-icons/fa6';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: formData.identifier,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh(); // Ensure the session is updated
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center px-4 py-8 md:py-0 min-h-screen">
      <div className="hidden md:flex flex-col items-center justify-center max-w-lg mr-12 lg:mr-24 mb-12 md:mb-0">
        <div className="mb-8 self-center">
          <svg aria-label="Instagram" color="white" fill="white" height="96" role="img" viewBox="0 0 24 24" width="96">
            <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.012 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.012 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.012-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.334.935 20.665.522 19.874.217c-.765-.295-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.584-.071 4.85c-.055 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.056.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.015-4.85-.071c-1.17-.055-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.015-3.584.071-4.85c.055-1.17.249-1.805.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.057 1.646-.07 4.85-.07zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
          </svg>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-center max-w-sm mb-12 leading-tight">
          See everyday moments from your <span className="bg-linear-to-r from-orange-400 via-pink-600 to-purple-600 bg-clip-text text-transparent">close friends.</span>
        </h1>
        <div className="relative w-full max-w-[24rem] h-96">
          <Image
            fill
            src="https://static.cdninstagram.com/rsrc.php/v4/yt/r/pAv7hjq-51n.png"
            alt="Instagram"
            className="object-contain"
          />
        </div>
      </div>
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="w-full bg-[#121212] md:bg-black border md:border-none border-[#262626] rounded-xl p-8 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-8 self-start">Log in to Instagram</h2>

          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/50 text-red-500 text-xs py-3 px-4 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <input
              required
              type="text"
              name="identifier"
              placeholder="Username or email"
              value={formData.identifier}
              onChange={handleChange}
              className="w-full bg-[#1c1c1c] border border-[#363636] rounded-md px-3 py-3 text-sm focus:outline-none focus:border-gray-500 placeholder-gray-500 transition-colors"
            />
            <input
              required
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#1c1c1c] border border-[#363636] rounded-md px-3 py-3 text-sm focus:outline-none focus:border-gray-500 placeholder-gray-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0095f6] hover:bg-[#1877f2] disabled:bg-[#0095f6]/50 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-lg py-2 mt-4 text-sm"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
          <a href="#" className="text-sm mt-6 hover:opacity-70">
            Forgotten password?
          </a>
          <div className="flex items-center gap-2 mt-10 cursor-pointer hover:opacity-80">
            <FaFacebook className="text-[#1877f2] size-5" />
            <span className="text-sm font-semibold">Log in with Facebook</span>
          </div>
          <Link href="/signup" className="w-full border border-[#363636] hover:bg-white/5 rounded-lg py-2 mt-6 text-sm font-semibold text-center transition-colors">
            Create new account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;