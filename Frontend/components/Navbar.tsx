"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Title */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
              TaskFlow Pro
            </Link>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <div className="hidden md:flex flex-col items-end mr-4">
                  <span className="text-sm font-bold text-slate-900">
                    {user.name}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold tracking-wide capitalize bg-slate-100 px-2 py-0.5 rounded-md mt-1">
                    {user.role.replace("_", " ")}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
