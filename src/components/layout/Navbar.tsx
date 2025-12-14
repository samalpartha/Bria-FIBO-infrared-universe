import { Film, Github, User } from "lucide-react";
import Link from "next/link";

export function Navbar() {
    return (
        <header className="h-14 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/10 text-[var(--cinema-teal)] shadow-[0_0_15px_rgba(50,184,198,0.1)]">
                        <Film className="w-4 h-4 animate-reel-spin" />
                    </div>
                    <span className="font-bold text-sm tracking-[0.2em] uppercase text-white hidden sm:block">
                        Infrared <span className="text-[var(--cinema-gold)]">Universe</span>
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-6 ml-8 text-xs font-medium text-white/60">
                    <Link href="#" className="hover:text-[var(--cinema-teal)] transition-colors">Studio</Link>
                    <Link href="https://github.com/samalpartha/Bria-FIBO-infrared-universe" target="_blank" className="hover:text-white transition-colors">Documentation</Link>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <Link
                    href="https://github.com/samalpartha/Bria-FIBO-infrared-universe"
                    target="_blank"
                    className="p-2 text-white/50 hover:text-white transition-colors"
                >
                    <Github className="w-4 h-4" />
                </Link>

                <div className="w-8 h-8 rounded-full bg-[#151515] border border-white/10 flex items-center justify-center text-[#777] cursor-pointer hover:border-[var(--cinema-teal)] transition-colors">
                    <User className="w-4 h-4" />
                </div>
            </div>
        </header>
    );
}
