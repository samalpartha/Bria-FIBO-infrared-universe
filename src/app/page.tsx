
"use client";

import { useState } from "react";
import { Scene } from "@/lib/types";
import { Play } from "lucide-react";
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

  // Smooth scroll to workspace or dismiss hero
  const handleStart = () => {
    setShowHero(false);
  };

  return (
    <main className="h-screen w-screen flex flex-col bg-[#1a1a1a] text-[#f5f5f5] overflow-hidden font-sans">
      <Navbar />
      <WelcomeModal />

      {/* FIXED STUDIO LAYOUT: Desktop 3-Pane | Mobile Tabbed */}
      <div className="flex-1 flex min-h-0 relative">

        {/* LEFT: SCRIPT PANEL (Desktop: Fixed 300px | Mobile: Full if active) */}
        <div className={`
            flex-col bg-[#1a1a1a] z-30 shadow-xl border-r border-white/5
            md:w-[300px] md:flex md:relative absolute inset-0
            ${activeMobileTab === 'script' ? 'flex w-full' : 'hidden'}
        `}>
          <ScriptPanel
            script={script}
            setScript={setScript}
            history={history}
            onApplyPreset={(p) => { applyPreset(p); addToast(`Applied preset: ${p}`, "success"); }}
            onAnalyze={() => { analyzeScript(); addToast("Script analyzed!", "info"); setActiveMobileTab('storyboard'); }}
            onGenerateAll={() => { generateAll(); addToast("Started batch generation", "success"); }}
          />
        </div>

        {/* CENTER: FLUID CANVAS (Desktop: Flex | Mobile: Full if active) */}
        <div className={`
            flex-col bg-[#111] overflow-hidden relative flex-1
            ${activeMobileTab === 'storyboard' ? 'flex' : 'hidden md:flex'}
        `}>

          {/* Scrollable Canvas Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative cinema-canvas pb-20 md:pb-0">
            {/* Film Grain & Grid Overlay */}
            <div className="absolute inset-0 film-grain pointer-events-none z-0" />

            {/* Hero Section (Collapsible) */}
            {showHero && (
              <div className="relative z-20">
                <Hero onStart={handleStart} />
              </div>
            )}

            <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 relative z-10 transition-all duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <Play className="w-3 h-3 text-[var(--cinema-gold)]" fill="currentColor" /> Timeline
                </h2>
                <span className="text-[10px] font-mono text-white/50 hidden md:block">00:00:12:44</span>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={scenes.map(s => s.id)}
                  strategy={rectSortingStrategy}
                >
                  {scenes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 pb-32">
                      {scenes.map(s => (
                        <SortableScene
                          key={s.id}
                          scene={s}
                          activeSceneId={activeSceneId}
                          selectScene={(id) => { selectScene(id); if (window.innerWidth < 768) setActiveMobileTab('studio'); }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-xl bg-black/20">
                      <Play className="w-8 h-8 text-white/20 mb-4" />
                      <p className="text-sm text-white/50 font-medium">No Scenes Detected</p>
                      <p className="text-xs text-white/30 mt-1">Write a script to begin.</p>
                      <button onClick={() => setActiveMobileTab('script')} className="md:hidden mt-4 px-4 py-2 bg-white/5 rounded text-xs">Go to Script</button>
                    </div>
                  )}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>

        {/* RIGHT: STUDIO CONTROLS (Desktop: Fixed 360px | Mobile: Full if active) */}
        <div className={`
             flex-col bg-[#121212] z-20 shadow-2xl border-l border-white/5
             md:w-[360px] md:flex md:relative absolute inset-0
             ${activeMobileTab === 'studio' ? 'flex w-full' : 'hidden'}
        `}>
          {/* Mobile Back Button for Studio */}
          <div className="md:hidden h-10 border-b border-white/10 flex items-center px-4 bg-black/40">
            <button onClick={() => setActiveMobileTab('storyboard')} className="text-[10px] text-white/50 uppercase tracking-widest">← Back to Timeline</button>
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
        <button
          onClick={() => setActiveMobileTab('script')}
          className={`flex flex-col items-center gap-1 ${activeMobileTab === 'script' ? 'text-[var(--cinema-teal)]' : 'text-white/40'}`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider">Script</div>
        </button>
        <button
          onClick={() => setActiveMobileTab('storyboard')}
          className={`flex flex-col items-center gap-1 ${activeMobileTab === 'storyboard' ? 'text-[var(--cinema-teal)]' : 'text-white/40'}`}
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center -mt-6 border border-white/10 backdrop-blur-md">
            <Play className="w-4 h-4 fill-current" />
          </div>
        </button>
        <button
          onClick={() => setActiveMobileTab('studio')}
          className={`flex flex-col items-center gap-1 ${activeMobileTab === 'studio' ? 'text-[var(--cinema-teal)]' : 'text-white/40'}`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider">Studio</div>
        </button>
      </div>
    </main>
  );
}
