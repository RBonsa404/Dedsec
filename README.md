# 🏴‍☠️ DEDSEC — Collaborative Project & Cyber Ops Management Platform

> **"Join us. We are DedSec."**  
> DEDSEC is a modern, high-performance collaborative project management application combining Trello-like Kanban agility with enterprise squad telemetry, access control tiers, leave & presence tracking, deliverables storage quotas, and real-time operational communications.

---

## ⚡ Key Highlights & Features

### 🎛️ 1. Multi-Tier Role-Based Access Control (RBAC)
- **🛡️ ADMIN (System Core)**:
  - Global system telemetry, uptime monitoring, and full audit logs.
  - Complete identity & operator provisioning (`/users`) with password resets and account suspension.
  - System-wide emergency broadcasts (`/announcements`).
  - Project deletion and global governance.
- **👑 PROJECT_MANAGER (Field Commander)**:
  - Project initialization, mission briefs, and storage quota management (`/projects`).
  - Pipeline board creation, custom columns, and column reordering.
  - Squad member assignment and workload monitoring.
  - Absence & leave request clearance/reviews (`/absences`).
- **👨‍💻 TEAM_MEMBER (Operative)**:
  - Personal task dashboard (`/my-tasks`).
  - Drag-and-drop Kanban execution, checklist item completion, and mission comments.
  - Leave and absence submission.
  - Deliverables and report uploads.

---

### 📋 2. Interactive Kanban Pipeline (`@dnd-kit`)
- Smooth drag-and-drop of task cards across pipeline stages and within the same column.
- Column reordering via drag-and-drop.
- Real-time task search and multi-level priority filters (`ALL`, `LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- Detailed Task Inspector Modal:
  - **Dynamic Checklists**: Subtask progress tracking with live percentage bar.
  - **Operation Transmissions**: Comment stream for operative discussions.
  - **Tagging & Priorities**: Colored neon badges for priority and custom tags.
  - **Exporting**: Instant **CSV / Excel** task data export and **PDF** report generator.

---

### 💾 3. Deliverables & Storage Quotas (`/deliverables`)
- Real-time **Storage Quota Allocation Meter** (e.g. 500 MB quota per project).
- Visual warning thresholds (Normal at <75%, Warning at 75-90%, Alert at >90%).
- Deliverables vs Reports categorization with version tracking (`v1.0`, `v2.0`).
- One-click **Excel/CSV Export** and printable **PDF Deliverables Ledger**.

---

### 🌴 4. Absence & Availability Management (`/absences`)
- Operatives submit mission absence requests with start date, end date, and justification.
- PMs and Admins review pending requests with 1-click **APPROVE / REJECT** and review notes.
- Status badges (`PENDING`, `APPROVED`, `REJECTED`).

---

### 📢 5. Global Directives & Announcements (`/announcements`)
- Emergency transmissions and squad broadcasts dispatched to all operatives.
- Admin activation/deactivation toggles and permanent deletion controls.

---

### 🔔 6. Dispatch Telemetry & Live Notifications
- Real-time Topbar notification bell with unread badge counter.
- Slide-out dropdown drawer with 1-click "Mark All Read" and deep navigation links.
- Dedicated full-page **Notifications Center** (`/notifications`).

---

### 📱 7. Responsive Mobile & Desktop Layout
- Sleek hacker dark theme with neon cyan (`#00d4ff`), toxic green (`#00ff88`), and danger red (`#ff3366`).
- Slide-out responsive mobile navigation drawer with backdrop blur.

---

## 🏗️ Technical Architecture & Stack

```
DEDSEC/
├── backend/                  # NestJS 10 REST API & WebSockets
│   ├── src/
│   │   ├── auth/             # JWT, Password Rotation, Forgot Password
│   │   ├── users/            # Operator IAM, Suspension, Password Reset
│   │   ├── projects/         # Projects, Members, Workload, Deliverables
│   │   ├── boards/           # Kanban Boards, Columns Reordering
│   │   ├── tasks/            # Tasks, Checklists, Comments, Labels
│   │   ├── absences/         # Squad Availability & Leave Clearance
│   │   ├── announcements/    # Global Directives & Broadcasts
│   │   ├── notifications/    # In-App & Email Dispatch Alerts
│   │   ├── audit-log/        # Security & Compliance Audit Trail
│   │   └── websockets/       # Real-time WebSocket Event Gateway
│   └── prisma/
│       └── schema.prisma     # Standalone SQLite / PostgreSQL Schema
└── frontend/                 # Next.js 15 App Router + Tailwind CSS
    └── src/
        ├── app/
        │   ├── (auth)/       # /login, /reset-password, /forgot-password
        │   └── (dashboard)/  # /projects, /my-tasks, /users, /absences, /profile, /admin
        ├── components/
        │   ├── kanban/       # Board, Column, TaskCard, TaskModal (dnd-kit)
        │   ├── layout/       # Sidebar, Topbar (with live notifications)
        │   └── ui/           # Terminal-styled buttons, inputs, dialogs
        └── stores/           # Zustand Auth & Navigation Stores
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm

### 1. Launch the Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
```
- **Backend API**: `http://localhost:4000`
- **Interactive Swagger Docs**: `http://localhost:4000/api/docs`

### 2. Launch the Frontend
```bash
cd frontend
npm install
npm run dev
```
- **Frontend Application**: `http://localhost:3000`

---

## 🔑 Demo Access Credentials

| Operator Role | Email Identifier | Initial Passphrase | Default Landing Page |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@dedsec.io` | `Dedsec@2024` | `/admin` (SysAdmin Core) |
| **Project Manager** | `sophie.martin@dedsec.io` | `Manager@2024` | `/projects` (Project Phoenix) |
| **Team Member** | `alex.dupont@dedsec.io` | `Member@2024` | `/my-tasks` (Operative Tasks) |
| **Team Member** | `lina.chen@dedsec.io` | `Member@2024` | `/my-tasks` (Operative Tasks) |
| **Team Member** | `omar.benali@dedsec.io` | `Member@2024` | `/my-tasks` (Operative Tasks) |

*(Upon initial connection, security policy prompts the operative to define a new personal passphrase).*

---

## 🧪 Running Tests
```bash
cd backend
npx jest src/auth/auth.service.spec.ts
```

---

## 📜 License
Private and Confidential — **DEDSEC System Collective**.
