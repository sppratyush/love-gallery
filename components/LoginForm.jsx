"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Heart, Loader2, Sparkles } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/gallery");
        router.refresh();
      } else {
        const errorMessage = data.details ? `${data.error}: ${data.details}` : (data.error || "Login failed");
        setError(errorMessage);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-md p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
      
      <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-pink-500/20 rounded-full mb-6 ring-4 ring-pink-500/10 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
            <Heart className="w-10 h-10 text-pink-400 fill-pink-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-rose-300 to-indigo-300 drop-shadow-sm">
            Love Gallery
          </h1>
          <p className="text-rose-200/80 font-medium tracking-wide">A private sanctuary for our memories</p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-rose-200/80 mb-2 ml-1 tracking-wide">Gallery Code (ID)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-5 py-3.5 bg-black/40 border-2 border-pink-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400/60 focus:border-pink-400/50 text-rose-100 placeholder-rose-300/30 transition-all font-medium backdrop-blur-md shadow-inner"
            placeholder="Pratyush or Shmruti"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-rose-200/80 mb-2 ml-1 tracking-wide">Memory Key (Password)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3.5 bg-black/40 border-2 border-pink-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400/60 focus:border-pink-400/50 text-rose-100 placeholder-rose-300/30 transition-all font-medium backdrop-blur-md shadow-inner"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm text-center"
          >
            {error}
          </motion.p>
        )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-lg font-bold text-white bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
          >
            {/* Glossy button sheen overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out" />
            
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Unlock Vault <Sparkles className="w-5 h-5 opacity-80" />
              </span>
            )}
          </button>
      </form>
    </motion.div>
  );
}
