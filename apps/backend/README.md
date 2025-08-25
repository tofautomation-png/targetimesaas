# Targetime Partners Backend

Node.js backend API with Fastify, TypeScript, and Baserow integration.

## Features

- 🔐 Session-based authentication with HTTP-only cookies
- 📊 Dynamic table discovery by agency code
- 🔄 Real-time KPI calculations
- 📋 Complete CRUD operations for clients and appointments
- 📈 Data export (CSV/JSON)
- 🏥 Health checks for deployment monitoring

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
PORT=8080
BASEROW_URL=https://baserow.becoming-more.com
BASEROW_TOKEN=your_baserow_token
SESSION_SECRET=your_secure_session_secret
ALLOWED_ORIGINS=https://partners.targetime.com,http://localhost:3000
NODE_ENV=development
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout and clear session
- `GET /auth/session` - Get current session info

### Overview
- `GET /overview/kpis` - Get dashboard KPIs

### Clients
- `GET /clients/welcome` - List welcome clients
- `POST /clients/welcome` - Create welcome client
- `PATCH /clients/welcome/:id` - Update welcome client
- `GET /clients/retargeting` - List retargeting clients
- `POST /clients/retargeting/:id/email-logs` - Log retargeting email
- `GET /clients/followups` - List follow-up clients
- `POST /clients/followups/:id/email-logs` - Log follow-up email
- `PATCH /clients/followups/:id` - Update follow-up client

### Appointments
- `GET /appointments` - List appointments (with filters)
- `POST /appointments` - Create appointment
- `PATCH /appointments/:id` - Update appointment

### Reports
- `GET /reports/export?entity=X&format=Y` - Export data

### Health
- `GET /health` - Health check

## Testing

```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Get KPIs
curl -X GET http://localhost:8080/overview/kpis -b cookies.txt

# Get clients
curl -X GET http://localhost:8080/clients/welcome -b cookies.txt
```

## Docker

```bash
# Build image
docker build -t targetime-backend .

# Run container
docker run -p 8080:8080 --env-file .env targetime-backend
```

## Deployment

Designed for Coolify deployment:
- **Domain**: `https://crmbackend.becoming-more.pro`
- **Port**: 8080
- **Healthcheck**: `/health`
