# Targetime Partners CRM

A production-ready full-stack CRM application with Next.js frontend and Node.js backend, integrated with Baserow and deployable on Coolify.

## Architecture

- **Frontend**: Next.js 14 (App Router) with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js 20 with Fastify, TypeScript, Baserow integration
- **Database**: Baserow (dynamic table discovery by agency code)
- **Deployment**: Coolify with Docker containers

## Quick Start

### Prerequisites
- Node.js 20+
- npm 9+

### Development Setup

1. Clone and install dependencies:
```bash
git clone <repository-url>
cd targetime-partners
npm install
```

2. Setup environment variables:
```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Frontend  
cp apps/frontend/.env.example apps/frontend/.env
```

3. Start development servers:
```bash
# Terminal 1 - Backend (http://localhost:8080)
npm run dev:backend

# Terminal 2 - Frontend (http://localhost:3000)
npm run dev:frontend
```

### Testing the API

Login and get session:
```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Get KPIs
curl -X GET http://localhost:8080/overview/kpis \
  -b cookies.txt

# Get clients
curl -X GET http://localhost:8080/clients/welcome \
  -b cookies.txt
```

## Project Structure

```
targetime-partners/
├── apps/
│   ├── backend/          # Node.js API server
│   └── frontend/         # Next.js web application
├── .github/workflows/    # CI/CD pipelines
└── package.json         # Workspace root
```

## Deployment

The application is designed for Coolify deployment with two services:

- **Backend**: `https://crmbackend.becoming-more.pro`
- **Frontend**: `https://partners.targetime.com`

See individual app READMEs for detailed deployment instructions.

## Features

- 🔐 Session-based authentication with Baserow users
- 📊 Real-time KPI dashboard
- 👥 Client management (Welcome, Retargeting, Follow-ups)
- 📅 Appointment scheduling
- 📈 Data export and reporting
- 🎨 Modern UI with dark green/neon branding
- 🚀 Production-ready with Docker and CI/CD
