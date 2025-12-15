export interface FiboPrompt {
    prompt: string; // The natural language prompt
    parameters: FiboParameters;
    aspect_ratio?: string;
    num_results?: number;
    sync?: boolean;
}

// Top level parameters for Bria FIBO
export interface FiboParameters {
    // Top level fields often found in FIBO implementations
    negative_prompt?: string;
    seed?: number;
    steps?: number;
    guidance_scale?: number;

    // The core visual control object often passed as 'structured_prompt' or flat fields depending on exact endpoint version
    // We will model it as flat fields here but group them logically for the UI, 
    // and rely on the client to structure them correctly for the API payload.
    camera?: CameraSettings;
    lighting?: LightingSettings;
    color?: ColorSettings;
    composition?: CompositionSettings;
    subject?: SubjectSettings;
    style?: StyleSettings;

    structured_prompt?: Record<string, unknown>; // Decoupled workflow JSON
    lockComposition?: boolean; // Hackathon Polish: UI flag
    structure_seed?: number; // Hackathon Polish: V2 seed lock
    // Hybrid V1/V2 Logic
    structure_image_url?: string;
    structure_ref_influence?: number;
    fastMode?: boolean;
}

export interface CameraSettings {
    shotType?: 'eye_level' | 'low_angle' | 'high_angle' | 'bird_eye_view' | 'worm_eye_view' | 'dutch_angle' | 'wide_shot' | 'medium_shot' | 'close_up' | 'long_shot' | 'extreme_long_shot' | 'macro';
    angle?: 'eye_level' | 'low_angle' | 'high_angle' | 'bird_eye_view' | 'worm_eye_view' | 'dutch_angle';
    fov?: number;
    distance?: 'close_up' | 'medium_shot' | 'long_shot' | 'extreme_long_shot' | 'macro';
    focal_length?: number; // e.g. 35, 50, 85
    aperture?: string; // e.g. "f/1.8"
    shutter_speed?: string;
    iso?: number;
}

export interface LightingSettings {
    style?: 'natural' | 'studio' | 'cinematic' | 'noir' | 'neon' | 'ambient' | 'volumetric' | 'dramatic';
    type?: 'natural' | 'studio' | 'cinematic' | 'noir' | 'neon' | 'ambient' | 'volumetric';
    direction?: 'front' | 'side' | 'back' | 'top' | 'rim' | 'silhouette';
    intensity?: 'dim' | 'soft' | 'hard' | 'bright';
    color_temperature?: 'warm' | 'cool' | 'neutral';
}

export interface ColorSettings {
    palette?: string[]; // Hex codes or names
    grading?: 'cinematic' | 'vintage' | 'black_and_white' | 'sepia' | 'hdr' | 'pastel' | 'muted' | 'vibrant' | 'neutral';
    saturation?: 'low' | 'medium' | 'high' | 'vibrant';
    contrast?: 'low' | 'medium' | 'high';
}

export interface CompositionSettings {
    framing?: 'rule_of_thirds' | 'center' | 'golden_ratio' | 'lead_room';
    depth_of_field?: 'shallow' | 'deep';
    aspect_ratio?: '16:9' | '9:16' | '1:1' | '4:3' | '2.35:1'; // Often at top level but good to track here for Director intent
}

export interface SubjectSettings {
    description?: string;
    pose?: string;
    expression?: string;
    clothing?: string;
    count?: number;
}

export interface StyleSettings {
    medium?: 'photography' | 'digital_art' | 'oil_painting' | 'cinematic_render' | '3d_render' | 'anime';
    atmosphere?: string;
}

export interface GeneratedImage {
    id: string;
    url: string;
    prompt: string;
    imageUrl?: string;
    structuredPrompt?: Record<string, unknown>; // Decoupled Bria V2 Prompt
    seed?: number;
    parameters: FiboParameters;
}

export interface Scene {
    id: string;
    scriptText: string;
    visualPrompt: string;
    parameters: FiboParameters;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    imageUrl?: string;
    backgroundRemovedUrl?: string;
    structuredPrompt?: Record<string, unknown>; // The full Bria V2 structured prompt JSON (Decoupled Flow)
    seed?: number;
    lockComposition?: boolean;
    structure_seed?: number; // seed locked for composition
    error?: string;
}

// --- Tailored Generation Types ---

export interface TailoredProject {
    id: string;
    name: string;
    description?: string;
    ip_type: 'defined_character' | 'stylized_scene' | 'multi_object_set' | 'object_variants' | 'icons' | 'character_variants';
    ip_medium: 'photography' | 'illustration';
    created_at?: string;
}

export interface TailoredDataset {
    id: string;
    name: string;
    project_id: string;
    status: 'created' | 'completed';
    num_images: number;
    thumbnail_url?: string;
    created_at?: string;
}

export interface TailoredModel {
    id: string;
    name: string;
    description?: string;
    project_id: string;
    dataset_id: string;
    status: 'created' | 'queued' | 'in_progress' | 'completed' | 'failed' | 'stopping' | 'stopped';
    training_version: 'light' | 'max';
    training_mode: 'fast' | 'expert'; // 'fast' = fully automated usually
    created_at?: string;
}

export interface TailoredImageResult {
    id: string;
    url: string;
    model_id: string;
    prompt: string;
}
