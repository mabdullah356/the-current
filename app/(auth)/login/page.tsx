"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/Components/ToastProvider";

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const inputClass = "w-full bg-[#111111] border border-[#333333] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6d6dff] placeholder:text-[#7d7d7d] transition-colors";

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

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      setError("Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-0 md:px-4 md:py-10 text-white">
      <section className="w-full max-w-5xl">
        <section className="mx-auto flex w-full flex-col items-center justify-center gap-10 lg:flex-row lg:items-start lg:gap-16">
          <div className="hidden md:flex w-full max-w-lg flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_-30px_rgba(255,255,255,0.25)] backdrop-blur-sm">
            <div className="mb-8 flex flex-col items-center text-center gap-5">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10"
                aria-label="Instagram Logo"
              >
                <svg
                  aria-label="Instagram"
                  color="white"
                  fill="white"
                  height="48"
                  role="img"
                  viewBox="0 0 24 24"
                  width="48"
                >
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.012 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.012 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.012-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.334.935 20.665.522 19.874.217c-.765-.295-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.584-.071 4.85c-.055 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.056.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.015-4.85-.071c-1.17-.055-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.015-3.584.071-4.85c.055-1.17.249-1.805.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.057 1.646-.07 4.85-.07zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
                </svg>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-center max-w-sm mb-12 leading-tight">
                See everyday moments from your{" "}
                <span className="bg-linear-to-r from-orange-400 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  close friends.
                </span>
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
          <div className="w-full max-w-md flex flex-col items-center md:px-4 px-0">
            <div className="w-full rounded-3xl">
              <div className="flex justify-center" aria-hidden="true">
                <svg
                  aria-label="Instagram"
                  color="white"
                  fill="white"
                  height="48"
                  role="img"
                  viewBox="0 0 24 24"
                  width="48"
                >
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.012 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.012 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.012-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.334.935 20.665.522 19.874.217c-.765-.295-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.584-.071 4.85c-.055 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.056.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.015-4.85-.071c-1.17-.055-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.015-3.584.071-4.85c.055-1.17.249-1.805.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.057 1.646-.07 4.85-.07zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
                </svg>
              </div>
              <h1 className="text-center text-2xl font-semibold mt-2 mb-4">
                Log in to Instagram Lite
              </h1>
              <p className="text-sm text-white/70 mb-6">
                Sign in to continue and explore your feed.
              </p>

              {error && (
                <div className={`w-full py-3 px-4 text-xs rounded-2xl text-center border mb-4 ${error === "Email is not verified,verify-first" ? "bg-blue-500/10 border-blue-500/50 text-blue-500 cursor-pointer" : "bg-red-500/10 border-red-500/50 text-red-500"}`} onClick={() => error === "Email is not verified,verify-first" && router.push(`/verify-account/${formData.identifier}`)}>
                  {error === "Email is not verified,verify-first" ? "Verify your account" : error}
                </div>
              )}

              <button 
              onClick={handleGoogleAuth}
              disabled={loading}
              className="my-4 flex items-center justify-center gap-3 w-full border border-zinc-900 text-white hover:text-zinc-100 bg-zinc-900 font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-5 h-5"
                >
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 
          12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 5.1 29.3 3 24 3 12.9 3 4 11.9 4 
          23s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c3 0 5.7 1.1 
          7.8 2.9l5.7-5.7C34.1 5.1 29.3 3 24 3c-7.7 0-14.3 4.4-17.7 10.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 43c5.2 0 10-2 13.5-5.2l-6.2-5.1C29.2 34.5 26.7 35 
          24 35c-5.3 0-9.7-3.6-11.3-8.5l-6.5 5C9.6 38.5 16.3 43 24 43z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.3 5.5-6.2 
          6.9l6.2 5.1C39.9 36.5 44 30.3 44 23c0-1.3-.1-2.5-.4-3.5z"
                  />
                </svg>
                Continue with Google
              </button>
              <form
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <label htmlFor="identifier" className="sr-only">
                    Email or Username
                  </label>
                  <input
                    id="identifier"
                    required
                    type="email"
                    name="identifier"
                    placeholder="Email or username"
                    value={formData.identifier}
                    onChange={handleChange}
                    className={inputClass}
                    aria-label="Email or username"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    required
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                    aria-label="Password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 disabled:from-blue-500/50 disabled:to-sky-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-3 mt-4 text-sm"
                  aria-busy={loading}
                >
                  {loading ? "Logging in..." : "Log in"}
                </button>
              </form>
              <div className="flex flex-col">
                <Link
                  href="/forgot-password"
                  className="text-sm mt-6 hover:opacity-70 transition-opacity"
                >
                  Forgotten password?
                </Link>
                <Link
                  href="/signup"
                  className="w-full border border-[#363636] rounded-lg py-2 mt-6 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 text-sm font-semibold text-center transition-colors"
                >
                  Create new account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
};

export default LoginPage;
