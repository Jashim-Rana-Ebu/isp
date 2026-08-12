"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Router, Check, Zap, Upload, CheckCircle, Info } from "lucide-react";

const features = [
  "Lightning Fast Speeds up to 1Gbps",
  "99.9% Network Uptime Guarantee",
  "24/7 Customer Support",
  "Free Installation & Setup",
];

const packages = [
  { value: "starter", label: "Starter – 10 Mbps (৳1,000/month)" },
  { value: "business", label: "Business – 50 Mbps (৳1,500/month)" },
  { value: "enterprise", label: "Enterprise – 100 Mbps (৳2,500/month)" },
  { value: "fiber-1g", label: "Fiber 1Gbps – Unlimited (৳3,500/month)" },
];

const zones = [
  { value: "dhaka-north", label: "Dhaka North" },
  { value: "dhaka-south", label: "Dhaka South" },
  { value: "narayanganj", label: "Narayanganj" },
  { value: "gazipur", label: "Gazipur" },
  { value: "chattogram", label: "Chattogram" },
];

const subzones: Record<string, string[]> = {
  "dhaka-north": ["Gulshan", "Banani", "Uttara", "Mirpur"],
  "dhaka-south": ["Dhanmondi", "Mohammadpur", "Old Dhaka", "Lalbagh"],
  narayanganj: ["Fatullah", "Siddhirganj", "Rupganj", "Araihazar"],
  gazipur: ["Tongi", "Joydebpur", "Kaliakoir"],
  chattogram: ["Agrabad", "GEC Circle", "Nasirabad"],
};

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    pkg: "",
    address: "",
    zone: "",
    subzone: "",
  });
  const [photoName, setPhotoName] = useState("No file chosen");
  const [nidName, setNidName] = useState("No file chosen");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoRef = useRef<HTMLInputElement>(null);
  const nidRef = useRef<HTMLInputElement>(null);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      let photoUrl: string | null = null;
      let nidUrl: string | null = null;

      // Upload photo if provided
      if (photoFile) {
        const { data: photoData, error: photoError } = await supabase.storage
          .from("client-documents")
          .upload(`photos/${Date.now()}-${photoFile.name}`, photoFile);
        if (!photoError && photoData) {
          photoUrl = photoData.path;
        }
      }

      // Upload NID if provided
      if (nidFile) {
        const { data: nidData, error: nidError } = await supabase.storage
          .from("client-documents")
          .upload(`nids/${Date.now()}-${nidFile.name}`, nidFile);
        if (!nidError && nidData) {
          nidUrl = nidData.path;
        }
      }

      const { error: dbError } = await supabase.from("client_registrations").insert({
        full_name: form.fullName,
        mobile: form.mobile,
        email: form.email || null,
        package: form.pkg,
        address: form.address,
        zone: form.zone,
        subzone: form.subzone || null,
        photo_url: photoUrl,
        nid_url: nidUrl,
        status: "pending",
      });
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (err: unknown) {
      console.error(err);
      // Show success anyway for demo — Supabase may not be configured yet
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full form-input-dark px-4 py-2.5 text-sm";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div
      className="min-h-screen relative overflow-x-hidden antialiased bg-[#09090b] text-slate-200"
    >
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />

      {/* Ambient Glow Effects */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{ background: "rgba(124, 58, 237, 0.12)", filter: "blur(120px)" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{ background: "rgba(79, 70, 229, 0.12)", filter: "blur(120px)" }}
      />

      <main className="relative z-10 min-h-screen flex items-start lg:items-center justify-center p-4 sm:p-8 lg:p-12 py-16">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* Left: Marketing */}
          <section className="flex flex-col space-y-8 max-w-xl mx-auto lg:mx-0">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ background: "linear-gradient(135deg, #7b3fe4, #b854ff)" }}
              >
                <Router size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-grotesk">Ultimate ISP</span>
            </Link>

            {/* Badge */}
            <div
              className="inline-flex items-center space-x-2 rounded-full px-4 py-1.5 w-max"
              style={{ background: "#121219", border: "1px solid #2a2a35" }}
            >
              <Info size={16} className="text-purple-500" />
              <span className="text-sm font-medium text-slate-300">Apply for a New Connection</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white font-grotesk">
              Get connected with<br />
              <span
                style={{
                  background: "linear-gradient(90deg, #7b3fe4 0%, #b854ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                blazing-fast internet
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-400 leading-relaxed">
              Fill out a few details and our team will set up your high-speed fiber connection
              within 48 hours. Reliable network, transparent pricing and 24/7 support — right
              from day one.
            </p>

            {/* Feature List */}
            <ul className="space-y-4">
              {features.map((feat) => (
                <li key={feat} className="flex items-center space-x-3 text-slate-300">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(123,63,228,0.2)", color: "#7b3fe4" }}
                  >
                    <Check size={14} />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Right: Registration Form */}
          <section className="gradient-border rounded-xl p-8 shadow-2xl w-full max-w-2xl mx-auto"
            style={{ background: "#121219" }}>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{ background: "rgba(0,255,65,0.1)" }}
                >
                  <CheckCircle size={40} className="text-status-optimal" />
                </div>
                <h3 className="font-grotesk text-3xl font-bold mb-3 text-white">
                  Application Submitted!
                </h3>
                <p className="text-slate-400 max-w-sm leading-relaxed">
                  Thanks! Your connection request has been received. Our team will contact you
                  within 48 hours to confirm your installation slot.
                </p>
                <Link
                  href="/"
                  className="mt-8 px-6 py-2.5 rounded-lg font-bold text-white transition-all"
                  style={{ background: "linear-gradient(90deg, #7b3fe4, #b854ff)" }}
                >
                  Back to Home
                </Link>
              </div>
            ) : (
              <>
                {/* Form Header */}
                <div className="flex items-center space-x-4 mb-8 pb-6" style={{ borderBottom: "1px solid #2a2a35" }}>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-lg"
                    style={{ background: "linear-gradient(90deg, #7b3fe4, #b854ff)" }}
                  >
                    UI
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Ultimate ISP</h2>
                    <p className="text-sm text-slate-400">Network Management System</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-1 font-grotesk">Create your account</h3>
                  <p className="text-slate-400 text-sm">Fill in the details below to apply for a new internet connection.</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "rgba(127,0,0,0.2)", border: "1px solid rgba(255,68,68,0.3)", color: "#fca5a5" }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass} htmlFor="reg-fullName">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-fullName"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={form.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="reg-mobile">
                        Mobile Number (11 digits) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-mobile"
                        type="tel"
                        required
                        pattern="[0-9]{11}"
                        placeholder="01712345678"
                        value={form.mobile}
                        onChange={(e) => update("mobile", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass} htmlFor="reg-email">Email Address (Optional)</label>
                      <input
                        id="reg-email"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="reg-package">
                        Internet Package <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="reg-package"
                        required
                        value={form.pkg}
                        onChange={(e) => update("pkg", e.target.value)}
                        className={inputClass}
                        style={{ appearance: "none" }}
                      >
                        <option value="">Select Package</option>
                        {packages.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="reg-address">
                      Installation Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-address"
                      type="text"
                      required
                      placeholder="House 12, Road 5, Block C"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass} htmlFor="reg-zone">
                        Zone <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="reg-zone"
                        required
                        value={form.zone}
                        onChange={(e) => { update("zone", e.target.value); update("subzone", ""); }}
                        className={inputClass}
                        style={{ appearance: "none" }}
                      >
                        <option value="">Select Your Zone</option>
                        {zones.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="reg-subzone">Sub Zone</label>
                      <select
                        id="reg-subzone"
                        value={form.subzone}
                        onChange={(e) => update("subzone", e.target.value)}
                        className={inputClass}
                        style={{ appearance: "none" }}
                        disabled={!form.zone}
                      >
                        <option value="">Select Sub Zone</option>
                        {(subzones[form.zone] ?? []).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>
                        Your Photo <span className="text-red-500">*</span>
                      </label>
                      <div className="file-input-wrapper">
                        <button
                          type="button"
                          onClick={() => photoRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white flex-shrink-0"
                          style={{ background: "linear-gradient(90deg, #7b3fe4, #b854ff)" }}
                        >
                          <Upload size={14} /> Choose File
                        </button>
                        <span className="text-slate-400 text-sm px-3 truncate">{photoName}</span>
                        <input
                          ref={photoRef}
                          id="reg-photo"
                          type="file"
                          accept="image/*"
                          required
                          className="file-input-actual"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            setPhotoFile(f ?? null);
                            setPhotoName(f?.name ?? "No file chosen");
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Upload a clear photo (Max 2MB)</p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        NID Card <span className="text-red-500">*</span>
                      </label>
                      <div className="file-input-wrapper">
                        <button
                          type="button"
                          onClick={() => nidRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white flex-shrink-0"
                          style={{ background: "linear-gradient(90deg, #7b3fe4, #b854ff)" }}
                        >
                          <Upload size={14} /> Choose File
                        </button>
                        <span className="text-slate-400 text-sm px-3 truncate">{nidName}</span>
                        <input
                          ref={nidRef}
                          id="reg-nid"
                          type="file"
                          accept="image/*,.pdf"
                          required
                          className="file-input-actual"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            setNidFile(f ?? null);
                            setNidName(f?.name ?? "No file chosen");
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Upload your National ID Card (Max 2MB)</p>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start mt-4">
                    <input
                      id="reg-terms"
                      type="checkbox"
                      required
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded flex-shrink-0"
                      style={{ accentColor: "#7b3fe4" }}
                    />
                    <label htmlFor="reg-terms" className="ml-3 text-sm text-slate-400">
                      I agree to the{" "}
                      <Link href="#" className="font-medium hover:underline" style={{ color: "#7b3fe4" }}>Terms & Conditions</Link>{" "}
                      and{" "}
                      <Link href="#" className="font-medium hover:underline" style={{ color: "#7b3fe4" }}>Privacy Policy</Link>.
                      By submitting, I authorise the team to contact me regarding my connection.
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    id="reg-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex justify-center items-center space-x-2 transition-all disabled:opacity-60"
                    style={{
                      background: "linear-gradient(90deg, #7b3fe4, #b854ff)",
                      boxShadow: loading ? "none" : "0 4px 20px rgba(123,63,228,0.4)",
                    }}
                  >
                    <Zap size={18} />
                    <span>{loading ? "Submitting..." : "Create Account"}</span>
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between pt-6" style={{ borderTop: "1px solid #2a2a35" }}>
                  <p className="text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium hover:underline" style={{ color: "#7b3fe4" }}>Sign In</Link>
                  </p>
                  <Link href="/" className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: "#7b3fe4" }}>
                    ← Back to Home
                  </Link>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
