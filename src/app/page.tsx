"use client";

import { useState } from "react";
import { Scene, FiboParameters } from "@/lib/types";
import { director } from "@/lib/director-agent";
import { SceneCard } from "@/components/storyboard/SceneCard";
import { ControlPanel } from "@/components/storyboard/ControlPanel";
import { createBriaClient } from "@/lib/bria-client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play, Search, Code2, Film, Clapperboard } from "lucide-react";

export default function Home() {
  const [script, setScript] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_BRIA_API_KEY || "");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [useAiDirector, setUseAiDirector] = useState(false); // AI Mode Toggle
  const [aiProgress, setAiProgress] = useState("");
  const [structureLockedSceneId, setStructureLockedSceneId] = useState<string | null>(null); // New state for Hybrid Pipeline

  // Derive selected scene
  const selectedScene = scenes.find(s => s.id === selectedSceneId) || null;

  const handleToggleLock = (scene: Scene) => {
    // Toggle logic: If clicking the same scene, unlock. If distinct, lock new one.
    setStructureLockedSceneId(prev => prev === scene.id ? null : scene.id);
  };

  const handleAnalyzeDate = async () => {
    if (!script.trim()) return;
    setIsAnalysing(true);
    setAiProgress("Analyzing script structure...");

    // 1. Basic Regex Breakdown (Fast)
    // Simulate thinking/processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple heuristic: Split by "INT." or "EXT." or double newlines
    const chunks = script.split(/\n\s*\n/).filter(line => line.trim().length > 0);

    const directorAgent = director; // Use the imported director instance
    let newScenes: Scene[] = chunks.map((chunk, index) => {
      const visualParams = directorAgent.inferParameters(chunk);
      return {
        id: `scene-${Date.now()}-${index}`,
        scriptText: chunk,
        visualPrompt: `Scene ${index + 1}: ${chunk.substring(0, 50)}...`, // Placeholder, real app would summarize
        parameters: visualParams,
        status: 'pending' // Initial status
      };
    });

    setScenes(newScenes);
    if (newScenes.length > 0) setSelectedSceneId(newScenes[0].id);


    // 2. AI Director Mode (Slow, High Quality)
    if (useAiDirector && apiKey) {
      const bria = createBriaClient(apiKey);
      const total = newScenes.length;

      for (let i = 0; i < total; i++) {
        setAiProgress(`AI Director: Refining Scene ${i + 1}/${total}...`);
        try {
          // We use the full script chunk as the prompt for the VLM to interpret
          const json = await bria.generateStructuredPrompt(newScenes[i].scriptText);

          // Update the scene with the real JSON
          newScenes[i] = {
            ...newScenes[i],
            fiboStructuredPrompt: json,
            parameters: {
              ...newScenes[i].parameters,
              structured_prompt: json
            },
            visualPrompt: json.short_description || newScenes[i].visualPrompt // Use VLM description if available
          };
          // Update state incrementally so user sees progress
          setScenes([...newScenes]);
        } catch (e) {
          console.error(`Failed to refine scene ${i + 1}`, e);
        }
      }
    }

    setAiProgress("");
    setIsAnalysing(false);
  };

  const handleUpdateParams = (newParams: Partial<FiboParameters>) => {
    if (!selectedScene) return;

    const updated = director.updateSceneParams(selectedScene, newParams);

    setScenes(prev => prev.map(s => s.id === selectedScene.id ? updated : s));
  };

  const handleGenerate = async () => {
    if (!selectedScene) return;

    // Optimistic update
    setScenes(prev => prev.map(s => s.id === selectedScene.id ? { ...s, status: 'generating' } : s));

    try {
      const bria = createBriaClient(apiKey);

      // HYBRID PIPELINE LOGIC
      // Check if a global Structure Lock is active
      let generationParams = { ...selectedScene.parameters };

      if (structureLockedSceneId) {
        const lockedScene = scenes.find(s => s.id === structureLockedSceneId);
        if (lockedScene && lockedScene.imageUrl) {
          console.log(`Using Hybrid V1 Pipeline: Locking structure to Scene ${lockedScene.id}`);
          // Inject the structure reference into the parameters passed to BriaClient
          generationParams.structure_image_url = lockedScene.imageUrl;
          generationParams.structure_ref_influence = 0.7; // Default high influence
        }
      }

      // Mocking the call if no key, or trying real if key exists
      let imageUrl = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2659&auto=format&fit=crop"; // Placeholder

      if (apiKey) {
        const result = await bria.generateImage(selectedScene.visualPrompt, generationParams);
        imageUrl = result.url;
      } else {
        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("SIMULATION MODE: Payload sent to Bria:", JSON.stringify(generationParams, null, 2));
        // Cycle through some cinematic placeholders based on parameters
        if (selectedScene.parameters.camera?.angle === 'low_angle') imageUrl = "https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=2500";
        if (selectedScene.parameters.lighting?.type === 'noir') imageUrl = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2670";
      }

      setScenes(prev => prev.map(s => s.id === selectedScene.id ? { ...s, status: 'completed', imageUrl } : s));

    } catch (e) {
      console.error(e);
      setScenes(prev => prev.map(s => s.id === selectedScene.id ? { ...s, status: 'failed' } : s));
    }
  };

  const handleRemoveBg = async (scene: Scene) => {
    if (!scene.imageUrl) return;

    try {
      // Optimistic UI? Maybe just wait. The Card has local loading state.
      const bria = createBriaClient(apiKey);
      const newUrl = await bria.removeBackground(scene.imageUrl);

      setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, backgroundRemovedUrl: newUrl } : s));
    } catch (e) {
      console.error("BG Remove failed", e);
      alert("Failed to remove background. Check console.");
    }
  };

  const handleFetchJson = async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    try {
      const bria = createBriaClient(apiKey);
      // Generate JSON based on the visual prompt
      const json = await bria.generateStructuredPrompt(scene.visualPrompt);

      // Update scene parameters with this new structured prompt
      setScenes(prev => prev.map(s => {
        if (s.id === sceneId) {
          return {
            ...s,
            fiboStructuredPrompt: json,
            parameters: {
              ...s.parameters,
              structured_prompt: json
            }
          };
        }
        return s;
      }));
    } catch (e) {
      console.error("Fetch JSON failed", e);
      alert("Failed to fetch FIBO JSON. Check API Key/Console.");
    }
  };

  return (
    <main className="flex h-screen bg-[#050505] text-foreground overflow-hidden font-sans selection:bg-primary/30">

      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px]" />
      </div>

      {/* Sidebar: Script & Config */}
      <aside className="w-96 flex-shrink-0 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-20 shadow-2xl relative">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-6 text-primary animate-pulse-slow">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wider text-white uppercase font-serif">Infrared Universe</h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Director's Console v2.0</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* API Key - Discrete if set */}
            {!process.env.NEXT_PUBLIC_BRIA_API_KEY && (
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">System Access Key</label>
                <input
                  type="password"
                  placeholder="Enter Bria API Key..."
                  className="w-full bg-white/5 text-xs px-3 py-2 rounded-sm border border-white/10 focus:border-primary/50 outline-none text-white transition-all placeholder:text-white/20"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            )}
            {process.env.NEXT_PUBLIC_BRIA_API_KEY && (
              <div className="flex items-center gap-2 text-[10px] text-green-500 bg-green-500/5 px-2 py-1 rounded border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> System Online (Prod Key Active)
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col min-h-0">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block flex items-center gap-2">
            <Code2 className="w-3 h-3" /> Source Script
          </label>
          <div className="flex-1 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <textarea
              className="relative w-full h-full bg-[#0a0a0a] p-4 rounded-lg resize-none text-xs leading-relaxed outline-none border border-white/10 focus:border-primary/50 text-gray-300 font-serif placeholder:text-white/10 shadow-inner"
              placeholder="INT. NEON CITY - NIGHT&#10;&#10;Rain slicks the pavement. A cyber-enhanced figure steps out of the shadows..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
            />
          </div>

          <div className="mt-5 flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="aiDirector"
                className="peer sr-only"
                checked={useAiDirector}
                onChange={(e) => setUseAiDirector(e.target.checked)}
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              <label htmlFor="aiDirector" className="absolute inset-0 cursor-pointer"></label>
            </div>
            <div>
              <label htmlFor="aiDirector" className="text-xs font-bold text-white cursor-pointer select-none block">
                AI Director Mode
              </label>
              <span className="text-[10px] text-muted-foreground">Auto-generate FIBO JSON (Slow)</span>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleAnalyzeDate}
            disabled={!script.trim() || isAnalysing}
            className="group relative w-full overflow-hidden rounded-lg bg-white p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-zinc-950 px-3 py-4 text-sm font-bold text-white backdrop-blur-3xl transition-colors hover:bg-zinc-900 gap-2 uppercase tracking-widest">
              {isAnalysing ? (
                <span className="animate-spin text-primary">⟳</span>
              ) : (
                <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              )}
              {isAnalysing ? (aiProgress || 'Processing...') : 'Initialize Breakdown'}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content: Storyboard Timeline */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">
        <header className="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Timeline</h2>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-mono">{scenes.length} SCENES</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-md text-gray-400 transition-colors">
              <Search className="w-4 h-4" />
            </button>
            {/* Export Button Placeholder */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {scenes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-4">
              <Film className="w-16 h-16 stroke-1" />
              <p className="text-lg font-light">Enter a script to generate your storyboard</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
              <AnimatePresence mode="popLayout">
                {scenes.map((scene) => (
                  <SceneCard
                    key={scene.id}
                    scene={scene}
                    isSelected={selectedSceneId === scene.id}
                    onClick={() => setSelectedSceneId(scene.id)}
                    onRemoveBg={handleRemoveBg}
                    isStructureLocked={structureLockedSceneId === scene.id}
                    onToggleLock={handleToggleLock}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Control Panel */}
      <aside className="w-96 flex-shrink-0 border-l border-white/5 bg-black/40 backdrop-blur-xl z-20 shadow-xl flex flex-col justify-center">
        {selectedScene ? (
          <ControlPanel
            scene={selectedScene}
            onUpdateParams={handleUpdateParams}
            onGenerate={handleGenerate}
            onFetchJson={() => handleFetchJson(selectedScene.id)}
            isHybridMode={!!structureLockedSceneId}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-50">
            <Film className="w-12 h-12 mb-4 stroke-1" />
            <p className="text-sm font-mono uppercase tracking-widest">No Scene Selected</p>
            <p className="text-[10px] mt-2">Select a scene from the timeline to access Director Controls.</p>
          </div>
        )}
      </aside>

    </main>
  );
}
