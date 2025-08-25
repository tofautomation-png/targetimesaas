# Targetime Partners Frontend

Next.js 14 frontend with modern UI, animations, and Baserow integration.

## Features

- 🎨 Dark green/neon brand theme with Framer Motion animations
- 🔐 Session-based authentication
- 📱 Responsive design with Tailwind CSS
- ✨ Animated membership card and sidebar navigation
- 📊 Real-time dashboard with KPI metrics
- 👥 Client management across different stages
- 📅 Appointment scheduling and management
- 📈 Data export functionality

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_BACKEND_URL=https://crmbackend.becoming-more.pro
NEXT_PUBLIC_BRAND_LOGO=https://framerusercontent.com/images/0Wv5hQVMLzh3f9CWZ4UtLjPjZU.png?scale-down-to=512
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

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication
│   └── profile/          # User profile
├── components/           # Reusable UI components
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── MembershipCard.tsx # Animated welcome card
│   └── MetricCard.tsx   # Dashboard metric cards
└── lib/                 # Utilities and API client
    ├── api.ts          # Backend API client
    └── utils.ts        # Helper functions
```

## Key Components

### MembershipCard
- Animated 3D flip card with rotating titles
- Shows for 4 seconds on login
- Smooth transitions with Framer Motion

### Sidebar
- Collapsible navigation with hover effects
- Active state indicators with neon glow
- Spring animations on interactions

### MetricCard
- Animated dashboard cards with staggered entrance
- Hover effects with shimmer animation
- Trend indicators and icons

## Styling

- **Background**: Dark gradient (#04110B → #0A1C14)
- **Primary**: Neon gradient (#00FF85 → #00FFC5)
- **Accent**: Neon glow (#4EF0A8)
- **Text**: Primary (#F2F7F5), Secondary (#A9B8B3)

## Docker

```bash
# Build image
docker build -t targetime-frontend .

# Run container
docker run -p 3000:3000 --env-file .env targetime-frontend
```

## Deployment

Designed for Coolify deployment:
- **Domain**: `https://partners.targetime.com`
- **Port**: 3000
- **Healthcheck**: `/health`
