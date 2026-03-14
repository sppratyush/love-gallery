"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import GalleryGrid from "@/components/GalleryGrid";
import LightboxModal from "@/components/LightboxModal";
import SearchBar from "@/components/SearchBar";
import { Loader2 } from "lucide-react";

export default function FavoritesPage() {
  const [memories, setMemories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState(null);

  const fetchMemories = async (query = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/memories?favorites=true&search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMemories(search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleToggleFavorite = async (id, isFav) => {
    try {
      // Optimistic Update: Remove from favorites view immediately if unfavorited
      if (!isFav) {
        setMemories(memories.filter(m => m._id !== id));
      } else {
         setMemories(memories.map(m => m._id === id ? { ...m, favorite: true } : m));
      }
      
      if (selectedMemory && selectedMemory._id === id) {
        setSelectedMemory({ ...selectedMemory, favorite: isFav });
      }
      
      await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, favorite: isFav }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this memory forever?")) return;
    try {
      setMemories(memories.filter((m) => m._id !== id));
      await fetch(`/api/delete?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Navbar />

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-serif text-pink-300 tracking-wide drop-shadow-lg">Favorite Memories ❤️</h1>
          <p className="text-rose-200/60 mt-1">The moments we hold closest to our hearts.</p>
        </div>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {loading && memories.length === 0 ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
        </div>
      ) : (
        <GalleryGrid 
          memories={memories} 
          onImageClick={setSelectedMemory} 
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
        />
      )}

      <LightboxModal
        memory={selectedMemory}
        isOpen={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onToggleFavorite={handleToggleFavorite}
      />
    </main>
  );
}
