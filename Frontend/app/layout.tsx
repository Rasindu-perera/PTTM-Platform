import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow Pro - Project & Team Management",
  description: "A Full Stack Project and Team Task Management Platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased bg-slate-50 text-slate-900" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col font-sans`}>
        <AuthProvider>
          <Navbar />
          {/* Main content wrapper to grow and take remaining height */}
          <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
