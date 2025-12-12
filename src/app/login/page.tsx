"use client";

import { useAuth } from "@/context/AuthContext";
import { Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-hover to-surface flex items-center justify-center px-6 relative">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors"
        aria-label="Back to home"
        title="Back to home"
      >
        <Home size={20} className="text-white" />
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="iAudioBook Logo"
              width={80}
              height={80}
              className="rounded-xl"
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            iAudioBook
          </h1>
          <p className="text-muted">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-secondary text-white border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-secondary text-white border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-error-bg border border-error-border text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-light text-dark font-semibold py-3 rounded-full hover:bg-light/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-muted text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-foreground font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
