# ScriptForge 🎬

> **Collaborative Story & Screenplay Writing Platform with 3D Previsualization Studio**

ScriptForge is a commercial SaaS-grade collaborative creative writing and previsualization platform for writers, screenwriters, editors, directors, and producers.

---

## 🌟 Core Feature Matrix

| Feature Area | Capabilities |
| :--- | :--- |
| **Real-Time Collaboration** | Multi-user editing, live colored cursors, presence avatars, room-based WebSocket synchronization. |
| **Structured Screenplay Editor** | Industry standard Courier 12pt format, `Tab` cycling shortcuts (`Scene Heading` → `Action` → `Character` → `Dialogue` → `Parenthetical`), live stats & estimated page count. |
| **Version History & Safe Restore** | Snapshot checkpoints, visual side-by-side diff comparison, non-destructive Safe Restore (creates a new version without losing history). |
| **Story Branching System** | Alternate storyline branches, visual branch tree, branch comparison, and merging back into main. |
| **Inline Review & Track Changes** | Selected text comments with replies, editorial Track Changes suggestions with visual diffs and **Accept/Reject** buttons. |
| **Role-Based Access Control (RBAC)** | `OWNER`, `WRITER`, `EDITOR`, and `VIEWER` roles enforced with server-side authorization middleware. |
| **Groq AI Writing Studio** | Idea → Concept → 3-Act Structure → Characters → Screenplay. Scene continuation, dialogue doctoring, rewrite modes, brainstorm, and continuity scanning. |
| **3D Camera Previs & Blocking** | Deterministic 2.5D top-down stage floor plan, draggable actor & camera frustums, real-time perspective camera simulator with lens presets (`18mm` to `135mm`), FOV, and height controls. |
| **Visual Storyboard Cards** | Cinematic shot lists with structured prompt inspection and frame rendering. |
| **Multi-Format Exports** | Screenplay PDF (WGA Courier 12pt), Final Draft FDX XML, Microsoft Word DOCX, Fountain format, and Production Shot List PDFs. |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion, Radix UI, Zustand, TanStack Query.
- **Editor**: Custom Screenplay formatting engine with WGA margins and keyboard shortcuts.
- **Previs Engine**: Deterministic perspective camera math + top-down 2.5D set blocking canvas.
- **Backend**: Node.js, TypeScript, Express, Socket.IO, Prisma ORM, Zod, JWT with bcrypt.
- **Database**: SQLite (via Prisma) for instant zero-dependency execution out of the box; PostgreSQL ready.
- **AI Inference**: Groq SDK (`llama-3.3-70b-versatile`) with built-in contextual fallback engine.
- **Export Engine**: PDFKit, DOCX.js, Fountain parser, Final Draft XML generator.

---

## 🚀 Quickstart Guide (Zero Docker Required)

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Demo Data
```bash
npm run seed
```

This populates the master demo project **"The Last Signal"** (Sci-Fi Thriller with Maya Vance, Daniel Corde, Elias, multiple scenes, versions, comments, suggestions, branch "Protocol Zero", 3D camera setups, and shots).

### 3. Run Development Servers
```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`

---

## 🔑 Development Demo Account

| Field | Value |
| :--- | :--- |
| **Email** | `demo@scriptforge.local` |
| **Password** | `Demo1234!` |
| **Role** | Director & Screenwriter |

---

## ⌨️ Screenplay Editor Keyboard Shortcuts

- `Tab`: Cycle screenplay block types (`Scene Heading` → `Action` → `Character` → `Dialogue` → `Parenthetical`)
- `Shift + Tab`: Cycle backwards
- `Ctrl + K` / `Cmd + K`: Open Global Command Palette
- `Esc`: Exit distraction-free Focus Mode

---

## 📜 Architecture

```
scriptforge/
├── apps/
│   ├── web/                     # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/      # Header, Sidebar, CommandPalette, Modals
│   │   │   ├── editor/          # Screenplay editor canvas & shortcuts
│   │   │   ├── features/        # AI, Previs, Storyboard, Shots, Versions, Branches, Comments, Characters
│   │   │   ├── pages/           # Landing, Auth, Onboarding, Dashboard, Workspace
│   │   │   ├── stores/          # Zustand auth & project stores
│   │   │   └── lib/             # API client & Socket.IO client
│   │
│   └── server/                  # Express + Socket.IO backend
│       ├── prisma/
│       │   ├── schema.prisma    # Relational Prisma models
│       │   └── seed.ts          # "The Last Signal" realistic seed
│       └── src/
│           ├── controllers/     # API route handlers
│           ├── services/        # AI, Export, Document, Version, Branch, Shot, Character services
│           ├── middleware/      # JWT auth & RBAC permission verification
│           └── websocket/       # Socket.IO room presence & cursor sync
└── package.json                 # Monorepo workspaces configuration
```

---

## 📄 License
MIT © ScriptForge Studio
