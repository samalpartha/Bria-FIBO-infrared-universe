"use client";

import { useState } from "react";
import { Scene } from "@/lib/types";
import { Play, Search, ZoomIn, PlusCircle, SkipBack, SkipForward, FileText, Camera } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
function SortableScene({ scene, activeSceneId, selectScene }: { scene: Scene; activeSceneId: string | null; selectScene: (id: string) => void }) {
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
      />
    </div>
  );
}

// --- MAIN PAGE (PRO LAYOUT) ---

export default function Home() {
  const [showHero, setShowHero] = useState(true);

  const [activeMobileTab, setActiveMobileTab] = useState<'script' | 'storyboard' | 'studio'>('storyboard');
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
    reorderScenes, // New Action
    history, // New State
    applyPreset, // New Action
    analyzeScript, // New Action
    generateAll // New Action
  } = useDirector();

  // Export Functionality
  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      script,
      scenes,
      history
    };

    // Create and trigger download
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bria-fibo-project-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast("Project exported successfully!", "success");
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  return (
    <main className="h-screen w-screen flex flex-col bg-[var(--director-bg)] text-[var(--director-text)] overflow-hidden font-sans selection:bg-[var(--cinema-gold)] selection:text-black">
      <Navbar />
      <WelcomeModal />

      {/* MAIN WORKSPACE GRID */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr_360px] min-h-0 relative">

        {/* LEFT PANEL: SCRIPT (Fixed on Desktop) */}
        <div className={`
            flex flex-col bg-[var(--director-surface-1)] border-r border-white/5 z-30
            ${activeMobileTab === 'script' ? 'absolute inset-0 w-full' : 'hidden md:flex relative'}
        `}>
          <div className="h-10 border-b border-white/5 flex items-center px-4 bg-black/20">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#777]">Scene List</span>
          </div>
          <ScriptPanel
            script={script}
            setScript={setScript}
            history={history}
            onApplyPreset={(p) => { applyPreset(p); addToast(`Applied preset: ${p}`, "success"); }}
            onAnalyze={() => { analyzeScript(); addToast("Script analyzed!", "info"); setActiveMobileTab('storyboard'); }}
            onGenerateAll={() => { generateAll(); addToast("Started batch generation", "success"); }}
            onExport={handleExport}
          />
        </div>

        {/* CENTER PANEL: TIMELINE / CANVAS */}
        <div className={`
            flex flex-col relative bg-[var(--director-bg)] overflow-hidden
            ${activeMobileTab === 'storyboard' ? 'absolute inset-0 w-full flex' : 'hidden md:flex relative'}
        `}>
          {/* HEADER */}
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[var(--director-surface-1)] z-20 shadow-md">
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-white tracking-wide">INT. NEO-TOKYO APARTMENT - NIGHT</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#777] font-mono">SCENE 1</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/5 rounded-full text-[#777] hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-white/5 rounded-full text-[#777] hover:text-white transition-colors"><ZoomIn className="w-4 h-4" /></button>
            </div>
          </div>

          {/* CANVAS AREA */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative p-8">
            <div className="absolute inset-0 film-grain pointer-events-none z-0 opacity-30" />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={scenes.map(s => s.id)} strategy={rectSortingStrategy}>
                {scenes.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-32 relative z-10">
                    {scenes.map(s => (
                      <SortableScene
                        key={s.id}
                        scene={s}
                        activeSceneId={activeSceneId}
                        selectScene={(id) => { selectScene(id); if (window.innerWidth < 768) setActiveMobileTab('studio'); }}
                      />
                    ))}
                    {/* ADD SCENE BUTTON */}
                    <button className="h-64 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-[#555] hover:text-[var(--cinema-gold)] hover:border-[var(--cinema-gold)]/50 hover:bg-[var(--cinema-gold)]/5 transition-all group">
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
                      onClick={() => { if (window.innerWidth < 768) setActiveMobileTab('script'); }}
                      className="px-6 py-3 bg-[var(--cinema-gold)] text-black font-bold uppercase tracking-widest rounded hover:scale-105 transition-transform glow-gold"
                    >
                      Start Creating
                    </button>
                  </div>
                )}
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
        <div className={`
            flex flex-col bg-[var(--director-surface-2)] border-l border-white/5 z-20 shadow-2xl
            ${activeMobileTab === 'studio' ? 'absolute inset-0 w-full flex' : 'hidden md:flex relative'}
        `}>
          <div className="md:hidden h-10 border-b border-white/10 flex items-center px-4 bg-black/40">
            <button onClick={() => setActiveMobileTab('storyboard')} className="text-[10px] text-white/50 uppercase tracking-widest">← Back</button>
          </div>

          <StudioControls
            scene={activeScene}
            onUpdateParams={(params) => activeSceneId && updateSceneParams(activeSceneId, params)}
            onGenerate={() => { activeSceneId && generateShot(activeSceneId); addToast("Generation queued", "info"); }}
            isGenerating={isGenerating}
          />
        </div>

      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden h-14 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-around z-50 fixed bottom-0 left-0 right-0 pb-safe">
        <button onClick={() => setActiveMobileTab('script')} className={`flex flex-col items-center gap-1 ${activeMobileTab === 'script' ? 'text-[var(--cinema-gold)]' : 'text-white/40'}`}>
          <FileText className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase">Script</span>
        </button>
        <button onClick={() => setActiveMobileTab('storyboard')} className={`flex flex-col items-center gap-1 ${activeMobileTab === 'storyboard' ? 'text-[var(--cinema-gold)]' : 'text-white/40'}`}>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center -mt-6 border border-white/10 backdrop-blur-md">
            <Play className="w-4 h-4 fill-current" />
          </div>
        </button>
        <button onClick={() => setActiveMobileTab('studio')} className={`flex flex-col items-center gap-1 ${activeMobileTab === 'studio' ? 'text-[var(--cinema-gold)]' : 'text-white/40'}`}>
          <Camera className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase">Studio</span>
        </button>
      </div>
    </main>
  );
}
