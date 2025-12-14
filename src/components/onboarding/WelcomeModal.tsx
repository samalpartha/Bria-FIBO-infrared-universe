import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Film, Clapperboard, Sparkles } from "lucide-react";

export function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding_v1");
        if (!hasSeenOnboarding) {
            // Small delay for better entrance
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem("hasSeenOnboarding_v1", "true");
    };

    const nextStep = () => {
        if (step < 2) setStep(step + 1);
        else handleClose();
    };

    const steps = [
        {
            title: "Welcome to Infrared Universe",
            description: "You've entered the AI Director's suite. This tool helps you turn screenplays into visual storyboards instantly.",
            icon: <Film className="w-8 h-8 text-[var(--cinema-teal)]" />,
        },
        {
            title: "The Agentic Workflow",
            description: "1. Paste your script on the left. \n2. Click 'Analyze Script' to let the AI Director break it down.\n3. Adjust the generated scenes.",
            icon: <Clapperboard className="w-8 h-8 text-[var(--cinema-gold)]" />,
        },
        {
            title: "Hybrid Generation",
            description: "We use a unique 'Structure Lock'. The first generation sets the composition (Bria V1), and subsequent renders add high-fidelity details (FIBO V2).",
            icon: <Sparkles className="w-8 h-8 text-purple-400" />,
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-xl p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--cinema-teal)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                                {steps[step].icon}
                            </div>

                            <h2 className="text-xl font-bold text-white mb-3">{steps[step].title}</h2>
                            <p className="text-white/60 text-sm leading-relaxed mb-8 min-h-[80px] whitespace-pre-line">
                                {steps[step].description}
                            </p>

                            <div className="flex items-center gap-2 mb-8">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-[var(--cinema-teal)]" : "w-2 bg-white/10"}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextStep}
                                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {step === 2 ? "Get Started" : "Next"}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
