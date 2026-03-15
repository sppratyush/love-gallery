"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, PlusCircle, Play, Image as ImageIcon, LogOut, Menu, X, Key } from "lucide-react";
import Cookies from "js-cookie";
import ChangePasswordModal from "./ChangePasswordModal";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const navLinks = [
    { name: "Memories", href: "/gallery", icon: ImageIcon },
    { name: "Upload", href: "/upload", icon: PlusCircle },
    { name: "Favorites", href: "/favorites", icon: Heart },
    { name: "Slideshow", href: "/slideshow", icon: Play },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        
        {/* Brand */}
        <Link href="/gallery" className="flex items-center gap-2 group">
          <Heart className="w-6 h-6 text-pink-400 fill-pink-500/20 group-hover:fill-pink-500 transition-colors drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
          <span className="text-xl font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-100 to-pink-200">Love Gallery</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? "text-rose-100" : "text-rose-200/60 hover:text-rose-100 hover:bg-pink-500/10"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-pink-500/20 rounded-full border border-pink-500/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="w-4 h-4 z-10" />
                <span className="z-10">{link.name}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setChangePasswordOpen(true)}
            className="ml-4 px-4 py-2 text-sm font-medium text-rose-200/60 hover:text-rose-100 hover:bg-pink-500/10 rounded-full flex items-center gap-2 transition-colors"
          >
            <Key className="w-4 h-4" />
            Change Key
          </button>

          <button
            onClick={handleLogout}
            className="ml-2 px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-full flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Mobile Menu Button - Removed for bottom Nav */}
      </div>
    </nav>

    {/* Mobile Bottom Navigation */}
      <div 
        className="md:hidden fixed bottom-0 left-0 w-full z-[100] bg-slate-950/95 backdrop-blur-3xl border-t border-pink-500/20 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-around px-2 pt-3 pb-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors ${
                  isActive ? "text-pink-400" : "text-rose-200/60 hover:text-rose-100 hover:bg-pink-500/10"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium tracking-wide">{link.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setChangePasswordOpen(true)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-rose-200/60 hover:text-rose-100 hover:bg-pink-500/10 transition-colors"
          >
            <Key className="w-6 h-6" />
            <span className="text-[10px] font-medium tracking-wide">Key</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-rose-200/60 hover:text-rose-100 hover:bg-pink-500/10 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-medium tracking-wide">Logout</span>
          </button>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={changePasswordOpen} 
        onClose={() => setChangePasswordOpen(false)} 
      />
    </>
  );
}
