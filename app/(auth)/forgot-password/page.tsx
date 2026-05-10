"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { useToast } from "@/Components/ToastProvider";
import axios from "axios";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const inputClass = "w-full bg-[#111111] border border-[#333333] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6d6dff] placeholder:text-[#7d7d7d] transition-colors";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSent(true);
      showToast("Reset link sent if email is registered", "success");
    } catch {
      showToast("Something went wrong. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-0 md:px-4 md:py-10 text-white">
      <section className="w-full max-w-md flex flex-col items-center px-4 md:px-0">
        <div className="w-full rounded-3xl border border-white/10 bg-[#0d0d0d]/95 p-8 shadow-[0_30px_70px_-35px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 ring-1 ring-blue-500/30">
              <FiMail className="text-blue-500 text-2xl" />
            </div>
          </div>
          <h1 className="text-center text-2xl font-semibold mt-2">
            Forgot password?
          </h1>
          <p className="text-sm text-white/70 mt-2 mb-6 text-center">
            {sent
              ? "Check your email for the reset link"
              : "Enter your email and we'll send you a reset link"}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="sr-only">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7d7d7d] text-sm" />
                  <input
                    id="email"
                    required
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 disabled:from-blue-500/50 disabled:to-sky-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-3 mt-2 text-sm"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <FiMail className="text-green-500 text-2xl" />
              </div>
              <p className="text-sm text-white/70 mb-6">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-blue-500 hover:underline"
              >
                Try a different email
              </button>
            </div>
          )}

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-white/70 hover:text-white mt-6 transition-colors"
          >
            <FiArrowLeft className="text-sm" />
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ForgotPasswordPage;
