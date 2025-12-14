
import { Scene } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Crop, Film, Image as ImageIcon, Loader2, Lock, Unlock } from "lucide-react";
import { useState } from "react";

interface SceneCardProps {
    scene: Scene;
    isSelected: boolean;
    isStructureLocked?: boolean;
    onClick: () => void;
    onRemoveBg: (scene: Scene) => void;
    onToggleLock?: (scene: Scene) => void;
}

export function SceneCard({ scene, isSelected, isStructureLocked, onClick, onRemoveBg, onToggleLock }: SceneCardProps) {
    const [isRemovingBg, setIsRemovingBg] = useState(false);

    const handleRemoveBg = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRemovingBg(true);
        await onRemoveBg(scene);
        setIsRemovingBg(false);
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-[#0a0a0a] border border-white/5 rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/5 cursor-pointer max-w-sm w-full",
                isSelected ? "ring-1 ring-primary border-primary/50 shadow-lg shadow-primary/10" : "hover:border-white/10"
            )}
        >
            {/* Holographic Header Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-sm text-gray-200 leading-tight font-serif line-clamp-2 pt-1 h-10">
                        {scene.visualPrompt}
                    </h3>
                    <div className="flex shrink-0 gap-1">
                        {/* Status Badge */}
                        <div className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-mono tracking-wide uppercase border",
                            scene.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                scene.status === 'generating' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse" :
                                    "bg-white/5 text-gray-500 border-white/5"
                        )}>
                            {scene.status}
                        </div>
                    </div>
                </div>

                {/* Cyberpunk Image Container */}
                <div className="aspect-video w-full bg-black rounded border border-white/5 overflow-hidden relative flex items-center justify-center group/image">
                    {/* Corner accents */}
                    <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-white/20 z-20" />
                    <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-white/20 z-20" />

                    {scene.backgroundRemovedUrl ? (
                        <div className="relative w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Transparent_square.svg/1024px-Transparent_square.svg.png')] bg-repeat bg-[length:20px_20px]">
                            <img src={scene.backgroundRemovedUrl} alt="Transparent" className="w-full h-full object-contain relative z-10" />
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-500 text-black text-[9px] rounded-sm font-bold font-mono tracking-tighter">NO-BG</div>
                        </div>
                    ) : scene.imageUrl ? (
                        <div className="relative w-full h-full">
                            <img src={scene.imageUrl} alt={scene.visualPrompt} className="w-full h-full object-cover opacity-90 group-hover/image:opacity-100 transition-opacity" />
                            {/* Remove BG Button overlay */}
                            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover/image:opacity-100 transition-all transform translate-y-2 group-hover/image:translate-y-0">
                                <button
                                    onClick={handleRemoveBg}
                                    className="p-1.5 bg-black/60 hover:bg-black/90 text-white rounded backdrop-blur-sm border border-white/10 hover:border-primary/50 hover:text-primary"
                                    title="Remove Background (Hugging Face)"
                                >
                                    {isRemovingBg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crop className="w-3 h-3" />}
                                </button>
                                {onToggleLock && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleLock(scene); }}
                                        className={cn(
                                            "p-1.5 rounded backdrop-blur-sm border transition-colors",
                                            isStructureLocked
                                                ? "bg-primary text-white border-primary"
                                                : "bg-black/60 text-white border-white/10 hover:border-primary/50 hover:text-primary"
                                        )}
                                        title={isStructureLocked ? "Structure Locked (Unlock)" : "Lock Structure for Next Shot"}
                                    >
                                        {isStructureLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-white/20 flex flex-col items-center gap-2">
                            {scene.status === 'generating' ? (
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            ) : (
                                <ImageIcon className="w-8 h-8 stroke-1" />
                            )}
                            <span className="text-[10px] uppercase tracking-widest font-mono">
                                {scene.status === 'generating' ? 'Rendering...' : 'No Data'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Script Snippet overlay/footer */}
            <div className="px-4 pb-4">
                <p className="text-[10px] text-gray-500 bg-white/5 p-2 rounded border border-white/5 font-mono line-clamp-2">
                    {scene.scriptText}
                </p>
            </div>
        </div>
    );
}
