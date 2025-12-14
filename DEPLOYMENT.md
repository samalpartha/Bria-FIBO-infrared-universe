# Deployment Guide

Your application uses **Next.js Server API Routes** (`src/app/api/generate`), which requires a hosting provider that supports Node.js or Serverless Functions.

**❌ GitHub Pages** cannot be used because it only supports static files, and your API routes would break.

## Option 1: Vercel (Recommended)
Vercel is the creator of Next.js and offers the seamless deployment for free.

1.  **Push to GitHub**:
    Ensure your latest code is pushed to your GitHub repository (this is already done).

2.  **Create Project on Vercel**:
    *   Go to [https://vercel.com/new](https://vercel.com/new).
    *   **Import** your GitHub repository found in the list.

3.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `.` (default).
    *   **Build Command**: `next build` (default).

4.  **Environment Variables (Crucial)**:
    Expand the "Environment Variables" section and add:
    *   **Name**: `NEXT_PUBLIC_BRIA_API_KEY`
    *   **Value**: (Your Bria API Key)
    *   *(Optional)* If you have other keys (like HuggingFace tokens), add them here as they appear in your code.

5.  **Deploy**:
    Click **Deploy**. Vercel will build your app and verify the API routes are working.

## Option 2: Netlify (Free Tier)
Netlify also supports Next.js with Serverless functions automatically.

1.  **Create Site on Netlify**:
    *   Log in to [Netlify](https://app.netlify.com/).
    *   Click **"Add new site"** -> **"Import an existing project"**.
    *   Connect **GitHub** and select your repository.

2.  **Build Settings**:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `.next` (Netlify usually auto-detects this with the Next.js Runtime plugin).

3.  **Environment Variables**:
    *   Click **"Show advanced"** or go to "Site settings" > "Environment variables".
    *   Add `NEXT_PUBLIC_BRIA_API_KEY` with your key.

4.  **Deploy**:
    Click **Deploy site**.

## Option 3: Render (Web Service)
Render is great but the free tier for Web Services spins down after inactivity (slow first request). Use this if Vercel/Netlify aren't options.

1.  Create a **Web Service**.
2.  Connect GitHub repo.
3.  **Build Command**: `npm run build`.
4.  **Start Command**: `npm start`.
5.  Add Environment Variables in the "Environment" tab.
