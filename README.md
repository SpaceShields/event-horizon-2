# Event Horizon

**Where Space Enthusiasts Gather**

A specialized event management platform for the space industry, astronomy community, and space enthusiasts. Discover and organize space-related events including conferences, stargazing sessions, rocket launches, workshops, and space industry networking.

## Features

- **Event Discovery** - Browse and filter space events by category, location type, and price
- **Event Creation** - Rich event creation with draft/publish workflow
- **Event Registration** - User RSVPs with capacity management
- **User Authentication** - Email/password + Google OAuth via Supabase
- **User Dashboard** - Manage created events and registrations
- **Space Theme** - Dark mode with cosmic aesthetic and responsive design

## Tech Stack

- **Framework**: Next.js 16.1.0 (App Router)
- **UI**: React 19.2.3, Tailwind CSS v4, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Language**: TypeScript 5

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. The database schema is already set up (4 tables: profiles, event_categories, events, event_registrations)
3. Get your API credentials from Settings → API

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Documentation

- **[SETUP.md](./docs/SETUP.md)** - Comprehensive setup guide with troubleshooting
- **[mvp-requirements.md](./docs/mvp-requirements.md)** - Detailed product requirements and specifications
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Project deployment instructions
- **[README.docker.md](./docs/README.docker.md)** - Docker containerization README

## Project Structure

```
app/                    # Next.js pages (App Router)
├── auth/              # Authentication (login, signup, callback)
├── events/            # Event pages (browse, detail, create, edit)
└── dashboard/         # User dashboard

components/            # React components
├── ui/               # shadcn UI components
├── navigation.tsx    # Main navigation
├── event-card.tsx    # Event card
├── event-filters.tsx # Filter controls
└── event-form.tsx    # Event creation form

lib/
├── supabase/         # Supabase clients (browser, server, middleware)
├── types/            # TypeScript types
└── utils.ts          # Helper functions
```

## Key Features Implemented

### MVP Phase (Completed)

- User authentication (email/password + Google OAuth)
- Event discovery with filtering
- Event creation with draft/publish
- Event registration with capacity tracking
- User dashboard for event management
- Event editing and deletion
- Organization name attribution
- Responsive dark space theme

### Post-MVP (Not Implemented)

- Full-text search
- Email notifications
- Waitlist functionality
- Image uploads
- Calendar integrations
- Event tags
- Recurring events
- Social features

## Database Schema

### Core Tables

- **profiles** - User profiles extending Supabase Auth
- **event_categories** - 8 predefined categories (Conference, Workshop, Networking, Entertainment, Community, Charity, Sports, Other)
- **events** - Event data with location, pricing, capacity
- **event_registrations** - User RSVPs and attendance tracking
- **events_with_stats** - Database view with registration counts

## Development Commands

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
npm run lint   # Run ESLint
```

## Deployment

Ready to deploy to Vercel:

```bash
vercel
```

Don't forget to:
1. Set environment variables in Vercel Dashboard
2. Update Supabase redirect URLs for production domain

## License

Private project - All rights reserved

---

**Event Horizon** - Version 2.0 MVP
