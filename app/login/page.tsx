"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Router, Eye, EyeOff, LogIn, BarChart2, FileText, Server, Users, Zap, Info } from "lucide-react";

const features = [
  { icon: BarChart2, label: "Real-time Network Monitoring & Analytics" },
  { icon: FileText, label: "Automated Billing & Invoice Generation" },
  { icon: Server, label: "Mikrotik & OLT Server Integration" },
  { icon: Users, label: "Comprehensive Client Management" },
];

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
      if (authError) throw authError;
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "block w-full pl-10 pr-4 py-3 bg-[#18181b] border border-[#3f3f46] rounded-lg text-sm text-[#f4f4f5] placeholder:text-zinc-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all";

  return (
    <div
      className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#09090b] text-zinc-200"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />

      {/* Ambient Glow Effects */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{ background: "rgba(124, 58, 237, 0.12)", filter: "blur(120px)" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{ background: "rgba(79, 70, 229, 0.12)", filter: "blur(120px)" }}
      />

      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative z-10">
        {/* Left Column: Branding */}
        <div className="w-full lg:w-1/2 flex flex-col items-start text-left space-y-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 mb-4 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              <Router size={20} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-grotesk">Ultimate ISP</span>
          </Link>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm text-zinc-300"
            style={{ background: "#18181b", border: "1px solid #27272a" }}>
            <Zap size={16} className="text-purple-500" />
            Enterprise ISP Management
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight font-grotesk">
            Welcome back to your <br />
            <span style={{
              background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Network Command<br />Center
            </span>
          </h1>

          {/* Description */}
          <p className="text-zinc-400 text-lg max-w-lg leading-relaxed">
            Manage your entire ISP infrastructure with powerful tools designed for modern network
            management. Real-time monitoring, automated billing, and comprehensive client
            management at your fingertips.
          </p>

          {/* Feature List */}
          <ul className="space-y-4 mt-4">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-zinc-300">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(39,39,42,0.5)", border: "1px solid rgba(63,63,70,0.5)" }}
                >
                  <Icon size={16} className="text-purple-400" />
                </div>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Login Card */}
        <div className="w-full lg:w-1/2 max-w-md mx-auto">
          <div
            className="rounded-2xl p-8 sm:p-10 relative overflow-hidden"
            style={{
              background: "rgba(18,18,22,0.7)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid #27272a",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            {/* Top accent */}
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ background: "linear-gradient(90deg, #7c3aed, #4f46e5)" }}
            />

            {/* Card Header */}
            <div className="flex items-center gap-4 mb-8 pb-6" style={{ borderBottom: "1px solid #27272a" }}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
              >
                U
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">ISP CRM</h2>
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Network Management System</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-1 font-grotesk">Welcome Back</h3>
              <p className="text-sm text-zinc-400">Sign in to access your ISP management dashboard</p>
            </div>

            {/* Info Banner */}
            <div
              className="mb-6 rounded-lg p-4 flex gap-3 text-sm text-purple-200"
              style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}
            >
              <Info size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Clients:</strong> Use your{" "}
                <span className="font-semibold text-white">Client ID</span> or{" "}
                <span className="font-semibold text-white">Mikrotik Username</span> to login
              </p>
            </div>

            {error && (
              <div
                className="mb-4 rounded-lg p-3 text-sm flex items-center gap-2"
                style={{ background: "rgba(127,0,0,0.2)", border: "1px solid rgba(255,68,68,0.3)", color: "#fca5a5" }}
              >
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Identifier */}
              <div>
                <label className="sr-only" htmlFor="identifier">Username, Email, or Client ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users size={18} className="text-zinc-500" />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    required
                    placeholder="Username, Email, or Client ID"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={inputClass}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="sr-only" htmlFor="password">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LogIn size={18} className="text-zinc-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass + " pr-10"}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-zinc-500 hover:text-zinc-300 transition-colors" />
                    ) : (
                      <Eye size={18} className="text-zinc-500 hover:text-zinc-300 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded text-purple-600 focus:ring-purple-600"
                    style={{ accentColor: "#7c3aed" }}
                  />
                  <span className="text-sm text-zinc-400">Remember me</span>
                </label>
                <Link
                  href="#"
                  className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  boxShadow: loading ? "none" : "0 4px 14px rgba(124, 58, 237, 0.3)",
                }}
              >
                <LogIn size={18} />
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Footer Links */}
            <div
              className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
              style={{ borderTop: "1px solid #27272a" }}
            >
              <p className="text-zinc-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Create Account
                </Link>
              </p>
              <Link
                href="/"
                className="font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
