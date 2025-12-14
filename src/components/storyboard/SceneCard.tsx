import { Scene } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Crop, Image as ImageIcon, Loader2, Lock, Wand2, Monitor, Grid } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

interface SceneCardProps {
    scene: Scene;
    isSelected?: boolean;
    isStructureLocked?: boolean;
    onClick?: () => void;
    onRemoveBg?: (scene: Scene) => void;
    onToggleLock?: (scene: Scene) => void;
}

export function SceneCard({ scene, isSelected, isStructureLocked, onClick, onRemoveBg, onToggleLock }: SceneCardProps) {
    const [showSafeTitle, setShowSafeTitle] = useState(false);

    const isGenerating = scene.status === 'generating';
    const hasImage = !!scene.imageUrl;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className={cn(
                "cinema-card relative group overflow-hidden cursor-pointer transition-all duration-300 flex flex-col hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]",
                isSelected ? "border-[var(--cinema-teal)] ring-1 ring-[var(--cinema-teal)] shadow-2xl shadow-[var(--cinema-teal)]/10" : "hover:border-white/20"
            )}
        >
            {/* --- IMAGE AREA --- */}
            <div className="relative aspect-video w-full bg-black overflow-hidden">
                {/* Status Pill (Floating) */}
                <div className="absolute top-3 right-3 z-30 flex gap-2">
                    <div className={cn(
                        "px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border shadow-sm flex items-center gap-1.5",
                        scene.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            scene.status === 'generating' ? "bg-[var(--cinema-teal)]/10 text-[var(--cinema-teal)] border-[var(--cinema-teal)]/20 shadow-[0_0_10px_rgba(50,184,198,0.2)]" :
                                "bg-white/5 text-white/50 border-white/10"
                    )}>
                        {scene.status === 'generating' && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                        {scene.status}
                    </div>
                </div>

                {/* Tools Overlay (Hover) */}
                <div className="absolute top-3 left-3 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowSafeTitle(!showSafeTitle); }}
                        className={cn(
                            "p-1.5 rounded-md backdrop-blur-md border transition-all",
                            showSafeTitle ? "bg-[var(--cinema-teal)] text-black border-[var(--cinema-teal)]" : "bg-black/40 text-white/70 border-white/10 hover:text-white"
                        )}
                        title="Toggle Safe Title"
                    >
                        <Monitor className="w-3 h-3" />
                    </button>
                    <button className="p-1.5 bg-black/40 backdrop-blur-md text-white/70 hover:text-white rounded-md border border-white/10" title="Grid">
                        <Grid className="w-3 h-3" />
                    </button>
                </div>

                {hasImage ? (
                    <>
                        <img
                            src={scene.imageUrl}
                            alt={scene.visualPrompt}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Golden Grid (Hover) */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 golden-grid pointer-events-none mix-blend-overlay" />

                        {/* Film Grain Overlay */}
                        <div className="absolute inset-0 film-grain pointer-events-none opacity-50" />

                        {/* Safe Title Overlay */}
                        {showSafeTitle && (
                            <div className="absolute inset-[10%] border border-dashed border-[var(--cinema-teal)]/50 pointer-events-none shadow-[0_0_20px_rgba(50,184,198,0.1)]">
                                <div className="absolute inset-[10%] border border-dashed border-[var(--cinema-teal)]/30" /> {/* Action Safe */}
                                <span className="absolute top-1 left-1 text-[8px] text-[var(--cinema-teal)] font-mono">SAFE TITLE</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 relative">
                        {/* Empty State Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.03)_50%,rgba(255,255,255,0.03)_75%,transparent_75%,transparent)] bg-[length:24px_24px]" />

                        {isGenerating ? (
                            <>
                                <Loader2 className="w-8 h-8 text-[var(--cinema-teal)] animate-spin" />
                                <span className="text-[10px] uppercase tracking-widest text-[var(--cinema-teal)] animate-pulse">Rendering Shot...</span>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="w-8 h-8 text-[#333]" />
                                <span className="text-[10px] uppercase tracking-widest text-[#555]">Awaiting Input</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* --- SMART FOOTER (PROFILE) --- */}
            <div className="p-4 bg-[#151515] border-t border-white/5 space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                    <h3 className="text-sm font-bold text-white leading-tight line-clamp-1">
                        {scene.scriptText || "Untitled Scene"}
                    </h3>
                    <span className="text-[9px] font-mono text-[#555] whitespace-nowrap">ID: {scene.id}</span>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-[10px] text-[#888]">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                        <span>Shot</span>
                        <span className="text-[var(--cinema-teal)] font-medium">
                            {scene.parameters?.camera?.shotType?.replace('_', ' ').toUpperCase() || "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                        <span>Angle</span>
                        <span className="text-[#ccc]">Eye Level</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                        <span>Lighting</span>
                        <span className="text-[var(--cinema-gold)]">
                            {scene.parameters?.lighting?.type?.toUpperCase() || "NATURAL"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                        <span>Res</span>
                        <span className="text-[#ccc]">4K (16:9)</span>
                    </div>
                </div>

                {/* Date / Micro-info */}
                <div className="flex items-center gap-2 pt-1 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--cinema-teal)]" />
                    <span className="text-[9px] text-[#666]">RAW SOURCE • <span className="font-mono">FIBO GEN-2</span></span>
                </div>
            </div>
        </motion.div>
    );
}
