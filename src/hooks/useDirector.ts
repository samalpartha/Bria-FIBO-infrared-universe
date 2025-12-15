import { useState, useCallback, useEffect, useMemo } from 'react';
import { Scene, FiboParameters } from '@/lib/types';
import { createBriaClient } from '@/lib/bria-client';

const DEFAULT_SCRIPT = "INT. NEO-TOKYO APARTMENT - NIGHT\n\nRain streaks down the window. KAI (30s) sits at a cluttered desk, illuminated by the glow of multiple monitors.";

// Removed MOCK_IMAGES - Now using Real Client

export function useDirector() {
    const [script, setScript] = useState(DEFAULT_SCRIPT);
    const [scenes, setScenes] = useState<Scene[]>([]);

    // Initialize Client (Memoized)
    const client = useMemo(() => {
        const key = process.env.NEXT_PUBLIC_BRIA_API_KEY || ''; // Will fallback to dev key in client if empty
        return createBriaClient(key);
    }, []);

    // Script Parsing Logic
    useEffect(() => {
        const parseScript = (text: string) => {
            const sceneRegex = /^(?:INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s.*$/gm;
            const matches = [...text.matchAll(sceneRegex)];

            if (matches.length === 0) {
                // Don't clear immediately to allow typing
                if (text.trim().length === 0) setScenes([]);
                return;
            }

            setScenes(prevScenes => {
                return matches.map((match, index) => {
                    const header = match[0];
                    const id = `scene-${index + 1}`;
                    const existing = prevScenes.find(s => s.id === id);

                    // Extract body
                    const start = match.index! + header.length;
                    const end = matches[index + 1] ? matches[index + 1].index! : text.length;
                    const body = text.slice(start, end).trim();

                    return {
                        id,
                        scriptText: header,
                        visualPrompt: existing?.visualPrompt || body || "A cinematic shot...",
                        status: existing?.status || 'pending',
                        imageUrl: existing?.imageUrl,
                        parameters: existing?.parameters || {
                            camera: { shotType: 'medium_shot' },
                            lighting: { type: 'cinematic' }
                        }
                    };
                });
            });
        };

        const timer = setTimeout(() => {
            parseScript(script);
        }, 800);

        return () => clearTimeout(timer);
    }, [script]);

    const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const activeScene = scenes.find(s => s.id === activeSceneId);
    const [history, setHistory] = useState<Scene[]>([]);

    // Actions
    const selectScene = useCallback((id: string) => {
        setActiveSceneId(id);
    }, []);

    const updateSceneParams = useCallback((id: string, newParams: Partial<FiboParameters>) => {
        setScenes(prev => prev.map(scene => {
            if (scene.id !== id) return scene;
            return {
                ...scene,
                parameters: {
                    ...scene.parameters,
                    ...newParams,
                    camera: { ...scene.parameters.camera, ...newParams.camera },
                    lighting: { ...scene.parameters.lighting, ...newParams.lighting },
                    style: { ...scene.parameters.style, ...newParams.style },
                }
            };
        }));
    }, []);

    const reorderScenes = useCallback((startIndex: number, endIndex: number) => {
        setScenes(prev => {
            const result = Array.from(prev);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        });
    }, []);

    const generateShot = useCallback(async (id: string) => {
        setIsGenerating(true);
        const scene = scenes.find(s => s.id === id);
        if (!scene) {
            setIsGenerating(false);
            return;
        }

        // 1. Set status
        setScenes(prev => prev.map(s => s.id === id ? { ...s, status: 'generating' } : s));

        try {
            // 2. Call Real API
            console.log("Generatiing Real Shot for:", scene.scriptText);
            const fullPrompt = `${scene.scriptText}. ${scene.visualPrompt}`; // Combine header and visuals

            // DECOUPLED WORKFLOW: Pass the pre-generated structured prompt if available
            const generationParams = {
                ...scene.parameters,
                structured_prompt: scene.structuredPrompt
            };

            const result = await client.generateImage(fullPrompt, generationParams);

            // 3. Update with Result
            setScenes(prev => {
                const updatedScenes = prev.map(s => {
                    if (s.id !== id) return s;

                    const completedScene = {
                        ...s,
                        status: 'completed' as const,
                        imageUrl: result.url
                    };

                    setHistory(h => [completedScene, ...h]);
                    return completedScene;
                });
                return updatedScenes;
            });

        } catch (error) {
            console.error("Generation Failed:", error);
            setScenes(prev => prev.map(s => s.id === id ? { ...s, status: 'failed' } : s));
        } finally {
            setIsGenerating(false);
        }
    }, [scenes, client]);

    const applyPreset = useCallback((presetName: string) => {
        if (!activeSceneId) return;

        let newParams: Partial<FiboParameters> = {};

        switch (presetName) {
            case 'Cinematic Drama':
                newParams = { lighting: { type: 'cinematic' }, camera: { shotType: 'close_up' } };
                break;
            case 'Studio Setup':
                newParams = { lighting: { type: 'studio' }, camera: { shotType: 'medium_shot' } };
                break;
            case 'Bright & Airy':
                newParams = { lighting: { type: 'natural' }, camera: { shotType: 'wide_shot' } };
                break;
            case 'Cyberpunk High':
                newParams = { lighting: { type: 'neon' }, camera: { shotType: 'low_angle' } };
                break;
            case 'Noir Detective':
                newParams = { lighting: { type: 'noir' }, camera: { shotType: 'dutch_angle' } };
                break;
            default:
                return;
        }

        updateSceneParams(activeSceneId, newParams);
    }, [activeSceneId, updateSceneParams]);

    const generateAll = useCallback(async () => {
        setIsGenerating(true);

        // 1. Set all to generating
        setScenes(prev => prev.map(s => ({ ...s, status: 'generating' })));

        // 2. Progressive Real Generation
        const totalScenes = scenes.length;
        for (let i = 0; i < totalScenes; i++) {
            const scene = scenes[i];
            if (!scene) continue;

            try {
                const fullPrompt = `${scene.scriptText}. ${scene.visualPrompt}`;
                const result = await client.generateImage(fullPrompt, scene.parameters);

                setScenes(prev => {
                    const newScenes = [...prev];
                    // Need to find by ID to be safe against reorders, but for now index is okay if locked
                    const sceneIdx = newScenes.findIndex(s => s.id === scene.id);
                    if (sceneIdx !== -1) {
                        newScenes[sceneIdx] = { ...newScenes[sceneIdx], status: 'completed', imageUrl: result.url };
                        setHistory(h => [{ ...newScenes[sceneIdx] }, ...h]);
                    }
                    return newScenes;
                });
            } catch (e) {
                console.error(`Failed to generate scene ${scene.id}`, e);
                setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, status: 'failed' } : s));
            }
        }

        setIsGenerating(false);
    }, [scenes, client]);

    const analyzeScript = useCallback(async () => {
        setIsGenerating(true);
        // Mark all as generating (or analyzing)
        setScenes(prev => prev.map(s => ({ ...s, status: 'generating' })));

        const totalScenes = scenes.length;
        for (let i = 0; i < totalScenes; i++) {
            const scene = scenes[i];
            try {
                console.log(`Analyzing Scene ${i + 1}: ${scene.scriptText}`);

                // DECOUPLED WORKFLOW: Generate Structured Prompt First
                const result = await client.generateStructuredPrompt(scene.visualPrompt);

                // Extract description for UI/Review
                const newPrompt = result.result?.structured_prompt
                    ? (typeof result.result.structured_prompt === 'string'
                        ? JSON.parse(result.result.structured_prompt)
                        : result.result.structured_prompt)
                    : {};

                const shortDescription = newPrompt.short_description || scene.visualPrompt;

                setScenes(prev => {
                    const newScenes = [...prev];
                    if (newScenes[i]) {
                        newScenes[i] = {
                            ...newScenes[i],
                            status: 'pending', // Ready to generate
                            visualPrompt: shortDescription, // Update with high-fidelity description
                            structuredPrompt: result.result?.structured_prompt as Record<string, unknown>, // Store for generation
                            parameters: {
                                ...newScenes[i].parameters,
                                // We could partially update params from the JSON if we wanted to parse deeper
                            }
                        };
                    }
                    return newScenes;
                });

            } catch (error) {
                console.error(`Analysis failed for scene ${i + 1}`, error);
                setScenes(prev => {
                    const ns = [...prev];
                    if (ns[i]) ns[i] = { ...ns[i], status: 'failed' };
                    return ns;
                });
            }
        }
        setIsGenerating(false);
    }, [scenes, client]);

    const updateSceneComposition = useCallback((id: string, newParams: Partial<FiboParameters>) => {
        setScenes(prev => prev.map(scene => {
            if (scene.id !== id || scene.lockComposition) return scene; // Respect structure lock
            return {
                ...scene,
                parameters: {
                    ...scene.parameters,
                    ...newParams,
                    camera: { ...scene.parameters.camera, ...newParams.camera },
                    // Only update composition related fields
                }
            };
        }));
    }, []);

    const updateSceneStyle = useCallback((id: string, newParams: Partial<FiboParameters>) => {
        setScenes(prev => prev.map(scene => {
            if (scene.id !== id) return scene;
            return {
                ...scene,
                parameters: {
                    ...scene.parameters,
                    ...newParams,
                    lighting: { ...scene.parameters.lighting, ...newParams.lighting },
                    style: { ...scene.parameters.style, ...newParams.style },
                    color: { ...scene.parameters.color, ...newParams.color },
                }
            };
        }));
    }, []);

    const toggleCompositionLock = useCallback((id: string) => {
        setScenes(prev => prev.map(s => {
            if (s.id !== id) return s;
            const newLockState = !s.lockComposition;
            // When locking, we freeze the current seed as the 'structure_seed'
            return {
                ...s,
                lockComposition: newLockState,
                structure_seed: newLockState ? (s.seed || s.parameters.seed) : undefined
            };
        }));
    }, []);

    const deleteScene = useCallback((id: string) => {
        setScenes(prev => prev.filter(s => s.id !== id));
        if (activeSceneId === id) setActiveSceneId(null);
    }, [activeSceneId]);

    const updateScene = useCallback((id: string, updates: Partial<Scene>) => {
        setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }, []);

    const createEmptyScene = useCallback(() => {
        setScenes(prev => {
            const id = `scene-${Date.now()}`;
            const newScene: Scene = {
                id,
                scriptText: "EXT. UNTITLED SCENE - DAY",
                visualPrompt: "A new scene description...",
                status: 'pending',
                parameters: {
                    camera: { shotType: 'medium_shot' },
                    lighting: { type: 'natural' },
                    seed: Math.floor(Math.random() * 1000000) // JSON-first thinking: explicit seed
                }
            };
            return [...prev, newScene];
        });
    }, []);

    const refineShot = useCallback(async (id: string, refinementPrompt: string) => {
        const scene = scenes.find(s => s.id === id);
        if (!scene) return;

        setIsGenerating(true);
        try {
            // Decoupled Refinement: Use structured_prompt + new prompt + seed lock
            const generationParams = {
                ...scene.parameters,
                structured_prompt: scene.structuredPrompt,
                seed: scene.lockComposition ? scene.structure_seed : scene.seed
            };

            const result = await client.generateImage(refinementPrompt, generationParams);

            setScenes(prev => prev.map(s => {
                if (s.id !== id) return s;
                return {
                    ...s,
                    status: 'completed',
                    imageUrl: result.url,
                    seed: result.seed
                };
            }));

        } catch (error) {
            console.error("Refinement failed:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [scenes, client]);

    return {
        script,
        setScript,
        scenes,
        activeScene,
        activeSceneId,
        selectScene,
        updateSceneParams, // Keep for backward compat if needed, or replace usage
        updateSceneComposition, // New
        updateSceneStyle,       // New
        toggleCompositionLock,  // New
        createEmptyScene,       // New
        refineShot,             // New
        generateShot,
        isGenerating,
        history,
        reorderScenes,
        applyPreset,
        analyzeScript,
        generateAll,
        deleteScene,    // New
        updateScene     // New
    };
}
