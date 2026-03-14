"use client";

import { Search } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-white/40" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-2xl leading-5 bg-white/5 backdrop-blur-sm text-white placeholder-white/40 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-pink-500/50 transition-all sm:text-sm"
        placeholder="Search memories..."
      />
    </div>
  );
}
