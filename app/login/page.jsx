import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Login | Love Gallery",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
      
      {/* Star patterns placeholder - can add subtle css animation here */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

      <div className="z-10 w-full flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-serif text-white/90 mb-10 drop-shadow-2xl">
          Love Gallery <span className="text-pink-500">❤️</span>
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
