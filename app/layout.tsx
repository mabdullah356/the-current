import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/Components/AuthProvider";
import { ToastProvider } from "@/Components/ToastProvider";


export const metadata: Metadata = {
  title: "Current",
  description: "Share photos with friends",
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



