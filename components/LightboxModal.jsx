"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Download, CalendarDays, User } from "lucide-react";
import { format } from "date-fns";

export default function LightboxModal({ memory, isOpen, onClose, onToggleFavorite }) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (memory) {
      setIsFav(memory.favorite);
    }
  }, [memory]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !memory) return null;

  const isVideo = memory.type === "video";

  const toggleFav = (e) => {
    e.stopPropagation();
    setIsFav(!isFav);
    onToggleFavorite(memory._id, !isFav);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(memory.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Extract filename safely
      const filename = memory.file_url.split("/").pop() || "memory-download";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
      // Fallback open if blocked by CORS or other issues
      window.open(memory.file_url, "_blank");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        {/* Top Controls */}
        <div className="fixed top-4 right-4 flex items-center gap-2 md:gap-4 z-[110]">
          <button
            onClick={toggleFav}
            className={`p-3 rounded-full backdrop-blur-md transition-colors ${
              isFav ? "bg-pink-500/20 text-pink-500" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Heart className={`w-6 h-6 ${isFav ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={handleDownload}
            className="p-3 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            <Download className="w-6 h-6" />
          </button>
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="min-h-full w-full flex flex-col items-center justify-center p-4 py-20 md:p-8 pointer-events-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-5xl flex flex-col items-center justify-center w-full pointer-events-auto mt-4 md:mt-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black w-full flex justify-center items-center">
              {isVideo ? (
                <video
                  src={memory.file_url}
                  className="w-full h-auto max-h-[65vh] md:max-h-[80vh] object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={memory.file_url}
                  alt={memory.caption}
                  className="w-full h-auto max-h-[65vh] md:max-h-[80vh] object-contain"
                />
              )}
            </div>

          {/* Details */}
          <div className="w-full mt-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <p className="text-white text-xl font-serif font-medium">{memory.caption || "A beautiful memory"}</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/80 font-medium">
              <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                <User className="w-4 h-4 text-pink-400" />
                <span>By {memory.uploaded_by}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                <CalendarDays className="w-4 h-4 text-indigo-400" />
                <span>{format(new Date(memory.created_at), "MMMM d, yyyy")}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </motion.div>
    </AnimatePresence>
  );
}
