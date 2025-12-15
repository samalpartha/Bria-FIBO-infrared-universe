"use client";

import { useState, useMemo } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Plus, User, Camera, Loader2 } from "lucide-react";
import { createBriaClient } from '@/lib/bria-client';
import { useToast } from "@/components/ui/ToastContext";

export default function CastingPage() {
    const { addToast } = useToast();
    const [isTraining, setIsTraining] = useState(false);

    // In a real app, we would fetch these from Bria API
    // For Hackathon Demo, we can maintain local state or try to fetch
    const [actors, setActors] = useState([
        { id: '1', name: 'Kai (Protagonist)', status: 'ready', thumbnail: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=500&auto=format&fit=crop&q=60' },
        { id: '2', name: 'Elara (Antagonist)', status: 'ready', thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60' }
    ]);

    const client = useMemo(() => {
        const key = process.env.NEXT_PUBLIC_BRIA_API_KEY || '';
        return createBriaClient(key);
    }, []);

    const handleCreateActor = async () => {
        setIsTraining(true);
        try {
            // Demo Flow: Create Project -> Dataset -> Train
            // 1. Create Project
            const projectName = `Actor_${Date.now()}`;
            // const project = await client.createProject(projectName, "Casting Director Actor", "defined_character");
            // console.log("Project Created", project);

            // Mocking the delay for demo effect
            await new Promise(r => setTimeout(r, 2000));

            setActors(prev => [...prev, {
                id: Date.now().toString(),
                name: "New Talent (Training...)",
                status: 'training',
                thumbnail: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500'
            }]);

            addToast("Training started for New Talent!", "success");

        } catch (error) {
            console.error(error);
            addToast("Failed to start training", "error");
        } finally {
            setIsTraining(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col bg-[var(--director-bg)] text-[var(--director-text)] font-sans">
            <Navbar />

            <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Casting Director</h1>
                        <p className="text-[#777] mt-2">Manage your diverse cast of Tailored Models. &quot;Defined Character&quot; consistency powered by Bria V2.</p>
                    </div>
                    <button
                        onClick={handleCreateActor}
                        disabled={isTraining}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--cinema-gold)] text-black font-bold uppercase tracking-widest rounded hover:scale-105 transition-transform glow-gold disabled:opacity-50"
                    >
                        {isTraining ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Scout New Talent
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {actors.map(actor => (
                        <div key={actor.id} className="group relative bg-[var(--director-surface-1)] rounded-xl overflow-hidden border border-white/5 hover:border-[var(--cinema-gold)]/50 transition-colors">
                            <div className="aspect-[3/4] overflow-hidden relative">
                                <img src={actor.thumbnail} alt={actor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />

                                {actor.status === 'training' && (
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm">
                                        <Loader2 className="w-8 h-8 text-[var(--cinema-gold)] animate-spin mb-2" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--cinema-gold)]">Training Model...</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 relative">
                                <h3 className="font-bold text-white text-lg">{actor.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`w-2 h-2 rounded-full ${actor.status === 'ready' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                                    <span className="text-xs text-[#777] uppercase tracking-wider">{actor.status}</span>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs font-bold uppercase text-white transition-colors">
                                        Audition
                                    </button>
                                    <button className="flex-1 py-1.5 border border-white/10 hover:bg-white/5 rounded text-xs font-bold uppercase text-[#777] hover:text-white transition-colors">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Placeholder for Empty State if needed */}
                </div>
            </div>
        </main>
    );
}
