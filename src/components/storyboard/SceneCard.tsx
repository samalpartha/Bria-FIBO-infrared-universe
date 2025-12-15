import { Scene, FiboParameters } from '@/lib/types';
import { cn } from "@/lib/utils";
import { Camera, Trash2, GripVertical, Loader2, Lock, Unlock, Wand2, Monitor } from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

interface SceneCardProps {
    scene: Scene;
    isSelected?: boolean;
    isStructureLocked?: boolean;
    onClick?: () => void;
    onRemoveBg?: (scene: Scene) => void;
    onToggleLock?: (id: string) => void;
    onViewJson?: (scene: Scene) => void;
    onDelete?: (id: string) => void;
    onGenerate?: (id: string) => void;
    onUpdate?: (scene: Scene, updates: Partial<Scene>) => void;
}

export function SceneCard({ scene, isSelected, onClick, onViewJson, onDelete, onGenerate, onUpdate, onToggleLock }: SceneCardProps) {
    const [showSafeTitle, setShowSafeTitle] = useState(false);
    const [isJsonVisible, setIsJsonVisible] = useState(false);

    const isGenerating = scene.status === 'generating';
    const hasImage = !!scene.imageUrl;
    const hasJson = !!scene.structuredPrompt;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className={cn(
                "cinema-card relative group overflow-hidden cursor-pointer transition-all duration-300 flex flex-col hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-[#111]",
                isSelected ? "border-[var(--cinema-teal)] ring-1 ring-[var(--cinema-teal)] shadow-2xl shadow-[var(--cinema-teal)]/10" : "hover:border-white/20 border-white/5 border"
            )}
        >
            {/* --- IMAGE AREA --- */}
            <div className="relative aspect-video w-full min-h-[200px] bg-black overflow-hidden group/image shrink-0">
                {/* Status Pill (Floating) */}
                <div className="absolute top-3 right-3 z-30 flex gap-2">
                    <div className={cn(
                        "px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border shadow-sm flex items-center gap-1.5",
                        scene.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            scene.status === 'generating' ? "bg-[var(--cinema-teal)]/10 text-[var(--cinema-teal)] border-[var(--cinema-teal)]/20 shadow-[0_0_10px_rgba(50,184,198,0.2)]" :
                                scene.status === 'failed' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                    "bg-white/5 text-white/50 border-white/10"
                    )}
                        title={scene.error} // Show error on hover
                    >
                        {scene.status === 'generating' && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                        {scene.status === 'failed' && <span className="mr-1">⚠️</span>}
                        {scene.status}
                    </div>
                </div>

                {/* Tools Overlay (Hover) */}
                <div className="absolute top-3 left-3 z-30 flex gap-1 opacity-0 group-hover/image:opacity-100 transition-opacity">
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
                    {hasJson && onViewJson && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewJson(scene); }}
                            className="p-1.5 bg-black/40 backdrop-blur-md text-white/70 hover:text-[var(--cinema-gold)] rounded-md border border-white/10 hover:border-[var(--cinema-gold)]"
                            title="View FIBO JSON"
                        >
                            <span className="text-[9px] font-bold">{"{}"}</span>
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(scene.id); }}
                            className="p-1.5 bg-black/40 backdrop-blur-md text-white/70 hover:text-red-400 rounded-md border border-white/10 hover:border-red-500/50"
                            title="Delete Scene"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Center Generate Button (If No Image) */}
                {!hasImage && !isGenerating && onGenerate && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <button
                            onClick={(e) => { e.stopPropagation(); onGenerate(scene.id); }}
                            className="pointer-events-auto px-4 py-2 bg-[var(--cinema-gold)] text-black rounded-lg font-bold shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <Wand2 className="w-4 h-4" />
                            <span>GENERATE</span>
                        </button>
                    </div>
                )}

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

                        {isGenerating && (
                            <>
                                <Loader2 className="w-8 h-8 text-[var(--cinema-teal)] animate-spin" />
                                <span className="text-[10px] uppercase tracking-widest text-[var(--cinema-teal)] animate-pulse">Rendering Shot...</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* --- SMART FOOTER (Editable) --- */}
            <div className="p-4 bg-[#151515] border-t border-white/5 space-y-3 flex-1 flex flex-col relative">

                {/* Header Row: Editable Script Text */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            className="w-full !bg-transparent border-none text-sm font-bold !text-white placeholder:text-white/40 focus:ring-0 p-0 leading-tight"
                            style={{ color: '#ffffff' }}
                            value={scene.scriptText || ""}
                            onChange={(e) => onUpdate && onUpdate(scene, { scriptText: e.target.value })}
                            placeholder="SCENE HEADING..."
                            onClick={(e) => e.stopPropagation()}
                        />
                        <input
                            type="text"
                            className="w-full !bg-transparent border-none text-[10px] !text-gray-300 placeholder:text-gray-600 focus:ring-0 p-0 mt-1"
                            style={{ color: '#d1d5db' }}
                            value={scene.visualPrompt || ""}
                            onChange={(e) => onUpdate && onUpdate(scene, { visualPrompt: e.target.value })}
                            placeholder="Visual description..."
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] text-[#aaa]">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1">
                        <span className="shrink-0">Shot</span>
                        <span className="text-[var(--cinema-teal)] font-medium text-right truncate ml-2">
                            {scene.parameters?.camera?.shotType?.replace('_', ' ').toUpperCase() || "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-1">
                        <span className="shrink-0">Angle</span>
                        <span className="text-white font-medium text-right truncate ml-2">
                            {scene.parameters?.camera?.angle?.replace('_', ' ').toUpperCase() || "EYE LEVEL"}
                        </span>
                    </div>
                    {/* Add Lighting/Time if needed, keeping it balanced */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-1">
                        <span className="shrink-0">Time</span>
                        <span className="text-[#ccc] text-right truncate ml-2">Day</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-1">
                        <span className="shrink-0">FPS</span>
                        <span className="text-[#ccc] text-right truncate ml-2">24</span>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onGenerate && onGenerate(scene.id); }}
                            disabled={scene.status === 'generating'}
                            className="bg-white text-black px-3 py-1.5 rounded text-[10px] font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {scene.status === 'generating' ? "GENERATING..." :
                                scene.status === 'completed' ? "RE-GENERATE" : "GENERATE SHOT"}
                        </button>

                        {/* JSON View Toggle */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsJsonVisible(!isJsonVisible); }}
                            className={`p-1.5 rounded border transition-colors ${isJsonVisible ? 'bg-white/20 border-white/40 text-white' : 'border-white/10 text-white/40 hover:text-white'}`}
                            title="View FIBO JSON Payload"
                        >
                            <span className="font-mono text-[10px]">{`{ }`}</span>
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {/* Hybrid Lock Toggle */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleLock && onToggleLock(scene.id); }}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors text-[10px] border ${scene.lockComposition
                                ? "bg-[var(--cinema-teal)]/20 text-[var(--cinema-teal)] border-[var(--cinema-teal)]/50"
                                : "bg-transparent text-white/30 border-transparent hover:text-white/60"
                                }`}
                            title="Hybrid Structure Lock: Freezes V1 composition for V2 refinement"
                        >
                            {scene.lockComposition ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            <span className="font-bold">STRUC. LOCK</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(scene.id); }}
                            className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* JSON Viewer Overlay/Panel */}
                {isJsonVisible && (
                    <div className="mt-2 text-[9px] font-mono text-gray-400 bg-black/50 p-2 rounded border border-white/10 overflow-x-auto">
                        <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/5">
                            <span className="text-[var(--cinema-teal)] font-bold">FIBO PRO PAYLOAD</span>
                            <span className="text-[8px] uppercase tracking-wider text-gray-500">Native JSON Control</span>
                        </div>
                        <pre className="whitespace-pre-wrap">
                            {JSON.stringify({
                                camera: scene.parameters?.camera,
                                lighting: scene.parameters?.lighting,
                                style: scene.parameters?.style,
                                seed: scene.seed || "random",
                                structure_reference: scene.lockComposition ? "ACTIVE (V1)" : "None"
                            }, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </motion.div >
    );
}
