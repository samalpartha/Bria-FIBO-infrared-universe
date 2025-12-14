
"use client";

import { useState } from "react";
import { Scene } from "@/lib/types";
import { Clapperboard, Search, User, Play, Film } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Imports
import { ScriptPanel } from "@/components/storyboard/ScriptPanel";
import { SceneCard } from "@/components/storyboard/SceneCard";
import { StudioControls } from "@/components/storyboard/ControlPanel";
import { useDirector } from "@/hooks/useDirector";

// --- HEADER COMPONENT ---
function Header() {
  return (
    <header className="h-12 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/10 text-[var(--cinema-teal)] shadow-[0_0_15px_rgba(50,184,198,0.1)]">
          <Film className="w-4 h-4 animate-reel-spin" />
        </div>
        <span className="font-bold text-sm tracking-[0.2em] uppercase text-white">
          Producer <span className="text-[var(--cinema-gold)]">OS</span>
        </span>
      </div>

      <div className="flex-1 max-w-xl mx-4">
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555] group-focus-within:text-[var(--cinema-teal)] transition-colors" />
          <input
            type="text"
            placeholder="Global Command Search..."
            className="w-full bg-[#151515] border border-white/5 rounded-full py-1.5 pl-10 pr-4 text-xs text-white placeholder:text-[#555] focus:border-[var(--cinema-teal)] outline-none transition-colors"
            style={{ color: 'white' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#151515] border border-white/10 flex items-center justify-center text-[#777]">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}

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
    }
  }

  return (
    <main className="h-screen w-screen flex flex-col bg-[#1a1a1a] text-[#f5f5f5] overflow-hidden font-sans">
      <Header />

      {/* FIXED STUDIO LAYOUT: 300px | Fluid | 360px */}
      <div className="flex-1 flex min-h-0 relative">

        {/* LEFT: 300px FIXED */}
        <div className="w-[300px] flex-shrink-0 border-r border-white/5 bg-[#1a1a1a] z-10 flex flex-col shadow-xl z-30">
          <ScriptPanel
            script={script}
            setScript={setScript}
            history={history}
            onApplyPreset={applyPreset}
            onAnalyze={analyzeScript}
            onGenerateAll={generateAll}
          />
        </div>

        {/* CENTER: FLUID CANVAS */}
        <div className="flex-1 cinema-canvas overflow-y-auto custom-scrollbar relative">
          {/* Film Grain & Grid Overlay */}
          <div className="absolute inset-0 film-grain pointer-events-none z-0" />

          <div className="p-8 max-w-6xl mx-auto space-y-8 relative z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <Play className="w-3 h-3 text-[var(--cinema-gold)]" fill="currentColor" /> Timeline / Sequencer
              </h2>
              <span className="text-[10px] font-mono text-white/50">00:00:12:44</span>
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
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-32">
                    {scenes.map(s => (
                      <SortableScene
                        key={s.id}
                        scene={s}
                        activeSceneId={activeSceneId}
                        selectScene={selectScene}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-xl bg-black/20">
                    <Play className="w-8 h-8 text-white/20 mb-4" />
                    <p className="text-sm text-white/50 font-medium">No Scenes Detected</p>
                    <p className="text-xs text-white/30 mt-1">Write a script in the left panel to begin.</p>
                  </div>
                )}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* RIGHT: 360px FIXED */}
        <div className="w-[360px] flex-shrink-0 border-l border-white/5 bg-[#121212] z-20 flex flex-col shadow-2xl">
          <StudioControls
            scene={activeScene}
            onUpdateParams={(params) => activeSceneId && updateSceneParams(activeSceneId, params)}
            onGenerate={() => activeSceneId && generateShot(activeSceneId)}
            isGenerating={isGenerating}
          />
        </div>

      </div>
    </main>
  );
}

