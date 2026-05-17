<p align="center">
  <img src="public/android-chrome-512x512.png" alt="Fashcon Logo" width="120" />
</p>

<h1 align="center">✦ Fashcon V2</h1>

<p align="center">
  <strong>Premium Pinterest-Inspired E-Commerce & Affiliate Platform</strong><br/>
  <em>Designer Fashion · Beauty · Home Décor</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/TailwindCSS-4_beta-06B6D4?logo=tailwindcss" alt="Tailwind" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Storefront Features](#-storefront-features)
- [Admin Dashboard Features](#-admin-dashboard-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Security](#-security)
- [License](#-license)

---

## 🌟 Overview

**Fashcon** is a full-stack, production-grade fashion e-commerce affiliate platform built with a Pinterest-inspired masonry layout. It features a luxury storefront for end users and a powerful glassmorphic admin dashboard for content & product management.

The platform is designed as a **multi-app monorepo** with:

| App | Port | Description |
|-----|------|-------------|
| **Storefront** | `:3000` | Public-facing fashion e-commerce site |
| **Admin Panel** | `:3001` | Private dashboard for managing the entire platform |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Fashcon V2                         │
├──────────────────────┬──────────────────────────────────┤
│   Storefront (:3000) │   Admin Dashboard (:3001)        │
│   Next.js 15 App     │   Next.js 15 App                 │
│   SSR + ISR           │   Client-Heavy SPA               │
├──────────────────────┴──────────────────────────────────┤
│                  Shared Data Layer                       │
│           MongoDB (Mongoose) + Cloudinary                │
├─────────────────────────────────────────────────────────┤
│              Google Gemini AI Integration                │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15** — App Router, Server Actions, Standalone Output
- **React 19** — Latest concurrent features
- **TypeScript 5.8** — Full type safety

### Styling & UI
- **Tailwind CSS 4 (beta)** — Utility-first styling
- **Shadcn/UI** — Accessible component primitives
- **Framer Motion / Motion** — Spring-based animations & page transitions
- **Lucide React** — Premium icon library
- **Glassmorphism** — Frosted-glass design language across admin UI

### Data & Backend
- **MongoDB** via **Mongoose 9** — Document database with rich schemas
- **Cloudinary** — Image/video upload, transformation & CDN delivery
- **Server Actions** — Type-safe API layer without REST boilerplate

### Rich Content
- **Lexical Editor** — Block-based rich text editing (Admin)
- **Tiptap Editor** — WYSIWYG content authoring with extensions
- **Recharts** — Data visualization (analytics dashboard)

### AI & Intelligence
- **Google Gemini AI** (`@google/genai`) — AI-powered content generation & competitor intelligence

### Utilities
- **Zod** — Runtime schema validation
- **React Hook Form** — Performant form management
- **date-fns** — Date formatting
- **nanoid** — Unique ID generation
- **sharp** — Server-side image processing
- **slugify** — URL-safe slug generation

---

## 🛍️ Storefront Features

| Feature | Description |
|---------|-------------|
| **Pinterest Masonry Grid** | Responsive card layout with hover animations |
| **Dynamic Categories** | Server-rendered category pages with custom hero scenes |
| **Product Details** | Full product pages with gallery, affiliate links & related items |
| **Blog System** | Editorial blog with rich content & category tagging |
| **Smart Search** | Autocomplete search with AI-powered suggestions |
| **Dark/Light Mode** | System-aware theme toggle with smooth transitions |
| **SEO Optimized** | Sitemap, robots.txt, Open Graph, structured metadata |
| **Responsive Design** | Mobile-first layout with glassmorphic navbar |
| **Newsletter** | Email capture with premium UI |
| **Legal Pages** | Privacy Policy, Terms of Use, Disclaimer, Affiliate Disclosure |

---

## ⚙️ Admin Dashboard Features

| Module | Description |
|--------|-------------|
| **Home / Analytics** | KPI stats cards, radar charts, donut charts with animated transitions |
| **Product Management** | Full CRUD with image studio pro, cropper modal, multi-image upload |
| **Category Editor** | Hero scene designer with gradient controls & alignment options |
| **Blog Editor** | Rich text editor (Tiptap + Lexical) with media embedding |
| **Blog Panel** | Direct homepage content control |
| **Media Manager** | Studio Pro — drag-and-drop upload, folder support, video transcoding |
| **Pinterest Engine** | Masonry layout manager for curated content |
| **Affiliate Module** | Link management & monetization tracking |
| **Competitor Intelligence** | AI-powered market analysis |
| **Site Configuration** | System settings, metadata management |
| **User Management** | RBAC with admin/super_admin roles |
| **Audit Logs** | Administrative action tracking |
| **Particle Web Background** | Animated canvas background with theme-aware colors |

---

## 📁 Project Structure

```
Fashcon V2/
├── public/                      # Static assets, favicons, manifest
│   └── images/                  # Public images
├── src/                         # ── STOREFRONT ──
│   ├── app/
│   │   ├── page.tsx             # Homepage
│   │   ├── layout.tsx           # Root layout (Navbar + Footer)
│   │   ├── globals.css          # Global styles
│   │   ├── actions/             # Server actions (storefront, site-content)
│   │   ├── blog/                # Blog pages
│   │   ├── category/            # Category landing pages
│   │   ├── categories/          # All categories view
│   │   ├── products/            # Product detail pages
│   │   ├── search/              # Search results
│   │   ├── about/               # About page
│   │   ├── contact/             # Contact page
│   │   ├── affiliate/           # Affiliate pages
│   │   ├── privacy-policy/      # Legal: privacy
│   │   ├── terms-of-use/        # Legal: terms
│   │   ├── disclaimer/          # Legal: disclaimer
│   │   ├── affiliate-disclosure/# Legal: affiliate
│   │   ├── sitemap.ts           # Dynamic sitemap
│   │   └── robots.ts            # Robots.txt config
│   ├── components/              # Storefront UI components
│   │   ├── Navbar.tsx           # Glassmorphic scroll-aware navbar
│   │   ├── Hero.tsx             # Animated hero section
│   │   ├── PinCard.tsx          # Pinterest-style product card
│   │   ├── CategorySlider.tsx   # Horizontal category carousel
│   │   ├── Footer.tsx           # Site footer
│   │   └── ...                  # 15+ more components
│   ├── lib/
│   │   ├── mongodb.ts           # Database connection
│   │   ├── models/              # Mongoose schemas (Product, Blog, Category, SiteContent)
│   │   └── public-content.ts    # Public data fetchers
│   ├── middleware.ts            # Next.js middleware
│   ├── types.ts                 # Shared TypeScript types
│   └── data.ts                  # Static data & constants
│
├── subdomain/
│   └── admin/                   # ── ADMIN DASHBOARD ──
│       ├── src/
│       │   ├── app/
│       │   │   ├── (dashboard)/         # Dashboard layout group
│       │   │   │   ├── home/            # Dashboard home
│       │   │   │   ├── products/        # Product management
│       │   │   │   ├── categories/      # Category management
│       │   │   │   ├── blogs/           # Blog management
│       │   │   │   ├── blog-panel/      # Blog panel (homepage)
│       │   │   │   ├── media/           # Media manager
│       │   │   │   ├── analytics/       # Analytics dashboard
│       │   │   │   ├── intelligence/    # Competitor intelligence
│       │   │   │   ├── pinterest/       # Pinterest engine
│       │   │   │   ├── affiliate/       # Affiliate module
│       │   │   │   ├── store/           # Store settings
│       │   │   │   ├── configuration/   # System config
│       │   │   │   ├── users/           # User management
│       │   │   │   └── logs/            # Audit logs
│       │   │   ├── api/                 # REST API routes
│       │   │   │   ├── products/
│       │   │   │   ├── blogs/
│       │   │   │   ├── media/
│       │   │   │   ├── pinterest/
│       │   │   │   └── site-content/
│       │   │   └── login/               # Auth login page
│       │   └── components/
│       │       └── admin/               # Admin-specific components
│       │           ├── Sidebar.tsx       # Navigation sidebar
│       │           ├── Topbar.tsx        # Top navigation bar
│       │           ├── ProductForm.tsx   # Product CRUD form
│       │           ├── CropperModal.tsx  # Image Studio Pro
│       │           ├── MediaPickerModal.tsx
│       │           ├── StatsCard.tsx     # Analytics cards
│       │           ├── CompetitorIntelligence.tsx
│       │           └── ...              # 10+ more components
│       └── package.json
│
├── package.json                 # Root storefront dependencies
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript config
├── components.json              # Shadcn/UI config
├── security_spec.md             # Security specification & red team tests
└── metadata.json                # Project metadata
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** instance (local or Atlas)
- **Cloudinary** account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/theashupandit/Fashcon.git
cd Fashcon

# 2. Install storefront dependencies
npm install

# 3. Install admin dashboard dependencies
cd subdomain/admin
npm install
cd ../..

# 4. Set up environment variables (see below)
cp .env.example .env
```

### Running Locally

```bash
# Terminal 1 — Storefront (port 3000)
npm run dev

# Terminal 2 — Admin Dashboard (port 3001)
cd subdomain/admin
npm run dev
```

Open your browser:
- 🛍️ Storefront → [http://localhost:3000](http://localhost:3000)
- ⚙️ Admin Panel → [http://localhost:3001](http://localhost:3001)

---

## 🔐 Environment Variables

### Storefront (`.env`)

```env
MONGODB_URI=              # MongoDB connection string
CLOUDINARY_CLOUD_NAME=    # Cloudinary cloud name
CLOUDINARY_API_KEY=       # Cloudinary API key
CLOUDINARY_API_SECRET=    # Cloudinary API secret
GEMINI_API_KEY=           # Google Gemini AI key
```

### Admin Dashboard (`subdomain/admin/.env`)

```env
MONGODB_URI=              # MongoDB connection string (same database)
CLOUDINARY_CLOUD_NAME=    # Cloudinary cloud name
CLOUDINARY_API_KEY=       # Cloudinary API key
CLOUDINARY_API_SECRET=    # Cloudinary API secret
GEMINI_API_KEY=           # Google Gemini AI key
```

---

## 📜 Scripts

### Storefront

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Start dev server on port 3000 |
| Build | `npm run build` | Production build (standalone) |
| Start | `npm run start` | Start production server |
| Lint | `npm run lint` | Run ESLint |

### Admin Dashboard

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Start dev server on port 3001 |
| Build | `npm run build` | Production build |
| Start | `npm run start` | Start production server |
| Lint | `npm run lint` | Run ESLint |

---

## 🔒 Security

Fashcon implements a multi-layered security model:

- **RBAC** — Role-based access control (`admin` / `super_admin`)
- **Soft Delete** — Admins soft-delete; only super_admins can hard-delete
- **Immutable Fields** — `createdAt` and `authorId` cannot be modified post-creation
- **Audit Trail** — All administrative writes are logged
- **PII Protection** — User email and role data is strictly protected
- **Input Validation** — Zod schemas + Mongoose validators for all mutations

> See [`security_spec.md`](security_spec.md) for the full specification including 12 red-team test cases.

---

## 📊 Data Models

| Model | Description |
|-------|-------------|
| **Product** | Fashion items with multi-image galleries, pricing, affiliate links, categories |
| **Category** | Hierarchical categories with custom hero images & editorial metadata |
| **Blog** | Rich content posts with cover images, tags, SEO metadata |
| **SiteContent** | Dynamic homepage content, hero sections, featured collections |

---

## 🎨 Design Philosophy

Fashcon follows a **luxury editorial** design language:

- **Glassmorphism** — Frosted glass panels with backdrop blur throughout the admin UI
- **Micro-animations** — Spring-based transitions via Framer Motion for every interaction
- **Dark/Light Modes** — Full theme support with system preference detection
- **Pinterest Grid** — Masonry layout for visual-first product discovery
- **Typography** — Inter (sans-serif) + Playfair Display (serif) for editorial elegance
- **Particle Web** — Animated canvas background in the admin dashboard

---

<p align="center">
  Built with ❤️ by <strong>Ashutosh Pandit</strong>
</p>
