import React, { useState } from 'react';
import { Hash, Sparkles, BookOpen, Clock, Star, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

interface ScriptPanelProps {
    script: string;
    setScript: (s: string) => void;
    history?: any[];
    onApplyPreset?: (presetName: string) => void;
    onAnalyze?: () => void;
    onGenerateAll?: () => void;
}

type Tab = 'script' | 'history' | 'presets';

export function ScriptPanel({ script, setScript, history = [], onApplyPreset, onAnalyze, onGenerateAll }: ScriptPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('script');

    return (
        <div className="flex flex-col h-full bg-[#1a1a1a] shadow-xl z-20">
            {/* ... Tabs (Unchanged) ... */}
            <div className="h-12 border-b border-white/10 flex items-center bg-black/20">
                <button
                    onClick={() => setActiveTab('script')}
                    className={cn(
                        "flex-1 h-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border-b-2",
                        activeTab === 'script' ? "text-[var(--cinema-teal)] border-[var(--cinema-teal)] bg-white/5" : "text-[#555] border-transparent hover:text-white"
                    )}
                >
                    <FileText className="w-3 h-3" /> Script
                </button>
                <div className="w-[1px] h-4 bg-white/10" />
                <button
                    onClick={() => setActiveTab('history')}
                    className={cn(
                        "flex-1 h-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border-b-2",
                        activeTab === 'history' ? "text-[var(--cinema-teal)] border-[var(--cinema-teal)] bg-white/5" : "text-[#555] border-transparent hover:text-white"
                    )}
                >
                    <Clock className="w-3 h-3" /> History
                </button>
                <div className="w-[1px] h-4 bg-white/10" />
                <button
                    onClick={() => setActiveTab('presets')}
                    className={cn(
                        "flex-1 h-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border-b-2",
                        activeTab === 'presets' ? "text-[var(--cinema-teal)] border-[var(--cinema-teal)] bg-white/5" : "text-[#555] border-transparent hover:text-white"
                    )}
                >
                    <Star className="w-3 h-3" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* --- SCRIPT TAB --- */}
                {activeTab === 'script' && (
                    <div className="flex flex-col h-full animate-in fade-in duration-300">
                        <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            className="w-full h-full bg-[#1a1a1a] p-5 text-xs font-mono leading-relaxed text-[#f5f5f5] outline-none resize-none placeholder:text-[#333] selection:bg-[var(--cinema-teal)]/20 custom-scrollbar"
                            placeholder="EXT. VOID - NIGHT..."
                            spellCheck={false}
                        />
                        {/* Action Footer */}
                        <div className="p-4 border-t border-white/10 bg-black/10 space-y-3">
                            <div className="flex justify-between items-center text-[#555] text-[9px]">
                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> AUTO-SAVE ON</span>
                                <span className="font-mono">{script.split(/\s+/).length} WORDS</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Tooltip content="Parse script into scenes automatically" side="top">
                                    <button
                                        onClick={() => onAnalyze?.()}
                                        className="w-full py-2 bg-[var(--cinema-teal)]/10 hover:bg-[var(--cinema-teal)]/20 border border-[var(--cinema-teal)]/30 text-[var(--cinema-teal)] rounded flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02]"
                                    >
                                        <Sparkles className="w-3 h-3" /> Analyze
                                    </button>
                                </Tooltip>
                                <Tooltip content="Generate images for all scenes in batch" side="top">
                                    <button
                                        onClick={() => onGenerateAll?.()}
                                        className="w-full py-2 bg-[var(--cinema-gold)]/10 hover:bg-[var(--cinema-gold)]/20 border border-[var(--cinema-gold)]/30 text-[var(--cinema-gold)] rounded flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02]"
                                    >
                                        <Sparkles className="w-3 h-3" /> Render All
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- HISTORY TAB --- */}
                {activeTab === 'history' && (
                    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-0 animate-in slide-in-from-left-4 duration-300">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-[#333] space-y-2">
                                <Clock className="w-6 h-6 opacity-20" />
                                <span className="text-[10px] uppercase tracking-widest">No History Yet</span>
                            </div>
                        ) : (
                            history.map((scene, i) => (
                                <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                                    <div className="flex gap-3">
                                        <div className="w-16 h-16 bg-black rounded overflow-hidden border border-white/10 group-hover:border-[var(--cinema-teal)]/50 transition-colors">
                                            {/* Thumbnail */}
                                            {scene.imageUrl ? (
                                                <img src={scene.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black opacity-50" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-bold text-white group-hover:text-[var(--cinema-teal)] w-24 truncate">{scene.scriptText.replace(/^\w+\.\s+/, '')}</span>
                                                <span className="text-[9px] text-[#444] whitespace-nowrap">Just now</span>
                                            </div>
                                            <p className="text-[9px] text-[#777] line-clamp-2">{scene.visualPrompt}</p>
                                            <div className="flex gap-1 pt-1 opacity-50">
                                                <span className="px-1.5 py-0.5 rounded-sm bg-white/5 text-[8px] text-[#555] uppercase">{scene.parameters?.camera?.shotType?.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* --- PRESETS TAB --- */}
                {activeTab === 'presets' && (
                    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-4 space-y-2 animate-in slide-in-from-right-4 duration-300">
                        {['Cinematic Drama', 'Studio Setup', 'Bright & Airy', 'Cyberpunk High', 'Noir Detective'].map((preset, i) => (
                            <div
                                key={i}
                                onClick={() => onApplyPreset?.(preset)}
                                className="p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[var(--cinema-gold)]/30 cursor-pointer transition-all flex items-center justify-between group"
                            >
                                <span className="text-xs font-medium text-[#ccc] group-hover:text-[var(--cinema-gold)]">{preset}</span>
                                <Star className={cn("w-3 h-3 text-[#333] group-hover:text-[var(--cinema-gold)]", i < 2 && "text-[var(--cinema-gold)]")} fill={i < 2 ? "currentColor" : "none"} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
