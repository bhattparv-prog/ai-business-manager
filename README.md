# ⚡ Personal AI Business Manager & Real-Time Automation Assistant

An independent, production-ready **Personal AI Business Manager** built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**. It features a modern **White & Orange luxury mobile aesthetic**, multi-tenant private workspaces, live Google Sheets streaming, grounded AI assistant, and Progressive Web App (PWA) mobile installation.

---
## 📱 How to Download / Install on Mobile Phone (PWA)

Once deployed to Vercel (or any HTTPS domain):

### On iPhone (iOS Safari):
1. Open your live deployment URL in Safari (e.g. `https://your-app.vercel.app`).
2. Tap the **Share** button at the bottom of the screen (the square with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"**. The app icon (`/logo.png`) will appear on your iPhone home screen as a standalone native app!

### On Android (Chrome):
1. Open your live deployment URL in Chrome.
2. Tap the **three-dots menu** (⋮) in the top-right corner or look for the **"Install App"** prompt at the bottom.
3. Tap **"Install"** / **"Add to Home screen"**.
4. The app installs directly to your app drawer and home screen.

---

## 🚀 One-Click Vercel Deployment Guide

### Step 1: Push to GitHub (Already Automated)
Your repository is pushed to: `https://github.com/bhattparv-prog/ai-business-manager`

### Step 2: Import into Vercel
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account (`bhattparv-prog`).
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Select the `ai-business-manager` repository and click **"Import"**.

### Step 3: Add Free Cloud Database (PostgreSQL)
Because Vercel serverless functions have an ephemeral filesystem, persistent production data requires a cloud database (which is 100% free):

**Option A — Vercel Postgres (Easiest, 1-Click):**
1. In your Vercel project dashboard, click on the **"Storage"** tab.
2. Click **"Create Database"** $\rightarrow$ select **"Postgres"** (Neon-backed free tier).
3. Click **"Connect to Project"**. Vercel will automatically set `DATABASE_URL`!

**Option B — Neon.tech / Supabase (100% Free):**
1. Create a free database at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com).
2. Copy your connection string: `postgresql://user:password@host/dbname?sslmode=require`.
3. In Vercel Project Settings $\rightarrow$ **Environment Variables**, add:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: Any random 32-character string (e.g. `super-secret-business-manager-token-key-2026`).

### Step 4: Deploy!
- Click **Deploy**.
- The automated `vercel-build` script will:
  1. Detect PostgreSQL automatically.
  2. Run `prisma db push` to generate all tables.
  3. Compile Next.js 15 and give you your live URL!

---

## 💻 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup SQLite database & seed
npm run prisma:push

# 3. Start local development server on port 3005
npm run dev

# 4. Open in browser
http://localhost:3005
```

---

## 🔑 Key Features
- **Strict Multi-Tenant Isolation**: Every user account has an isolated, private workspace.
- **Google Sheet Live Stream**: Instant CSV & formula ingestion with zero data duplication.
- **Live Auto-Syncing**: Silent 10-second background polling updates metrics without page reloads.
- **Grounded AI Assistant**: Real SQLite/Postgres database queries with ₹0 token waste.
- **PWA Ready**: Offline service worker caching, standalone manifest, and home screen icon.
