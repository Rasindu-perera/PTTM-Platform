"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/axios";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      // Calls POST /api/auth/register
      await api.post("/auth/register", { name, email, password });
      
      setSuccessMsg("Registration successful! Redirecting to login...");
      
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg("Failed to connect to the server. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create an Account</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Join your team and start collaborating.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-200 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-semibold border border-emerald-200 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            {successMsg}
          </div>
        )}

        <form className="space-y-5 mt-8" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm font-medium"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm font-medium"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm font-medium"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5 ${
                isSubmitting ? "opacity-70 cursor-wait" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
