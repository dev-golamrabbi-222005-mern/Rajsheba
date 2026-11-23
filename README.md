# Rajsheba

Unified Monorepo for Rajsheba Service Marketplace & Invoicing System.

## Workspace Architecture

```
rajsheba/
├── apps/
│   ├── web/            # Main Web Application & Dashboard (Next.js 16, React 19, Redux Toolkit, Tailwind CSS v4)
│   ├── api/            # Main Backend API (Node.js, Express.js, TypeScript, Prisma, NeonDB PostgreSQL, Socket.io)
│   ├── invoices-web/   # Invoicing Management Frontend (Next.js 16, React 19, Tailwind CSS v4)
│   └── invoices-api/   # Invoicing Microservice API (Node.js, Express.js, NeonDB PostgreSQL)
└── docs/               # Architecture and implementation plans
```

## Getting Started

### Prerequisites
- Node.js >= 20
- npm >= 10
- PostgreSQL (NeonDB)

### Setup & Run
```bash
# Install all dependencies across the monorepo
npm install

# Run Main Web App (Port 3000)
npm run dev:web

# Run Main Backend API (Port 5000)
npm run dev:api

# Run Invoices Web App (Port 3001)
npm run dev:invoices-web

# Run Invoices Microservice API (Port 5001)
npm run dev:invoices-api
```
