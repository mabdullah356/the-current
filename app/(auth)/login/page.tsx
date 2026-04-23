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
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-10 text-white">
      <div className="w-full max-w-5xl">
        <div className="mx-auto flex w-full flex-col items-center justify-center gap-10 lg:flex-row lg:items-start lg:gap-16">
          <div className="flex w-full max-w-lg flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_-30px_rgba(255,255,255,0.25)] backdrop-blur-sm">
            <div className="mb-8 flex flex-col items-center text-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                <svg aria-label="Instagram" color="white" fill="white" height="48" role="img" viewBox="0 0 24 24" width="48">
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
      </div>
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="w-full rounded-3xl border border-white/10 bg-[#0d0d0d]/95 p-8 shadow-[0_30px_70px_-35px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <h2 className="text-2xl font-semibold mb-4">Log in to Instagram</h2>
          <p className="text-sm text-white/70 mb-6">Sign in to continue and explore your feed.</p>

          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/50 text-red-500 text-xs py-3 px-4 rounded-2xl mb-4 text-center">
              {error}
            </div>
          )}
          {error=="Email is not verified,verify-first" && (
            <div 
            onClick={()=>router.push(`/verify-account/${formData.identifier}`)}
            className="w-full bg-blue-500/10 border border-blue-500/50 text-blue-500 text-xs py-3 px-4 rounded-2xl mb-4 text-center">
              Verify your account 
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <input
              required
              type="email"
              name="identifier"
              placeholder="email"
              value={formData.identifier}
              onChange={handleChange}
              className="w-full bg-[#111111] border border-[#333333] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6d6dff] placeholder:text-[#7d7d7d] transition-colors"
            />
            <input
              required
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#111111] border border-[#333333] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6d6dff] placeholder:text-[#7d7d7d] transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 disabled:from-blue-500/50 disabled:to-sky-500/50 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-2xl py-3 mt-4 text-sm"
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
  </div>
</div>
  );
};

export default LoginPage;