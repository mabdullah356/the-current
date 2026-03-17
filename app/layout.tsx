import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/Components/AuthProvider";


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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}



