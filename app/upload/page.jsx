"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadCloud, Image as ImageIcon, Film, Loader2, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile) => {
    const MAX_SIZE = 500 * 1024 * 1024; // 500MB
    if (selectedFile.size > MAX_SIZE) {
      setError("File must be less than 500MB");
      return;
    }

    setError("");
    setSuccess(false);

    // Handle HEIC/HEIF conversion
    if (selectedFile.name.toLowerCase().endsWith(".heic") || selectedFile.name.toLowerCase().endsWith(".heif")) {
      try {
        setConverting(true);
        const heic2any = (await import("heic2any")).default;
        const convertedBlob = await heic2any({
          blob: selectedFile,
          toType: "image/jpeg",
          quality: 0.8
        });
        
        // Convert blob to file object
        const convertedFile = new File(
          [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
          selectedFile.name.replace(/\.(heic|heif)$/i, ".jpg"),
          { type: "image/jpeg" }
        );
        
        setFile(convertedFile);
        setPreview(URL.createObjectURL(convertedFile));
      } catch (err) {
        console.error("HEIC conversion failed:", err);
        setError("Failed to convert HEIC image. Please try another format.");
      } finally {
        setConverting(false);
      }
    } else {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = async (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await processFile(droppedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSuccess(true);
        setFile(null);
        setCaption("");
        setPreview(null);
        setTimeout(() => {
          router.push("/gallery");
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-indigo-500" />
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif text-rose-100 tracking-wide drop-shadow-md">Upload a Memory</h2>
          <p className="text-rose-200/70 mt-3 font-medium tracking-wide">Add a new photo or video to your shared vault</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all ${
              file ? "border-pink-500/50 bg-pink-500/5" : "border-white/20 bg-black/20 hover:border-white/40 hover:bg-white/5"
            } cursor-pointer relative group`}
          >
            <input
              type="file"
              accept="image/*, video/*, .heic, .heif"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={converting}
            />
            {preview ? (
              <div className="relative w-full aspect-video md:aspect-auto md:h-64 rounded-xl overflow-hidden bg-black/50 pointer-events-none">
                {file.type.startsWith("video/") ? (
                  <video src={preview} className="w-full h-full object-contain" autoPlay muted loop />
                ) : (
                  <img src={preview} className="w-full h-full object-contain" alt="Preview" />
                )}
              </div>
            ) : converting ? (
              <div className="flex flex-col items-center justify-center p-10">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
                <p className="text-white/60">Converting HEIC image...</p>
              </div>
            ) : (
              <div className="pointer-events-none text-center transform group-hover:scale-105 transition-all duration-300">
                <UploadCloud className="w-16 h-16 text-rose-300/40 mx-auto mb-4 group-hover:text-pink-400 group-hover:-translate-y-2 transition-all duration-300 drop-shadow-lg" />
                <p className="text-rose-100 font-medium text-lg">Drag & drop your memory here</p>
                <div className="flex items-center justify-center gap-4 mt-4 text-rose-200/50 text-sm border-t border-pink-500/20 pt-4 w-48 mx-auto">
                  <span>All Images & Videos</span>
                </div>
                {/* Visual affordance for constraints */}
                <p className="text-pink-400/50 text-xs mt-3 tracking-wider font-semibold">Up to 500MB</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2 ml-1">Write a Caption (Optional)</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="3"
              className="w-full px-5 py-4 bg-black/40 border-2 border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/80 focus:border-pink-500/50 text-white placeholder-white/40 transition-all resize-none shadow-inner"
              placeholder="What makes this moment so special?"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || success || !file || converting}
            className={`w-full py-4 rounded-xl text-white font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] flex justify-center items-center gap-2 ${
              loading || converting
                ? "bg-gradient-to-r from-pink-500 to-rose-400 opacity-70 cursor-not-allowed"
                : (success || !file)
                ? "bg-white/5 text-rose-200/30 cursor-not-allowed border-white/5"
                : "bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            }`}
          >
            {loading ? (
              <>Uploading memory... <Loader2 className="w-5 h-5 animate-spin" /></>
            ) : converting ? (
              <>Converting HEIC... <Loader2 className="w-5 h-5 animate-spin" /></>
            ) : success ? (
              <>Memory securely saved! <CheckCircle className="w-5 h-5" /></>
            ) : (
              <>Upload to Vault <UploadCloud className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
