
import { Scene, FiboParameters } from "@/lib/types";
import { Camera, Film, Sparkles, SunMedium, Wand2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
    scene: Scene;
    onUpdateParams: (params: FiboParameters) => void;
    onGenerate: () => void;
    onFetchJson: () => void;
    isHybridMode?: boolean;
}

export function ControlPanel({ scene, onUpdateParams, onGenerate, onFetchJson, isHybridMode }: ControlPanelProps) {
    const parameters = scene.parameters;

    // Helper to update specific sections safely
    const updateParams = (section: keyof FiboParameters, value: any) => {
        onUpdateParams({
            ...parameters,
            [section]: value
        });
    };

    return (
        <div className="h-full flex flex-col bg-black/40 backdrop-blur-xl border-l border-white/5">
            <header className="p-6 border-b border-white/5 bg-white/5">
                <h2 className="font-bold text-sm text-white uppercase tracking-widest flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-primary" />
                    Parameter Control
                </h2>
                <p className="text-[10px] text-gray-500 mt-1 font-mono">FIBO ENGINE V2 • {scene.id}</p>
            </header>

            {isHybridMode && (
                <div className="bg-blue-500/10 border-b border-blue-500/20 p-3 flex items-center gap-2">
                    <div className="p-1 bg-blue-500 text-white rounded-full">
                        <Lock className="w-3 h-3" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Hybrid Pipeline Active</p>
                        <p className="text-[9px] text-blue-300/70">Structure is locked to a reference scene. Camera/Composition settings will be overridden by the V1 Reimagine engine.</p>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Render Quality Toggle */}
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                        <Sparkles className={cn("w-4 h-4", parameters.fastMode ? "text-gray-400" : "text-primary")} />
                        <div>
                            <p className="text-xs font-bold text-gray-200">Render Quality</p>
                            <p className="text-[10px] text-muted-foreground">{parameters.fastMode ? "Draft (Lite Model)" : "Cinematic (Pro Model)"}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onUpdateParams({ ...parameters, fastMode: !parameters.fastMode })}
                        className={cn(
                            "px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors border",
                            parameters.fastMode
                                ? "bg-white/10 text-gray-300 border-white/10"
                                : "bg-primary/20 text-primary border-primary/50"
                        )}
                    >
                        {parameters.fastMode ? "Draft" : "HQ"}
                    </button>
                </div>

                {/* Visual Prompt Section */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-1">Visual Prompt</h3>
                    <textarea
                        className="w-full h-24 bg-[#0a0a0a] p-3 rounded text-xs text-gray-300 outline-none border border-white/10 focus:border-primary/50 transition-colors font-serif resize-none"
                        value={scene.visualPrompt}
                        readOnly // For now, we don't edit this back up, but we could
                    />
                </section>

                {/* Camera Control */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Camera className="w-3 h-3" /> Camera & Lens
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400">Shot Type</label>
                            <select
                                className="w-full bg-white/5 text-xs text-white p-2 rounded appearance-none border border-white/5 focus:border-primary/50 outline-none"
                                value={parameters.camera?.distance || ''}
                                onChange={(e) => updateParams('camera', { ...parameters.camera, distance: e.target.value })}
                            >
                                <option value="">Auto</option>
                                <option value="close_up">Close Up</option>
                                <option value="medium_shot">Medium Shot</option>
                                <option value="long_shot">Wide Shot</option>
                                <option value="extreme_long_shot">Extreme Wide</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400">Angle</label>
                            <select
                                className="w-full bg-white/5 text-xs text-white p-2 rounded appearance-none border border-white/5 focus:border-primary/50 outline-none"
                                value={parameters.camera?.angle || ''}
                                onChange={(e) => updateParams('camera', { ...parameters.camera, angle: e.target.value })}
                            >
                                <option value="">Auto</option>
                                <option value="eye_level">Eye Level</option>
                                <option value="low_angle">Low Angle</option>
                                <option value="high_angle">High Angle</option>
                                <option value="bird_eye_view">Bird's Eye</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Lighting Control */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <SunMedium className="w-3 h-3" /> Lighting
                    </h3>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">Style / Type</label>
                        <select
                            className="w-full bg-white/5 text-xs text-white p-2 rounded appearance-none border border-white/5 focus:border-primary/50 outline-none"
                            // Map 'style' to 'type' since Interface defines 'type'
                            value={parameters.lighting?.type || ''}
                            onChange={(e) => updateParams('lighting', { ...parameters.lighting, type: e.target.value })}
                        >
                            <option value="">Auto</option>
                            <option value="natural">Natural</option>
                            <option value="cinematic">Cinematic</option>
                            <option value="studio">Studio</option>
                            <option value="neon">Neon / Cyberpunk</option>
                            <option value="dramatic">Dramatic</option>
                        </select>
                    </div>
                </section>

                {/* Color & Grading Control */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-500 to-purple-500" /> Color & Mood
                    </h3>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400">Color Grading</label>
                            <select
                                className="w-full bg-white/5 text-xs text-white p-2 rounded appearance-none border border-white/5 focus:border-primary/50 outline-none"
                                value={parameters.color?.grading || ''}
                                onChange={(e) => updateParams('color', { ...parameters.color, grading: e.target.value })}
                            >
                                <option value="">Auto</option>
                                <option value="cinematic">Cinematic</option>
                                <option value="hdr">HDR (High Dynamic Range)</option>
                                <option value="vintage">Vintage / Retro</option>
                                <option value="black_and_white">Black & White</option>
                                <option value="muted">Muted / Desaturated</option>
                                <option value="vibrant">Vibrant / Neon</option>
                                <option value="pastel">Pastel</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400">Palette Override (Top 3 Colors)</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 text-xs text-white p-2 rounded border border-white/5 focus:border-primary/50 outline-none placeholder:text-gray-700"
                                placeholder="#ff0000, teal, gold"
                                value={parameters.color?.palette?.join(', ') || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const colors = val ? val.split(',').map(s => s.trim()) : undefined;
                                    updateParams('color', { ...parameters.color, palette: colors });
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* JSON Preview (for "Best JSON-Native" requirement) */}
                <section className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest">FIBO Structured Prompt (JSON)</h3>
                        <button
                            onClick={onFetchJson}
                            className="text-[10px] px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-full transition-all flex items-center gap-1 hover:shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                            title="Fetch the real JSON structure from Bria V2 VLM"
                        >
                            <Sparkles className="w-3 h-3" /> Fetch Logic
                        </button>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <textarea
                            className="relative w-full h-48 bg-[#050505] p-3 rounded text-[10px] font-mono text-green-400/80 resize-none border border-white/10 focus:border-primary/50 outline-none"
                            value={parameters.structured_prompt ? JSON.stringify(parameters.structured_prompt, null, 2) : JSON.stringify(parameters, null, 2)}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    if (parsed.objects || parsed.short_description) {
                                        onUpdateParams({ ...parameters, structured_prompt: parsed });
                                    } else {
                                        onUpdateParams({ ...parameters, structured_prompt: parsed });
                                    }
                                } catch (e) {
                                    console.log("Invalid JSON while typing");
                                }
                            }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                        {parameters.structured_prompt ? <span className="text-green-500">●</span> : <span className="text-yellow-500">○</span>}
                        {parameters.structured_prompt ? "Decoupled FIBO JSON Active" : "Inferred Logic (Fetch for Full JSON)"}
                    </p>
                </section>

            </div>

            <div className="p-6 border-t border-white/5 bg-black/20">
                <button
                    onClick={onGenerate}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-lg font-bold shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <Film className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Generate Shot</span>
                </button>
            </div>
        </div>
    );
}
