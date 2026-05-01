"use client";
import React, { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from "react-icons/fi";

type ToastType = "success" | "warning" | "info" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, setToasts }: { toasts: Toast[]; setToasts: React.Dispatch<React.SetStateAction<Toast[]>> }) {
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border animate-slideDown ${
            toast.type === "success"
              ? "bg-green-500/90 border-green-400/50"
              : toast.type === "warning"
              ? "bg-yellow-500/90 border-yellow-400/50"
              : toast.type === "info"
              ? "bg-blue-500/90 border-blue-400/50"
              : "bg-red-500/90 border-red-400/50"
          }`}
        >
          {toast.type === "success" ? (
            <FiCheck className="text-white text-lg shrink-0" />
          ) : toast.type === "warning" ? (
            <FiAlertTriangle className="text-white text-lg shrink-0" />
          ) : toast.type === "info" ? (
            <FiInfo className="text-white text-lg shrink-0" />
          ) : (
            <FiX className="text-white text-lg shrink-0" />
          )}
          <span className="text-white text-sm font-medium flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="text-white/70 hover:text-white shrink-0">
            <FiX className="text-sm" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
