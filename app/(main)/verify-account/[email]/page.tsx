"use client";

import { useEffect, useRef, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";

import { MdOutlineMarkEmailRead } from "react-icons/md";
import { IoReloadSharp } from "react-icons/io5";
import { RiErrorWarningLine } from "react-icons/ri";
import { FiCheckCircle } from "react-icons/fi";

interface PageProps {
  params: Promise<{ email: string }>;
}

type Status = "idle" | "loading" | "success" | "error";

export default function VerifyAccountPage({ params }: PageProps) {
  const { email: rawEmail } = use(params);
  const email = decodeURIComponent(rawEmail);
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendStatus, setResendStatus] = useState<Status>("idle");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendError, setSendError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    setCanResend(false);
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendOtp = useCallback(async () => {
    try {
      const res = await fetch("/api/users/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setOtpSent(true);
      startCountdown();
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : "Failed to send OTP");
    }
  }, [email, startCountdown]);

  useEffect(() => {
    sendOtp();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sendOtp]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    setErrorMsg("");
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const updated = [...otp];
        updated[index] = "";
        setOtp(updated);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otp];
    pasted.split("").forEach((char, i) => {
      if (i < 6) updated[i] = char;
    });
    setOtp(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const isOtpComplete = otp.every((d) => d !== "");

  const handleVerify = async () => {
    if (!isOtpComplete) {
      setErrorMsg("Please enter all 6 digits.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/users/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join("") }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Verification failed. Please try again.");
        return;
      }

      setStatus("success");
      setSuccessMsg(data.message || "Email verified successfully!");
      setTimeout(() => router.push("/login"), 1800);
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResendStatus("loading");
    setOtp(Array(6).fill(""));
    setErrorMsg("");
    setSendError("");
    inputRefs.current[0]?.focus();

    try {
      const res = await fetch("/api/users/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend OTP");
      setResendStatus("idle");
      startCountdown();
    } catch (err: unknown) {
      setResendStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to resend OTP");
    }
  };

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, "$1***$2");

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-0 md:px-4 py-10">
      <div className="w-full max-w-sm px-4 md:px-0">
        <div className="flex justify-center mb-8">
          <svg className="text-5xl text-zinc-600" fill="currentColor" viewBox="0 0 24 24" width="48" height="48"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
        </div>

        <div className="bg-black border border-zinc-800 rounded-xl px-8 py-10 shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white/5 rounded-full p-4 mb-4">
              <MdOutlineMarkEmailRead className="text-3xl text-zinc-400" />
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Enter confirmation code
            </h1>
            {otpSent && !sendError && (
              <p className="text-sm text-zinc-400 text-center mt-2 leading-relaxed">
                Enter the 6-digit code we sent to{" "}
                <span className="font-medium text-white">{maskedEmail}</span>
              </p>
            )}
            {sendError && (
              <p className="text-sm text-red-500 text-center mt-2">{sendError}</p>
            )}
          </div>

          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={status === "loading" || status === "success"}
                className={[
                  "w-11 h-12 text-center text-lg font-semibold rounded-lg border outline-none transition-all duration-150",
                  "text-white bg-black",
                  status === "success"
                    ? "border-green-500 bg-green-500/10"
                    : errorMsg && !digit
                    ? "border-red-500 bg-red-500/10"
                    : digit
                    ? "border-white bg-white/5"
                    : "border-zinc-700 focus:border-white",
                  (status === "loading" || status === "success") ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              />
            ))}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
              <RiErrorWarningLine className="text-red-500 text-base shrink-0" />
              <p className="text-xs text-red-400">{errorMsg}</p>
            </div>
          )}

          {status === "success" && successMsg && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-4">
              <FiCheckCircle className="text-green-500 text-base shrink-0" />
              <p className="text-xs text-green-400">{successMsg}</p>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={!isOtpComplete || status === "loading" || status === "success"}
            className={[
              "w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150",
              isOtpComplete && status !== "loading" && status !== "success"
                ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                : "bg-blue-500/50 text-white/50 cursor-not-allowed",
            ].join(" ")}
          >
            {status === "loading"
              ? "Verifying..."
              : status === "success"
              ? "Verified!"
              : "Confirm"}
          </button>

          <div className="mt-5 flex flex-col items-center gap-1">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={resendStatus === "loading"}
                className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors"
              >
                <IoReloadSharp
                  className={resendStatus === "loading" ? "animate-spin" : ""}
                />
                {resendStatus === "loading" ? "Sending..." : "Resend code"}
              </button>
            ) : (
              <p className="text-xs text-zinc-500">
                Resend code in{" "}
                <span className="font-semibold text-zinc-300">{countdown}s</span>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Wrong account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="text-zinc-300 font-medium hover:underline"
          >
            Go back
          </button>
        </p>
      </div>
    </main>
  );
}
