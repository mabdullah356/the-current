import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/Components/AuthProvider";
import { ToastProvider } from "@/Components/ToastProvider";


export const metadata: Metadata = {
  title: "Instagram",
  description: "Next.js Instagram clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}



