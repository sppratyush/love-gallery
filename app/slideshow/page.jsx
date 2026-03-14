"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Pause, Play } from "lucide-react";

export default function SlideshowPage() {
  const router = useRouter();
  const [memories, setMemories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const res = await fetch("/api/memories"); // fetches all newest first
        if (res.ok) {
          const data = await res.json();
          // Filter to only photos for seamless slideshow, or mix video
          // Mix is fine if video auto plays, but photos are best for intervals
          setMemories(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, []);

  useEffect(() => {
    if (!playing || memories.length <= 1) return;
    
    // Check if current is video. If video, wait for it maybe, or just stay 5 seconds.
    // For simplicity, cycle every 3.5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [memories.length, playing, currentIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-rose-50">
        <Loader2 className="w-10 h-10 animate-spin text-pink-500 mb-4" />
        <p className="text-xl font-serif text-rose-200/80">Preparing Memories...</p>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-rose-50">
        <h2 className="text-2xl font-serif mb-4 text-rose-100">No memories found</h2>
        <button onClick={() => router.push("/gallery")} className="px-6 py-2 bg-pink-600 rounded-full hover:bg-pink-500 transition-colors">
          Back to Gallery
        </button>
      </div>
    );
  }

  const currentMemory = memories[currentIndex];
  const isVideo = currentMemory.type === "video";

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden">
      
      {/* Top Controls Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-50 bg-gradient-to-b from-black/90 via-black/40 to-transparent pb-32">
        <div className="text-rose-100 drop-shadow-2xl max-w-2xl">
           <h1 className="text-3xl font-serif mb-2 tracking-wide text-pink-300">Cinematic Memories</h1>
           {currentMemory.caption && <p className="text-lg text-rose-100/90 font-medium leading-relaxed border-l-4 border-pink-500 pl-4 bg-black/20 py-1 pr-3 rounded-r-lg backdrop-blur-sm">{currentMemory.caption}</p>}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setPlaying(!playing)}
            className="p-4 bg-pink-500/10 hover:bg-pink-500/20 rounded-full text-pink-200 backdrop-blur-xl transition-all border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-pink-500/50 hover:scale-105"
          >
            {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
          </button>
          <button 
            onClick={() => router.push("/gallery")}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-rose-200/80 backdrop-blur-xl transition-all border border-white/10 shadow-xl hover:scale-105"
          >
            <X className="w-7 h-7" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentMemory._id}
          initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
        >
          {isVideo ? (
            <video
              src={currentMemory.file_url}
              className="w-full h-full object-contain drop-shadow-[0_0_100px_rgba(255,105,180,0.15)]"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={currentMemory.file_url}
              alt="Memory"
              className="w-full h-full object-contain drop-shadow-[0_0_100px_rgba(255,105,180,0.15)]"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Decorative Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] mix-blend-multiply z-40" />

      {/* Progress Bar Indicator */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-50">
         <motion.div 
           key={`progress-${currentMemory._id}-${playing}`}
           initial={{ width: "0%" }}
           animate={{ width: playing ? "100%" : "0%" }}
           transition={{ duration: 3.5, ease: "linear" }}
           className="h-full bg-pink-500"
         />
      </div>

    </div>
  );
}
