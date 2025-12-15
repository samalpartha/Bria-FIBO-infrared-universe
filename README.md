
# Infrared Universe: AI Director for Bria FIBO

**Infrared Universe** is a cinematic storyboard creator that transforms raw scripts into professional, structurally consistent visual assets using **Bria FIBO**. It acts as an **AI Director Agent**, automating the breakdown of scripts into shot lists and generating production-ready visuals with precise control.

## 🚀 How This Uses Bria FIBO (Hackathon Alignment)

This project leverages the full power of Bria's **FIBO (Foundation for Image Building & Origin)** ecosystem to solve real production continuity problems:

1.  **JSON-Native Scene Control (FIBO Protocol):**
    - Unlike standard text-to-image tools, every scene in Infrared Universe is backed by a structured **FIBO JSON payload**.
    - We expose this payload directly in the UI (via the `{ }` toggle), allowing users to inspect and edit camera angles, lighting, and composition parameters programmatically.

2.  **Hybrid Structure Lock (The "Continuity" Solution):**
    - We implement a unique **Hybrid V1/V2 Pipeline**:
        - **Stage 1 (Composition/Blocking):** Uses Bria 2.3 fast generation to establish the scene layout.
        - **Stage 2 (Refinement):** Uses Bria FIBO's structure reference capabilities content to "lock" the composition while refining details.
    - This allows filmmakers to keep the *same* shot blocking while changing time of day, lighting, or artistic style—critical for storyboarding.

3.  **Director Agent Workflow:**
    - The app functions as an agentic pipeline. You input a script, and the "Director Agent" analyzes it to automatically generate a JSON shot list with inferred camera angles (e.g., "Low Angle", "Wide Shot") mapped to FIBO parameters.

4.  **Professional Parameter Mapping:**
    - We map industry-standard film terms directly to Bria's API parameters (e.g., `camera_angle`, `lens_type`, `lighting_style`), proving that generative AI can fit into professional VFX pipelines.

## 🎥 Key Features

-   **Script-to-Storyboard**: Paste a screenplay -> Get a visual shot list.
-   **Precision Studio**: Fine-tune specific shots without losing the original composition.
-   **Production Export**: Download a JSON manifest of your entire project, ready for integration into game engines or VFX tools.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
-   **AI Foundation**: Bria AI API (FIBO)
-   **State Management**: React Hooks + Context
-   **Deployment**: Vercel

## 📦 Installation

1.  Clone the repo:
    ```bash
    git clone https://github.com/samalpartha/Bria-FIBO-infrared-universe.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    Create a `.env.local` file and add your Bria API Key:
    ```bash
    NEXT_PUBLIC_BRIA_API_KEY=your_key_here
    ```
4.  Run the dev server:
    ```bash
    npm run dev
    ```

## 🏆 Hackathon Categories

We are submitting for:
-   **Best JSON-Native or Agentic Workflow**: For our "Director Agent" pipeline and transparent JSON control.
-   **Best New User Experience**: For the "Cinematic Deck" interface that feels like a pro film tool, not a chatbot.
