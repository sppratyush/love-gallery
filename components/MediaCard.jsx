"use client";

import { motion } from "framer-motion";
import { Heart, Trash2, CalendarDays, User } from "lucide-react";
import { format } from "date-fns";

export default function MediaCard({ memory, onImageClick, onToggleFavorite, onDelete }) {
  const isVideo = memory.type === "video";

  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
      }}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, y: -5 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-white/20 shadow-2xl shadow-pink-500/10 cursor-pointer transition-shadow hover:shadow-pink-500/30"
      onClick={() => onImageClick(memory)}
    >
      {/* Media Display */}
      <div 
        className="relative w-full overflow-hidden bg-slate-800"
      >
        {isVideo ? (
          <video
            src={memory.file_url}
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            muted
            loop
            onMouseEnter={(e) => e.target.play()}
            onMouseLeave={(e) => {
              e.target.pause();
              e.target.currentTime = 0;
            }}
          />
        ) : (
          <img
            src={memory.file_url}
            alt={memory.caption || "Memory"}
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80 md:opacity-60 md:group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Hover Action Buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(memory._id, !memory.favorite);
          }}
          className={`p-2 rounded-full backdrop-blur-md transition-colors ${
            memory.favorite 
              ? "bg-pink-500/20 text-pink-400 border-pink-500/30" 
              : "bg-black/40 text-rose-200/80 hover:bg-pink-500/20 hover:text-pink-300"
          } transition-colors border border-white/5 backdrop-blur-md`}
        >
          <Heart className={`w-5 h-5 ${memory.favorite ? "fill-current" : ""}`} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(memory._id);
          }}
          className="p-2 rounded-full backdrop-blur-md bg-black/40 text-rose-200/80 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-white/5"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Details Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-0 md:translate-y-4 opacity-100 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500 ease-out z-10 bg-gradient-to-t from-black/80 to-transparent">
        {memory.caption && (
          <p className="text-rose-50 text-base md:text-lg font-medium mb-3 line-clamp-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] border-l-2 border-pink-500 pl-3">
            {memory.caption}
          </p>
        )}
        <div className="flex items-center justify-between text-xs md:text-sm text-rose-100/90 font-medium tracking-wide drop-shadow-lg">
          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
            <User className="w-3.5 h-3.5 text-pink-400" />
            <span>{memory.uploaded_by}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
            <span>{format(new Date(memory.created_at), "MMM d, yyyy")}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
