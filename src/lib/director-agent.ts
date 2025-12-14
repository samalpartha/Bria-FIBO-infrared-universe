import { Scene, FiboParameters } from './types';

// This agent acts as the "Director", breaking down a script into shots
// and deciding on the visual parameters for each shot.

export class DirectorAgent {

    async analyzeScript(scriptText: string): Promise<Scene[]> {
        // In a real agentic workflow, this would call an LLM (OpenAI/Gemini) 
        // to separate the script into beats and infer parameters.

        // For this prototype, we'll use a sophisticated heuristic splitter
        // and random/keyword-matched parameter assignment to demonstrate the detailed control.

        const lines = scriptText.split(/\n+/).filter(l => l.trim().length > 0);
        const scenes: Scene[] = [];

        lines.forEach((line, index) => {
            // Simple heuristic: Treat every non-short line as a shot for now.
            // In reality, we'd group dialogue with action.
            if (line.length < 5) return;

            const params = this.inferParameters(line);

            scenes.push({
                id: `scene-${index}-${Date.now()}`,
                scriptText: line,
                visualPrompt: `Cinematic shot of: ${line}`,
                parameters: params,
                status: 'pending'
            });
        });

        return scenes;
    }

    public inferParameters(text: string): FiboParameters {
        const lower = text.toLowerCase();
        const params: FiboParameters = {
            camera: {},
            lighting: {},
            color: {},
            composition: {},
            style: { medium: 'cinematic_render' },
            seed: Math.floor(Math.random() * 1000000), // Random seed by default
            steps: 30, // Default quality
            guidance_scale: 5
        };

        // --- ASPECT RATIO & COMPOSITION ---
        if (lower.includes('wide') || lower.includes('landscape') || lower.includes('cinema')) {
            params.composition = { ...params.composition, aspect_ratio: '2.35:1' };
        } else if (lower.includes('vertical') || lower.includes('phone') || lower.includes('portrait')) {
            params.composition = { ...params.composition, aspect_ratio: '9:16' };
        } else if (lower.includes('square') || lower.includes('instagram')) {
            params.composition = { ...params.composition, aspect_ratio: '1:1' };
        } else {
            params.composition = { ...params.composition, aspect_ratio: '16:9' }; // Default
        }

        // --- MOOD / LIGHTING ---
        if (lower.includes('night') || lower.includes('dark') || lower.includes('shadow') || lower.includes('dim')) {
            params.lighting = { type: 'noir', direction: 'rim', intensity: 'dim' };
            params.color = { grading: 'cinematic', saturation: 'low', contrast: 'high' };
        } else if (lower.includes('sun') || lower.includes('day') || lower.includes('bright') || lower.includes('morning')) {
            params.lighting = { type: 'natural', direction: 'side', intensity: 'bright', color_temperature: 'warm' };
            params.color = { grading: 'vibrant', saturation: 'high' };
        } else if (lower.includes('neon') || lower.includes('cyberpunk') || lower.includes('club')) {
            params.lighting = { type: 'neon', direction: 'back', intensity: 'hard' };
            params.color = { grading: 'cinematic', saturation: 'vibrant', contrast: 'high' };
        } else if (lower.includes('studio') || lower.includes('fashion') || lower.includes('clean')) {
            params.lighting = { type: 'studio', direction: 'front', intensity: 'soft' };
            params.color = { grading: 'neutral', saturation: 'medium' };
        } else {
            params.lighting = { type: 'cinematic', intensity: 'soft' };
        }

        // --- CAMERA ANGLES & LENS ---
        if (lower.includes('look up') || lower.includes('tall') || lower.includes('sky') || lower.includes('hero')) {
            params.camera = { ...params.camera, angle: 'low_angle', distance: 'medium_shot' };
        } else if (lower.includes('look down') || lower.includes('floor') || lower.includes('overhead')) {
            params.camera = { ...params.camera, angle: 'high_angle' };
        } else if (lower.includes('bird') && lower.includes('eye')) {
            params.camera = { ...params.camera, angle: 'bird_eye_view', distance: 'extreme_long_shot' };
        } else if (lower.includes('close') || lower.includes('face') || lower.includes('detail')) {
            params.camera = { ...params.camera, distance: 'close_up', focal_length: 85, aperture: 'f/1.8' };
            params.composition = { ...params.composition, depth_of_field: 'shallow' };
        } else if (lower.includes('wide') || lower.includes('establish') || lower.includes('city')) {
            params.camera = { ...params.camera, distance: 'extreme_long_shot', focal_length: 24, aperture: 'f/8' };
            params.composition = { ...params.composition, depth_of_field: 'deep' };
        } else {
            params.camera = { angle: 'eye_level', distance: 'medium_shot', focal_length: 50 };
        }

        // --- STYLE ---
        if (lower.includes('anime') || lower.includes('manga')) {
            params.style = { medium: 'anime' };
        } else if (lower.includes('painting') || lower.includes('oil')) {
            params.style = { medium: 'oil_painting' };
        } else if (lower.includes('3d') || lower.includes('render') || lower.includes('cg')) {
            params.style = { medium: '3d_render' };
        } else if (lower.includes('photo') || lower.includes('real')) {
            params.style = { medium: 'photography' };
        }

        return params;
    }

    // Method to update a scene's parameters (manual override from UI)
    updateSceneParams(scene: Scene, newParams: Partial<FiboParameters>): Scene {
        return {
            ...scene,
            parameters: {
                ...scene.parameters,
                ...newParams
            }
        };
    }
}

export const director = new DirectorAgent();
