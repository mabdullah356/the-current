"use client";

import React, { useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa6';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const SignupPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    userName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Automatically sign in after signup
      const result = await signIn("credentials", {
        redirect: false,
        identifier: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError("User created, but failed to log in automatically.");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] flex flex-col items-center py-12">
      <div className="w-full flex items-center justify-between mb-8 px-2 md:px-0">
        <Link href="/login" className="hover:opacity-70">
          <FaChevronLeft className="size-5" />
        </Link>
        <div className="flex items-center gap-1 opacity-80">
          <svg aria-label="Meta" color="white" fill="white" height="12" role="img" viewBox="0 0 448 512" width="14">
            <path d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM266.4 361.6c-11.8 0-21.6-4-29.3-11.8-7.7-7.8-11.6-17.6-11.6-29.4s3.9-21.6 11.6-29.4c7.7-7.8 17.5-11.8 29.3-11.8s21.6 4 29.3 11.8c7.7 7.8 11.6 17.6 11.6 29.4s-3.9 21.6-11.6 29.4c-7.7 7.8-17.5 11.8-29.3 11.8zm-119.2 0c-11.8 0-21.6-4-29.3-11.8-7.7-7.8-11.6-17.6-11.6-29.4s3.9-21.6 11.6-29.4c7.7-7.8 17.5-11.8 29.3-11.8 11.8 0 21.6 4 29.3 11.8 7.7 7.8 11.6 17.6 11.6 29.4s-3.9 21.6-11.6 29.4c-7.7 7.8-17.5 11.8-29.3 11.8zm219.6-140.4c-11.8 0-21.6-4-29.3-11.8-7.7-7.8-11.6-17.6-11.6-29.4s3.9-21.6 11.6-29.4c7.7-7.8 17.5-11.8 29.3-11.8s21.6 4 29.3 11.8c7.7 7.8 11.6 17.6 11.6 29.4s-3.9 21.6-11.6 29.4c-7.7 7.8-17.5 11.8-29.3 11.8zm-119.2 0c-11.8 0-21.6-4-29.3-11.8-7.7-7.8-11.6-17.6-11.6-29.4s3.9-21.6 11.6-29.4c7.7-7.8 17.5-11.8 29.3-11.8 11.8 0 21.6 4 29.3 11.8 7.7 7.8 11.6 17.6 11.6 29.4s-3.9 21.6-11.6 29.4c-7.7 7.8-17.5 11.8-29.3 11.8zm-119.2 0c-11.8 0-21.6-4-29.3-11.8-7.7-7.8-11.6-17.6-11.6-29.4s3.9-21.6 11.6-29.4c7.7-7.8 17.5-11.8 29.3-11.8 11.8 0 21.6 4 29.3 11.8 7.7 7.8 11.6 17.6 11.6 29.4s-3.9 21.6-11.6 29.4c-7.7 7.8-17.5 11.8-29.3 11.8z" />
          </svg>
          <span className="text-[10px] font-bold tracking-wider uppercase">Meta</span>
        </div>
        <div className="w-5" />
      </div>
      <div className="w-full flex flex-col items-start px-2 md:px-0">
        <h1 className="text-2xl font-bold mb-2">Get started on Instagram</h1>
        <p className="text-[#a8a8a8] text-sm mb-8">Sign up to see photos and videos from your friends.</p>

        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/50 text-red-500 text-xs py-3 px-4 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold">Mobile number or email</label>
            <input
              required
              type="text"
              name="email"
              placeholder='example@gmail.com'
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#1c1c1c] border border-[#363636] rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold">Password</label>
            <input
              required
              type="password"
              name="password"
              placeholder='********'
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#1c1c1c] border border-[#363636] rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold">Name</label>
            <input
              required
              type="text"
              name="name"
              placeholder='Your Full Name'
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#1c1c1c] border border-[#363636] rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold">Username</label>
            <input
              required
              type="text"
              name="userName"
              placeholder='Your Username'
              value={formData.userName}
              onChange={handleChange}
              className="w-full bg-[#1c1c1c] border border-[#363636] rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0095f6] hover:bg-[#1877f2] disabled:bg-[#0095f6]/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {loading ? "Creating account..." : "Submit"}
          </button>
        </form>
        <Link href="/login" className="w-full border border-[#363636] hover:bg-white/5 rounded-lg py-2.5 mt-4 text-sm font-semibold text-center transition-colors">
          I already have an account
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;