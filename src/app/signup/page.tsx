"use client";

import { useAuth } from "@/context/AuthContext";
import { Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
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
          <p className="text-muted">Create your account</p>
        </div>

        {success && (
          <div className="mb-6 bg-primary/10 border border-primary/50 text-primary/80 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">
              ✓ Account created successfully!
            </p>
            <p>
              Please check your email for a verification link to activate your
              account.
            </p>
          </div>
        )}

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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-muted text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
