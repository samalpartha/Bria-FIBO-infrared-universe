# Infrared Universe: Bria FIBO Studio
**Professional Storyboard & Visualization Agent**

> [!IMPORTANT]
> This application demonstrates a **Hybrid Pipeline** combining **FIBO V2** (for high-fidelity JSON control) and **Bria V1** (for structural reference locking). It is designed to act as an "AI Director" for film and game pre-production.

## 🌟 Key Innovations

### 1. The "AI Director" Agent (Best JSON-Native Workflow)
Instead of forcing users to tweak 50 sliders, we use an LLM-based "Director Agent" that reads a natural language script (e.g., "INT. NOIR CITY - NIGHT") and **auto-constructs valid FIBO JSON**.
- **Input**: Raw specific script text.
- **Process**: Splits script into scenes -> Infers Camera/Lighting/Color -> Generates strict JSON.
- **Output**: A fully populated storyboard ready for generation.

### 2. Hybrid Structure Lock (Best Controllability)
We solved the "consistency problem" by creating a bridge between Bria V1 and FIBO V2.
- **Problem**: Generating consistent shots across a scene is hard.
- **Solution**: 
    1. Generate a perfect "Key Shot" using FIBO V2 (with HDR/16-bit color control).
    2. **LOCK** that structure.
    3. The app switches to the **Bria V1 `/reimagine` endpoint**, passing the Key Shot as a `structure_image_url`.
    4. Subsequent shots maintain the exact composition while changing lighting, weather, or details.

### 3. Professional Color Grading (Best Overall)
Leveraging FIBO's native understanding of color space:
- **HDR**: High Dynamic Range toggles for photorealism.
- **Palette Control**: Users can enforce specific color schemes (e.g., `#ff0099, #00d4ff`) to match brand guidelines or artistic vision.

---

## 🚀 How It Works

### Step 1: Input Script
Paste a screenplay snippet into the "Source Script" panel.
```text
INT. SPACESHIP - DAY
The commander looks out the viewport.
EXT. SPACE - CONTINUOUS
A massive nebula swirls with purple and gold energy.
```

### Step 2: AI Analysis
Click **"Initialize Breakdown"**. 
The **AI Director** parses the text, creates individual Scene Cards, and pre-fills the parameters (Shot Type, Angle, Lighting) based on cinematic theory.

### Step 3: Refine & Generate
- **Tweak**: Use the Control Panel to adjust specific parameters (e.g., change "Natural" lighting to "Neon").
- **Generate**: Hits the Bria FIBO API.
- **Bg Removal**: One-click background removal for compositing.

### Step 4: The "Structure Lock" (Advanced)
1. Select a scene you love.
2. Click the **Lock Icon** on the card.
3. Select another scene.
4. Generate. The system consciously uses the *structure* of the first scene to guide the generation of the second, ensuring continuity.

---

## 🛠️ Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + Framer Motion (Glassmorphism UI)
- **AI Integration**: 
    - `BriaClient`: Custom TypeScript wrapper for Bria V2 & V1 APIs.
    - `DirectorAgent`: Logic layer for script-to-JSON conversion.

## 🏆 Hackathon Categories Optimization
- **Best Overall**: Polished, production-ready UI with deep features.
- **Best Controllability**: "Structure Lock" + "Color Grading" offers unmatched control.
- **Best Agentic Workflow**: The "Director" automates the tedious part of prompt engineering.
