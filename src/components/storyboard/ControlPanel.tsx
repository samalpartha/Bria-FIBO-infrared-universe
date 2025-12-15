import React, { useState } from 'react';
import { Camera, Sun, Palette, Zap } from 'lucide-react';
import { Scene, FiboParameters } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

interface StudioControlsProps {
    scene?: Scene;
    isHybridMode?: boolean;
    onGenerate?: () => void;
    isGenerating?: boolean;
    onUpdateParams?: (params: Partial<FiboParameters>) => void; // Deprecated but kept for safety
    onUpdateComposition?: (params: Partial<FiboParameters>) => void;
    onUpdateStyle?: (params: Partial<FiboParameters>) => void;
    onToggleLock?: (id: string) => void;
}

export function StudioControls({ scene, onGenerate, isGenerating, onUpdateParams, onUpdateComposition, onUpdateStyle, onToggleLock }: StudioControlsProps) {

    // Helper to route updates based on type if split callbacks provided
    const handleCameraUpdate = (p: Partial<FiboParameters>) => {
        if (onUpdateComposition && scene && !scene.lockComposition) onUpdateComposition(p);
        else if (onUpdateParams) onUpdateParams(p);
    };

    const handleStyleUpdate = (p: Partial<FiboParameters>) => {
        if (onUpdateStyle) onUpdateStyle(p);
        else if (onUpdateParams) onUpdateParams(p);
    };

    return (
        <div className="w-full h-full flex flex-col control-panel overflow-hidden border-none text-[var(--director-text)] bg-[var(--director-surface-2)]">
            {/* Header */}
            <div className="h-10 px-5 flex items-center justify-between border-b border-white/5 bg-black/20">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#777]">Studio Controls</span>

                {/* Structure Lock Toggle (Hackathon Polish) */}
                {scene && onToggleLock && (
                    <div className={cn(
                        "flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors select-none",
                        scene.lockComposition ? "bg-[var(--cinema-gold)]/20 text-[var(--cinema-gold)]" : "bg-white/5 text-[#555] hover:bg-white/10"
                    )}
                        onClick={() => onToggleLock(scene.id)}
                    >
                        <Zap className="w-3 h-3 filled" fill={scene.lockComposition ? "currentColor" : "none"} />
                        <span className="text-[9px] font-bold uppercase">{scene.lockComposition ? "Locked" : "Unlock"}</span>
                    </div>
                )}
            </div>

            {/* Scrollable Controls */}
            <div className="flex-1 p-5 space-y-8 overflow-y-auto custom-scrollbar">

                {/* 1. Camera Section (Composition) */}
                <div className={cn("space-y-3 transition-opacity duration-300", scene?.lockComposition ? "opacity-50 pointer-events-none grayscale" : "")}>
                    <div className="flex items-center gap-2 text-[var(--cinema-teal)] mb-1">
                        <Camera className="w-3 h-3" />
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white">Camera {scene?.lockComposition && "(LOCKED)"}</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Wide', value: 'wide_shot' },
                            { label: 'Medium', value: 'medium_shot' },
                            { label: 'Close-up', value: 'close_up' },
                            { label: 'Macro', value: 'macro' }
                        ].map((t) => {
                            const isActive = scene?.parameters?.camera?.shotType === t.value;
                            return (
                                <button
                                    key={t.value}
                                    onClick={() => handleCameraUpdate({ camera: { shotType: t.value as any } })}
                                    disabled={scene?.lockComposition}
                                    aria-label={`Set Shot Type to ${t.label}`}
                                    className={cn(
                                        "interactive-pill py-3 px-4 rounded-lg text-[13px] font-bold uppercase tracking-wide text-left relative overflow-hidden transition-all",
                                        isActive ? "bg-[var(--cinema-teal)] text-black shadow-[0_0_10px_rgba(50,184,198,0.4)]" : "bg-white/5 text-white hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <span className="relative z-10">{t.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Lighting Section (Style) */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[var(--cinema-gold)] mb-1">
                        <Sun className="w-3 h-3" />
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white">Lighting (FIBO V2)</label>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { color: '#ffffff', label: 'Day', value: 'natural' },
                            { color: '#3b82f6', label: 'Blue', value: 'cinematic' },
                            { color: '#f97316', label: 'Warm', value: 'volumetric' },
                            { color: '#9333ea', label: 'Neon', value: 'neon' }
                        ].map((c, i) => {
                            const isActive = scene?.parameters?.lighting?.type === c.value;
                            return (
                                <div key={i}
                                    className="group cursor-pointer flex flex-col items-center gap-2"
                                    onClick={() => handleStyleUpdate({ lighting: { type: c.value as any } })}
                                >
                                    <div
                                        className={cn(
                                            "w-full aspect-square rounded-full border border-white/10 transition-all duration-300 shadow-lg",
                                            isActive ? "ring-2 ring-[var(--cinema-gold)] scale-110" : "hover:border-white/50"
                                        )}
                                        style={{ backgroundColor: c.color, opacity: isActive ? 1 : 0.7 }}
                                    />
                                    <span className={cn(
                                        "text-[9px] uppercase tracking-wider transition-colors",
                                        isActive ? "text-white font-bold" : "text-[#b0b0b0]"
                                    )}>{c.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Style Section (Style) */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                        <Palette className="w-3 h-3" />
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white">Style (FIBO V2)</label>
                    </div>
                    <div className="space-y-2">
                        <div
                            onClick={() => handleStyleUpdate({ style: { atmosphere: 'film_grain' } })}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-xl border border-white/10 cursor-pointer transition-all hover:bg-white/5",
                                scene?.parameters?.style?.atmosphere === 'film_grain' && "bg-[var(--cinema-teal)]/10 border-[var(--cinema-teal)]"
                            )}>
                            <span className={cn("text-xs font-medium", scene?.parameters?.style?.atmosphere === 'film_grain' ? "text-white" : "text-[#b0b0b0]")}>Film Grain</span>
                            <div className={cn(
                                "w-3 h-3 rounded-full border border-white/20 transition-colors",
                                scene?.parameters?.style?.atmosphere === 'film_grain' ? "bg-[var(--cinema-teal)] border-[var(--cinema-teal)] shadow-[0_0_10px_var(--cinema-teal)]" : "bg-transparent"
                            )} />
                        </div>
                        <div
                            onClick={() => handleStyleUpdate({ style: { atmosphere: 'bloom' } })}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-xl border border-white/10 cursor-pointer transition-all hover:bg-white/5",
                                scene?.parameters?.style?.atmosphere === 'bloom' && "bg-[var(--cinema-teal)]/10 border-[var(--cinema-teal)]"
                            )}>
                            <span className={cn("text-xs font-medium", scene?.parameters?.style?.atmosphere === 'bloom' ? "text-white" : "text-[#b0b0b0]")}>Bloom</span>
                            <div className={cn(
                                "w-3 h-3 rounded-full border border-white/20 transition-colors",
                                scene?.parameters?.style?.atmosphere === 'bloom' ? "bg-[var(--cinema-teal)] border-[var(--cinema-teal)] shadow-[0_0_10px_var(--cinema-teal)]" : "bg-transparent"
                            )} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-5 border-t border-white/10 bg-black/20">
                <Tooltip content="Generate a high-fidelity image for this scene" side="top">
                    <button
                        onClick={onGenerate}
                        disabled={isGenerating}
                        aria-label="Generate Image"
                        className="w-full py-4 generate-btn flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                Generating...
                            </>
                        ) : (
                            "Generate Shot"
                        )}
                    </button>
                </Tooltip>
            </div>
        </div>
    );
}
