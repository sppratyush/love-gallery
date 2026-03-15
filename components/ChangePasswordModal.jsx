"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ShieldCheck, Loader2, Sparkles } from "lucide-react";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Memory Key updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          onClose();
          setSuccess("");
        }, 2000);
      } else {
        setError(data.details || data.error || "Failed to update key");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-rose-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 bg-pink-500/20 rounded-full mb-4 ring-4 ring-pink-500/10">
                <ShieldCheck className="w-8 h-8 text-pink-400" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-indigo-200">
                Update Vault Key
              </h2>
              <p className="text-rose-200/60 text-sm mt-1">Enhance the sanctuary of our memories</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-rose-200/70 mb-1.5 ml-1">Current Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400/50" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/40 text-rose-100 placeholder-rose-200/20"
                    placeholder="Existing password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-rose-200/70 mb-1.5 ml-1">New Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-rose-100 placeholder-rose-200/20"
                    placeholder="New password (min 6 chars)"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-rose-200/70 mb-1.5 ml-1">Confirm New Key</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-rose-100 placeholder-rose-200/20"
                    placeholder="Repeat new password"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-emerald-400 text-sm text-center bg-emerald-400/10 py-2 rounded-lg border border-emerald-400/20">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Update Key <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
