import { ArrowRight, Sparkles } from "lucide-react";

interface HeroProps {
    onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
    return (
        <div className="relative border-b border-white/5 bg-gradient-to-b from-[#121212] to-[#0a0a0a] overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(50,184,198,0.05),transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,50,50,0.03),transparent_40%)]" />

            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative z-10">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-[var(--cinema-teal)] uppercase tracking-wider mb-6">
                        <Sparkles className="w-3 h-3" />
                        <span>Powered by Bria FIBO</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
                        The AI Director for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--cinema-teal)] to-[var(--cinema-gold)]">
                            Visual Storytelling
                        </span>
                    </h1>

                    <p className="text-base text-white/60 mb-8 leading-relaxed max-w-lg">
                        Turn raw scripts into cinematic storyboards instantly. Generate consistent characters, control camera angles, and visualize your film before shooting—all with JSON-native precision.
                    </p>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onStart}
                            className="group px-6 py-3 bg-[var(--cinema-teal)] hover:bg-[var(--cinema-teal)]/90 text-black font-bold text-sm rounded-lg flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(50,184,198,0.2)] hover:shadow-[0_0_30px_rgba(50,184,198,0.4)]"
                        >
                            Start Creating
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <a
                            href="https://github.com/samalpartha/Bria-FIBO-infrared-universe"
                            target="_blank"
                            rel="noreferrer"
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium text-sm rounded-lg border border-white/10 transition-colors"
                        >
                            View Documentation
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
