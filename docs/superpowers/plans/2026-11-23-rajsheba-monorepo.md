# Rajsheba Monorepo & Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate and align all Rajsheba codebases into a clean npm workspaces Monorepo, migrate the Invoices API from MongoDB to NeonDB PostgreSQL, and build the new Node.js/Express/TypeScript backend (`apps/api`) for Rajseba matching all RTK Query frontend requirements.

**Architecture:** Monorepo using npm workspaces (`apps/*`) housing `apps/web` (Next.js 16 main frontend), `apps/api` (Express.js + TypeScript + Prisma + NeonDB PostgreSQL main backend), `apps/invoices-web` (Next.js invoice UI), and `apps/invoices-api` (Express.js + PostgreSQL invoice service).

**Tech Stack:** 
- Monorepo: npm workspaces
- Main Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Redux Toolkit, RTK Query
- Main Backend: Node.js, Express.js, TypeScript, Prisma ORM, NeonDB PostgreSQL, JWT, Socket.io
- Invoices Frontend: Next.js 16, React 19, Tailwind CSS v4
- Invoices API: Express.js, TypeScript/Node.js, PostgreSQL (NeonDB)

**Spec:** User architecture requirements from chat: Monorepo structure, Express + TS backend, NeonDB PostgreSQL for all backends, microservice separation for invoices API, Git remote `https://github.com/dev-golamrabbi-222005-mern/Rajsheba.git`, and commit convention `[{ADDED/MODIFIED} - {area}]: {description}`.

## Global Constraints
- Commit message format must strictly follow: `[ADDED/MODIFIED - {component}]: {description}`
- Push to GitHub origin main after every phase
- All backend databases must use PostgreSQL (NeonDB) with Prisma ORM
- Response format in `apps/api` must match RTK Query expectations: `{ statusCode: number, message: string, data: any }`
- Main backend integer IDs must align with frontend TypeScript interfaces (`id: number`)

---

## Phase 1: Monorepo Foundation & Codebase Migration

### Task 1.1: Git Repository Initialization and Remote Configuration
**Files:**
- Create: `README.md`
- Create: `.gitignore`

- [ ] **Step 1: Create root README and .gitignore**
- [ ] **Step 2: Initialize git repository and set main branch**
- [ ] **Step 3: Set git remote origin to `https://github.com/dev-golamrabbi-222005-mern/Rajsheba.git`**

### Task 1.2: Restructure Directories into `apps/*`
**Files:**
- Move: `Production-Rajseba-Frontend-New` -> `apps/web`
- Move: `rajsebaInvoices-frontend` -> `apps/invoices-web`
- Move: `rajsebaInvoices-api` -> `apps/invoices-api`

- [ ] **Step 1: Create `apps/` directory**
- [ ] **Step 2: Move existing folders into `apps/web`, `apps/invoices-web`, `apps/invoices-api`**
- [ ] **Step 3: Clean internal nested `.git` folders from subdirectories so the root monorepo tracks all files**

### Task 1.3: Monorepo Root Workspace Configuration
**Files:**
- Create: `package.json`

- [ ] **Step 1: Create root `package.json` defining workspaces `["apps/*"]` and orchestration scripts (`dev`, `build`, etc.)**
- [ ] **Step 2: Verify `npm install` across workspaces**
- [ ] **Step 3: Commit and Push Phase 1 to GitHub**
  - Commit message: `[ADDED - Monorepo Structure]: Initialize monorepo workspace and migrate apps`

---

## Phase 2: Invoices API Shift to NeonDB PostgreSQL (`apps/invoices-api`)

### Task 2.1: PostgreSQL & Prisma Setup in `apps/invoices-api`
**Files:**
- Create: `apps/invoices-api/prisma/schema.prisma`
- Modify: `apps/invoices-api/package.json`
- Modify: `apps/invoices-api/.env`

- [ ] **Step 1: Add Prisma & pg dependencies to `apps/invoices-api`**
- [ ] **Step 2: Define Prisma schema for `Customer`, `Service`, `Invoice`, and `InvoiceItem`**
- [ ] **Step 3: Generate Prisma client**

### Task 2.2: Refactor Routes to Prisma
**Files:**
- Modify: `apps/invoices-api/routes/customerRoutes.js`
- Modify: `apps/invoices-api/routes/serviceRoutes.js`
- Modify: `apps/invoices-api/routes/invoiceRoutes.js`
- Modify: `apps/invoices-api/server.js`

- [ ] **Step 1: Replace Mongoose models with Prisma client queries**
- [ ] **Step 2: Run and verify server endpoints locally**
- [ ] **Step 3: Commit and Push Phase 2 to GitHub**
  - Commit message: `[MODIFIED - Invoices API]: Shift database from MongoDB to NeonDB PostgreSQL`

---

## Phase 3: Core Rajseba Backend Scaffolding (`apps/api`)

### Task 3.1: Express + TypeScript Setup
**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/app.ts`

- [ ] **Step 1: Initialize Express + TypeScript project**
- [ ] **Step 2: Install dependencies (`express`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `zod`, `socket.io`, `prisma`, `@prisma/client`)**
- [ ] **Step 3: Setup app with cors, json parsing, and error middleware**

### Task 3.2: Complete Prisma Schema for Rajseba
**Files:**
- Create: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Define models for Users, Roles, Categories, Services, SubServices, NestedServices, Packages, Bookings, Coupons, Reviews, Notifications, Locations, Branding**
- [ ] **Step 2: Generate Prisma client and seed initial roles & superadmin**
- [ ] **Step 3: Commit and Push Phase 3 to GitHub**
  - Commit message: `[ADDED - Rajseba Backend]: Scaffolding, NeonDB Prisma schema and auth foundation`

---

## Phase 4: Full Business Logic & REST/Socket APIs in `apps/api`

### Task 4.1: Authentication & User/Profile APIs
**Files:**
- Create: `apps/api/src/modules/auth/*`
- Create: `apps/api/src/modules/users/*`

- [ ] **Step 1: Implement `/auth/login`, `/auth/register`, `/auth/refresh-token`, `/auth/send-otp`, `/auth/verify-otp`**
- [ ] **Step 2: Implement `/users/me` and role-based user management**

### Task 4.2: Catalog, Services & Booking APIs
**Files:**
- Create: `apps/api/src/modules/categories/*`
- Create: `apps/api/src/modules/services/*`
- Create: `apps/api/src/modules/bookings/*`

- [ ] **Step 1: Implement Category and Service CRUD APIs**
- [ ] **Step 2: Implement Booking creation, status update (`pending` -> `assigned` -> `completed`), and cancellation**

### Task 4.3: Live Chat & Realtime Socket Gateway
**Files:**
- Create: `apps/api/src/modules/chat/*`
- Create: `apps/api/src/socket.ts`

- [ ] **Step 1: Implement Socket.io message broadcasting and chat persistence**
- [ ] **Step 2: Commit and Push Phase 4 to GitHub**
  - Commit message: `[ADDED - Rajseba Backend]: Implement full business logic APIs and Socket.io gateway`

---

## Phase 5: Frontend Integration & Monorepo Build Verification

### Task 5.1: Configure Environment Variables
**Files:**
- Create: `apps/web/.env.local`
- Create: `apps/invoices-web/.env.local`

- [ ] **Step 1: Configure `NEXT_PUBLIC_API_URL` to local backend**
- [ ] **Step 2: Test end-to-end authentication and catalog loading in `apps/web`**
- [ ] **Step 3: Run full workspace build (`npm run build`)**
- [ ] **Step 4: Commit and Push Phase 5 to GitHub**
  - Commit message: `[MODIFIED - Integration]: Connect frontends to backend and verify full monorepo build`
