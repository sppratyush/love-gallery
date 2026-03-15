"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadCloud, Image as ImageIcon, Film, Loader2, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [converting, setConverting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(0);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      await processFiles(selectedFiles);
    }
  };

  const processFiles = async (selectedFiles) => {
    const MAX_SIZE = 500 * 1024 * 1024; // 500MB
    const validFiles = [];
    const newPreviews = [];
    
    setError("");
    setSuccess(false);

    for (const selectedFile of selectedFiles) {
      if (selectedFile.size > MAX_SIZE) {
        setError(`File ${selectedFile.name} must be less than 500MB`);
        continue;
      }

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
          
          const convertedFile = new File(
            [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
            selectedFile.name.replace(/\.(heic|heif)$/i, ".jpg"),
            { type: "image/jpeg" }
          );
          
          validFiles.push(convertedFile);
          newPreviews.push({ url: URL.createObjectURL(convertedFile), type: "image" });
        } catch (err) {
          console.error("HEIC conversion failed:", err);
          setError(`Failed to convert HEIC image: ${selectedFile.name}`);
        } finally {
          setConverting(false);
        }
      } else {
        validFiles.push(selectedFile);
        const isVideo = selectedFile.type.startsWith("video/");
        newPreviews.push({ url: URL.createObjectURL(selectedFile), type: isVideo ? "video" : "image" });
      }
    }

    setFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = async (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await processFiles(droppedFiles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please select at least one file to upload");
      return;
    }

    setLoading(true);
    setError("");
    setUploadingIndex(0);

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadingIndex(i + 1);
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("caption", caption);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Upload failed for ${files[i].name}`);
        }
      }

      setSuccess(true);
      setFiles([]);
      setCaption("");
      setPreviews([]);
      setTimeout(() => {
        router.push("/gallery");
      }, 1500);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
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
              files.length > 0 ? "border-pink-500/50 bg-pink-500/5" : "border-white/20 bg-black/20 hover:border-white/40 hover:bg-white/5"
            } cursor-pointer relative group`}
          >
            <input
              type="file"
              accept="image/*, video/*, .heic, .heif, .avc, .h264, .mkv, .m4v"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={converting}
              multiple
            />
            {previews.length > 0 ? (
              <div className="relative w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 max-h-[400px] overflow-y-auto z-20 bg-black/40 rounded-xl">
                {previews.map((prev, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group/preview">
                    {prev.type === "video" ? (
                      <video src={prev.url} className="w-full h-full object-cover" muted loop onMouseOver={(e) => e.target.play()} onMouseOut={(e) => e.target.pause()} />
                    ) : (
                      <img src={prev.url} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFiles(prev => prev.filter((_, i) => i !== idx));
                        setPreviews(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover/preview:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg hover:border-white/40 hover:bg-white/5 transition-all text-white/40 relative">
                    <UploadCloud className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Add More</span>
                </div>
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
            disabled={loading || success || files.length === 0 || converting}
            className={`w-full py-4 rounded-xl text-white font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] flex justify-center items-center gap-2 ${
              loading || converting
                ? "bg-gradient-to-r from-pink-500 to-rose-400 opacity-70 cursor-not-allowed"
                : (success || files.length === 0)
                ? "bg-white/5 text-rose-200/30 cursor-not-allowed border-white/5"
                : "bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            }`}
          >
            {loading ? (
              <>Uploading memory {uploadingIndex} of {files.length}... <Loader2 className="w-5 h-5 animate-spin" /></>
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
