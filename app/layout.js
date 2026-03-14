import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Love Gallery ❤️",
  description: "A private place for our memories",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${outfit.className} bg-slate-950 text-rose-50 antialiased min-h-screen relative overflow-x-hidden selection:bg-pink-500/30 selection:text-pink-200`}>
        {/* High contrast fast CSS grid pattern background */}
        <div className="fixed inset-0 bg-slate-950 -z-10" />
        <div className="fixed inset-0 -z-10 opacity-20" 
             style={{ 
               backgroundImage: "linear-gradient(to right, #ec4899 1px, transparent 1px), linear-gradient(to bottom, #ec4899 1px, transparent 1px)", 
               backgroundSize: "40px 40px",
               maskImage: "radial-gradient(circle at center, black 40%, transparent 80%)"
             }} 
        />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent -z-10" />
        {children}
      </body>
    </html>
  );
}
