"use client";

import { useState } from "react";
import { Scene } from "@/lib/types";
import { Play, Search, ZoomIn, PlusCircle, SkipBack, SkipForward, FileText, Camera } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';


// Imports
import { ScriptPanel } from "@/components/storyboard/ScriptPanel";
import { SceneCard } from "@/components/storyboard/SceneCard";
import { StudioControls } from "@/components/storyboard/ControlPanel";
import { useDirector } from "@/hooks/useDirector";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useToast } from "@/components/ui/ToastContext";

// --- SORTABLE WRAPPER ---
// --- SORTABLE WRAPPER ---
interface SortableSceneProps {
  scene: Scene;
  activeSceneId: string | null;
  selectScene: (id: string) => void;
  onViewJson?: (scene: Scene) => void;
  onDelete?: (scene: Scene) => void;
  onGenerate?: (scene: Scene) => void;
  onUpdate?: (scene: Scene, updates: Partial<Scene>) => void;
}

function SortableScene({ scene, activeSceneId, selectScene, onViewJson, onDelete, onGenerate, onUpdate }: SortableSceneProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SceneCard
        scene={scene}
        isSelected={activeSceneId === scene.id}
        onClick={() => selectScene(scene.id)}
        onViewJson={onViewJson}
        onDelete={onDelete}
        onGenerate={onGenerate}
        onUpdate={onUpdate}
      />
    </div>
  );
}

// --- MAIN PAGE (PRO LAYOUT) ---

// --- JSON VIEWER OVERLAY ---
function JsonViewer({ scene, onClose, onCopy }: { scene: Scene; onClose: () => void; onCopy: () => void }) {
  if (!scene) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-10 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-full">
        <div className="h-12 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--cinema-gold)] uppercase tracking-widest">FIBO Structure Visualizer</span>
            <span className="text-[10px] text-[#555] font-mono">Bria v2.3</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCopy} className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase transition-colors">Copy JSON</button>
            <button onClick={onClose} className="px-3 py-1.5 rounded hover:bg-red-500/20 text-[#777] hover:text-red-400 text-[10px] font-bold uppercase transition-colors">Close</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 font-mono text-xs text-[#aaa]">
          <pre>{JSON.stringify(scene.structuredPrompt || {}, null, 2)}</pre>
        </div>
        <div className="h-10 bg-[#0a0a0a] border-t border-white/10 flex items-center px-6 gap-4 text-[10px] text-[#555]">
          <span>Seed: <span className="text-[var(--cinema-teal)]">{scene.seed || "Random"}</span></span>
          <span>Composition Lock: <span className={scene.lockComposition ? "text-[var(--cinema-gold)]" : "text-[#555]"}>{scene.lockComposition ? "ACTIVE" : "OFF"}</span></span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeMobileTab, setActiveMobileTab] = useState<'script' | 'storyboard' | 'studio'>('storyboard');
  const [viewingJsonScene, setViewingJsonScene] = useState<Scene | null>(null);
  const { addToast } = useToast();

  const {
    script,
    setScript,
    scenes,
    activeSceneId,
    selectScene,
    activeScene,
    generateShot,
    isGenerating,
    updateSceneParams,
    deleteScene,
    updateScene,
    updateSceneComposition, // New
    updateSceneStyle,       // New
    toggleCompositionLock,  // New
    createEmptyScene,       // New
    reorderScenes,
    history,
    applyPreset,
    analyzeScript,
    generateAll
  } = useDirector();

  // Export Functionality (Enhanced for Hackathon)
  const handleExport = () => {
    const data = {
      project_name: "Infrared Universe", // Static for now, could be dynamic
      platform_version: "Bria FIBO v2.0",
      timestamp: new Date().toISOString(),
      script_content: script,
      scenes: scenes.map(s => ({
        id: s.id,
        script_text: s.scriptText,
        visual_prompt: s.visualPrompt,
        parameters: s.parameters,
        fibo_metadata: {
          structured_prompt: s.structuredPrompt,
          seed: s.seed,
          composition_locked: s.lockComposition,
          structure_seed: s.structure_seed
        },
        image_url: s.imageUrl,
        status: s.status
      })),
      history_log: history.length
    };

    // Create and trigger download
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bria-fibo-manifest-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast("Exported Production Manifest (JSON)", "success");
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = scenes.findIndex((s) => s.id === active.id);
      const newIndex = scenes.findIndex((s) => s.id === over?.id);
      reorderScenes(oldIndex, newIndex);
      addToast("Scene reordered", "info");
    }
  }

  // --- INTERACTIVE STATE ---
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Filtered Scenes for Search
  const filteredScenes = scenes.filter(scene =>
    (scene.scriptText || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (scene.visualPrompt || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="h-screen w-screen flex flex-col bg-[var(--director-bg)] text-[var(--director-text)] overflow-hidden font-sans selection:bg-[var(--cinema-gold)] selection:text-black">
      <Navbar />
      <WelcomeModal />

      {/* JSON Viewer Overlay */}
      {viewingJsonScene && (
        <JsonViewer
          scene={viewingJsonScene}
          onClose={() => setViewingJsonScene(null)}
          onCopy={() => {
            navigator.clipboard.writeText(JSON.stringify(viewingJsonScene.structuredPrompt || {}, null, 2));
            addToast("JSON copied to clipboard", "success");
          }}
        />
      )}

      {/* MAIN WORKSPACE GRID */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr_360px] min-h-0 relative">

        {/* LEFT PANEL: SCRIPT (Always visible on desktop, overlay on mobile) */}
        <div className={`
            bg-[var(--director-surface-1)] border-r border-white/5 h-full
            ${activeMobileTab === 'script' ? 'flex flex-col absolute inset-0 w-full z-40' : 'hidden md:flex md:flex-col relative md:z-30 md:w-full'}
        `}>
          <div className="h-10 border-b border-white/5 flex items-center px-4 bg-black/20 justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#777]">Script Editor</span>
            {/* Agent Badge in Sidebar Header */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[9px] font-bold text-blue-400">DIRECTOR AGENT</span>
            </div>
          </div>
          <ScriptPanel
            script={script}
            setScript={setScript}
            history={history}
            onApplyPreset={(p) => { applyPreset(p); addToast(`Applied preset: ${p}`, "success"); }}
            onAnalyze={() => { analyzeScript(); addToast("Director Agent analyzing script...", "info"); setActiveMobileTab('storyboard'); }}
            onGenerateAll={() => { generateAll(); addToast("Started batch generation", "success"); }}
            onExport={handleExport}
          />
        </div>

        {/* CENTER PANEL: TIMELINE / CANVAS */}
        <div className={`
            flex flex-col relative bg-[var(--director-bg)] overflow-hidden
            ${activeMobileTab === 'storyboard' ? 'absolute inset-0 w-full flex md:static md:w-auto' : 'hidden md:flex relative'}
        `}>
          {/* HEADER */}
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[var(--director-surface-1)] z-20 shadow-md">
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-white tracking-wide">
                {scenes.length > 0 ? scenes[0].scriptText.split('\n')[0].substring(0, 40) : "UNTITLED SCENE"}
                {scenes.length > 0 && scenes[0].scriptText.split('\n')[0].length > 40 ? "..." : ""}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#999] font-mono">
                {filteredScenes.length} SCENE{filteredScenes.length !== 1 ? 'S' : ''}
              </span>
            </div>

            {/* AGENTIC ACTION: REGENERATE PLAN */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { analyzeScript(); addToast("Regenerating Cinematic Plan...", "info"); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all text-xs font-bold uppercase tracking-wider"
              >
                <FileText className="w-3 h-3" />
                Regenerate Plan
              </button>
              <div className="w-[1px] h-4 bg-white/10 mx-1" />

              {/* SEARCH BAR */}
              <div className="flex items-center gap-2 relative">
                {showSearch && (
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search scenes..."
                    className="w-40 bg-[#222] !bg-neutral-900 !text-white border border-white/20 rounded px-2 py-1 text-xs placeholder:text-gray-500 focus:outline-none focus:border-[var(--cinema-teal)] animate-in slide-in-from-right-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setShowSearch(false)}
                  />
                )}
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={cn("p-2 hover:bg-white/5 rounded-full transition-colors", showSearch || searchQuery ? "text-[var(--cinema-gold)]" : "text-[#777] hover:text-white")}
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* ZOOM CONTROLS */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))} className="p-1.5 hover:bg-white/10 rounded text-[#777] hover:text-white text-[10px] font-mono">-</button>
                <span className="text-[10px] font-mono w-8 text-center text-[#999]">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))} className="p-1.5 hover:bg-white/10 rounded text-[#777] hover:text-white text-[10px] font-mono">+</button>
              </div>
            </div>
          </div>

          {/* CANVAS AREA */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative p-8">
            <div className="absolute inset-0 film-grain pointer-events-none z-0 opacity-30" />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredScenes.map(s => s.id)} strategy={rectSortingStrategy}>
                <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${100 / zoomLevel}%` }} className="transition-transform duration-200 ease-out p-8">
                  {filteredScenes.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-48 relative z-10">
                      {filteredScenes.map(s => (
                        <SortableScene
                          key={s.id}
                          scene={s}
                          activeSceneId={activeSceneId}
                          selectScene={(id) => { selectScene(id); if (window.innerWidth < 768) setActiveMobileTab('studio'); }}
                          onViewJson={(scene) => setViewingJsonScene(scene)}
                          onDelete={(scene) => deleteScene(scene.id)}
                          onGenerate={(scene) => { generateShot(scene.id); addToast("Shot queued for rendering...", "info"); }}
                          onUpdate={(scene, updates) => updateScene(scene.id, updates)}
                        />
                      ))}
                      {/* ADD SCENE BUTTON */}
                      <button
                        onClick={createEmptyScene}
                        className="h-64 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-[#555] hover:text-[var(--cinema-gold)] hover:border-[var(--cinema-gold)]/50 hover:bg-[var(--cinema-gold)]/5 transition-all group"
                      >
                        <PlusCircle className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Add New Scene</span>
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-[var(--cinema-gold)]/5 border border-[var(--cinema-gold)]/20 flex items-center justify-center glow-gold">
                        <Play className="w-8 h-8 text-[var(--cinema-gold)] ml-1" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Ready to Direct?</h2>
                        <p className="text-[#777] max-w-sm mx-auto">Start by pasting your script in the left panel or click to create your first scene manually.</p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            setActiveMobileTab('script');
                          } else {
                            createEmptyScene();
                            addToast("New scene created", "success");
                          }
                        }}
                        className="px-6 py-3 bg-[var(--cinema-gold)] text-black font-bold uppercase tracking-widest rounded hover:scale-105 transition-transform glow-gold"
                      >
                        Start Creating
                      </button>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* FOOTER: PLAYBACK */}
          <div className="h-12 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 z-30">
            <div className="flex items-center gap-4 text-[10px] font-mono text-[#555]">
              <span className="text-[var(--cinema-teal)]">READY</span>
              <div className="w-[1px] h-3 bg-white/10" />
              <span>00:00:00:00</span>
            </div>
            <div className="flex items-center gap-6">
              <button className="text-[#777] hover:text-white transition-colors"><SkipBack className="w-4 h-4" /></button>
              <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[var(--cinema-gold)] hover:text-black transition-colors"><Play className="w-3 h-3 ml-0.5" /></button>
              <button className="text-[#777] hover:text-white transition-colors"><SkipForward className="w-4 h-4" /></button>
            </div>
            <div className="w-24 bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="w-[30%] h-full bg-[var(--cinema-gold)]" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: STUDIO (Fixed on Desktop) */}
        <div data-testid="studio-panel" className={`
            flex flex-col bg-[var(--director-surface-2)] border-l border-white/5 z-20 shadow-2xl
            ${activeMobileTab === 'studio' ? 'absolute inset-0 w-full flex md:static md:w-auto' : 'hidden md:flex relative'}
        `}>
          <div className="md:hidden h-10 border-b border-white/10 flex items-center px-4 bg-black/40">
            <button onClick={() => setActiveMobileTab('storyboard')} className="text-[10px] text-white/50 uppercase tracking-widest">← Back</button>
          </div>

          <StudioControls
            scene={activeScene}
            // Use split updates for Structure Lock support
            onUpdateComposition={(params) => activeSceneId && updateSceneComposition(activeSceneId, params)}
            onUpdateStyle={(params) => activeSceneId && updateSceneStyle(activeSceneId, params)}
            onToggleLock={(id) => toggleCompositionLock(id)}
            // Fallback
            onUpdateParams={(params) => activeSceneId && updateSceneParams(activeSceneId, params)}

            onGenerate={() => { if (activeSceneId) generateShot(activeSceneId); addToast("Generation queued", "info"); }}
            isGenerating={isGenerating}
          />
        </div>

      </div>

      {/* MOBILE TAB BAR (Only visible on mobile, hidden on desktop) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-[#1a1a1a] border border-white/10 rounded-full shadow-2xl z-[150] backdrop-blur-md pointer-events-auto">
        <button
          onClick={() => setActiveMobileTab('script')}
          className={`
            px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all
            ${activeMobileTab === 'script' ? 'bg-white text-black shadow-lg scale-105' : 'text-[#777] hover:text-white'}
          `}
        >
          Script
        </button>
        <button
          onClick={() => setActiveMobileTab('storyboard')}
          className={`
            px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all
            ${activeMobileTab === 'storyboard' ? 'bg-white text-black shadow-lg scale-105' : 'text-[#777] hover:text-white'}
          `}
        >
          Storyboard
        </button>
        <button
          onClick={() => setActiveMobileTab('studio')}
          className={`
            px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all
            ${activeMobileTab === 'studio' ? 'bg-white text-black shadow-lg scale-105' : 'text-[#777] hover:text-white'}
          `}
        >
          Studio
        </button>
      </div>
    </main>
  );
}
