"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FiLock, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import { useToast } from "@/Components/ToastProvider";
import axios from "axios";

const ResetPasswordPage = () => {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { showToast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const inputClass = "w-full bg-[#111111] border border-[#333333] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6d6dff] placeholder:text-[#7d7d7d] transition-colors";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (password.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", { token, password });
      setDone(true);
      showToast("Password reset successful!", "success");
    } catch {
      showToast("Invalid or expired reset link", "error");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black p-0 md:px-4 md:py-10 text-white">
        <section className="w-full max-w-md flex flex-col items-center px-4 md:px-0">
          <div className="w-full rounded-3xl border border-white/10 bg-[#0d0d0d]/95 p-8 shadow-[0_30px_70px_-35px_rgba(0,0,0,0.8)] backdrop-blur-md text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 ring-1 ring-green-500/30">
                <FiCheck className="text-green-500 text-2xl" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold mb-2">Password reset!</h1>
            <p className="text-sm text-white/70 mb-6">
              Your password has been updated successfully.
            </p>
            <Link
              href="/login"
              className="w-full inline-block bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 text-white font-semibold rounded-2xl py-3 text-sm"
            >
              Log in with new password
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-0 md:px-4 md:py-10 text-white">
      <section className="w-full max-w-md flex flex-col items-center px-4 md:px-0">
        <div className="w-full rounded-3xl border border-white/10 bg-[#0d0d0d]/95 p-8 shadow-[0_30px_70px_-35px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 ring-1 ring-blue-500/30">
              <FiLock className="text-blue-500 text-2xl" />
            </div>
          </div>
          <h1 className="text-center text-2xl font-semibold mt-2">
            Set new password
          </h1>
          <p className="text-sm text-white/70 mt-2 mb-6 text-center">
            Must be at least 8 characters
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="sr-only">New password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7d7d7d] text-sm" />
                <input
                  id="password"
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7d7d7d] hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="sr-only">Confirm new password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7d7d7d] text-sm" />
                <input
                  id="confirmPassword"
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pl-10 pr-10`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 disabled:from-blue-500/50 disabled:to-sky-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-3 mt-2 text-sm"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-white/70 hover:text-white mt-6 transition-colors"
          >
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
