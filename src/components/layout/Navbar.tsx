import { Film, Github, User } from "lucide-react";
import Link from "next/link";

export function Navbar() {
    return (
        <header className="h-14 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-[100]">
            {/* LEFT: LOGO */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/10 text-[var(--cinema-teal)] shadow-[0_0_15px_rgba(50,184,198,0.3)]">
                    <Film className="w-4 h-4 animate-reel-spin" />
                </div>
                <span className="font-bold text-sm tracking-[0.2em] uppercase text-white">
                    BRIA-FIBO: <span className="text-[var(--cinema-gold)]">INFRARED UNIVERSE</span>
                </span>
            </Link>

            {/* CENTER: Removed navigation buttons that were overlapping logo */}

            {/* RIGHT: ACTIONS */}
            <div className="flex items-center gap-4">
                <div className="hidden md:flex gap-2">
                    <button className="px-3 py-1.5 bg-[#1C1C1C] border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-white/5 transition-colors">Save</button>
                    <button className="px-3 py-1.5 bg-[var(--cinema-gold)] text-black text-[10px] font-bold uppercase tracking-wider rounded glow-gold hover:scale-105 transition-transform">Generate</button>
                </div>

                <div className="w-[1px] h-6 bg-white/10 hidden md:block" />

                <Link
                    href="https://github.com/samalpartha/Bria-FIBO-infrared-universe"
                    target="_blank"
                    aria-label="View on GitHub"
                    className="p-2 text-white/50 hover:text-white transition-colors"
                >
                    <Github className="w-4 h-4" />
                </Link>

                <div
                    role="button"
                    aria-label="User Profile"
                    className="w-8 h-8 rounded-full bg-[#151515] border border-white/10 flex items-center justify-center text-[#777] cursor-pointer hover:border-[var(--cinema-teal)] transition-colors"
                >
                    <User className="w-4 h-4" />
                </div>
            </div>
        </header>
    );
}
