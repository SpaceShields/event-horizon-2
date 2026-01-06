# Event Horizon - Setup Guide

Complete setup instructions for running the Event Horizon MVP locally.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Local Development Setup](#local-development-setup)
4. [Environment Variables](#environment-variables)
5. [Running the Application](#running-the-application)
6. [Database Schema](#database-schema)
7. [Testing the MVP](#testing-the-mvp)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or later
- **npm** or **yarn** or **pnpm**
- **Git**
- **Supabase Account** (free tier works fine)

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the details:
   - **Project Name**: `event-horizon` (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your location
4. Click "Create new project"
5. Wait for the project to be provisioned (this takes 1-2 minutes)

### Step 2: Get Your API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. You'll need:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`, keep this secret!)

### Step 3: Database is Already Set Up!

The database schema has already been created using the Supabase MCP. You should see these tables in your Supabase SQL Editor:

- `profiles` - User profiles
- `event_categories` - Event categories (Conference, Workshop, etc.) - already seeded with 8 categories
- `events` - Core event data
- `event_registrations` - User registrations
- `events_with_stats` - Database view for event statistics

### Step 4: Configure Authentication Providers

#### Email/Password Authentication (Already Enabled)

Email/password auth is enabled by default.

#### Google OAuth (Optional)

To enable Google OAuth:

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Find **Google** and enable it
3. Follow the instructions to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase
5. Save the configuration

### Step 5: Set Up Row Level Security Policies

RLS policies are already configured! The following security rules are in place:

**Profiles Table:**
- Everyone can view profiles
- Users can only update their own profile
- Users can only insert their own profile

**Events Table:**
- Everyone can view published events
- Users can create events
- Users can only update/delete their own events

**Event Registrations Table:**
- Users can view their own registrations
- Users can create registrations
- Users can only update/delete their own registrations

**Event Categories Table:**
- Everyone can read categories
- Only authenticated users can create/update (admin level)

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
# Navigate to the project directory
cd /home/spacedev/Documents/claude-code/cc-projects/event-horizon-2
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file by copying the example:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

**Important:** Never commit `.env.local` to version control!

---

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes | `eyJ...` |
| `NEXT_PUBLIC_SITE_URL` | Your site URL | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID | No | From Google Cloud Console |

---

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Linting

```bash
npm run lint
```

---

## Database Schema

### Tables

#### 1. profiles
User profiles extending Supabase Auth

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | References auth.users.id |
| email | TEXT | User email (unique) |
| full_name | TEXT | User's full name |
| avatar_url | TEXT | Profile picture URL |
| bio | TEXT | User bio |
| location | TEXT | User location |
| created_at | TIMESTAMPTZ | Profile creation date |
| updated_at | TIMESTAMPTZ | Last update date |

#### 2. event_categories
Predefined event categories

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment ID |
| name | TEXT | Category name (unique) |
| slug | TEXT | URL-friendly slug (unique) |
| description | TEXT | Category description |
| icon | TEXT | Icon name (lucide-react) |
| created_at | TIMESTAMPTZ | Creation date |

**Categories (Pre-seeded):**
- Conference
- Workshop
- Networking
- Entertainment
- Community
- Charity
- Sports
- Other

#### 3. events
Core event data

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| title | TEXT | Event title |
| slug | TEXT | URL-friendly slug (unique) |
| description | TEXT | Event description |
| organization_name | TEXT | Optional organization name |
| owner_id | UUID (FK) | References profiles.id |
| category_id | INTEGER (FK) | References event_categories.id |
| location_type | ENUM | physical, virtual, hybrid |
| address | TEXT | Physical address (if applicable) |
| meeting_url | TEXT | Virtual meeting URL (if applicable) |
| start_datetime | TIMESTAMPTZ | Event start time |
| end_datetime | TIMESTAMPTZ | Event end time |
| timezone | TEXT | Timezone (default: UTC) |
| capacity | INTEGER | Maximum attendees (null = unlimited) |
| ticket_price | NUMERIC | Ticket price (null or 0 = free) |
| registration_instructions | TEXT | Payment/registration details |
| status | ENUM | draft, published, ongoing, completed, cancelled |
| image_url | TEXT | Event banner image URL |
| created_at | TIMESTAMPTZ | Creation date |
| updated_at | TIMESTAMPTZ | Last update date |

#### 4. event_registrations
User event registrations

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| event_id | UUID (FK) | References events.id |
| user_id | UUID (FK) | References profiles.id |
| guest_count | INTEGER | Number of guests (default: 0) |
| special_notes | TEXT | Registration notes |
| registration_date | TIMESTAMPTZ | Registration timestamp |
| attendance_status | ENUM | registered, attended, cancelled, no_show |
| created_at | TIMESTAMPTZ | Creation date |
| updated_at | TIMESTAMPTZ | Last update date |

#### 5. events_with_stats (View)
Database view combining events with registration statistics

Additional computed columns:
- `registration_count` - Total number of registrations
- `total_attendees` - Total attendees including guests
- `is_full` - Boolean indicating if event is at capacity

---

## Testing the MVP

### 1. Create a User Account

1. Go to [http://localhost:3000](http://localhost:3000)
2. Click "Sign Up" in the navigation
3. Choose either:
   - **Email/Password**: Fill in name, email, password
   - **Google OAuth**: Sign in with Google (if configured)
4. You'll be redirected to the events page

### 2. Browse Events

1. Navigate to **Events** page
2. Use filters:
   - **Category**: Conference, Workshop, Networking, etc.
   - **Location Type**: Physical, Virtual, Hybrid
   - **Price**: Free or Paid
3. Click on any event card to view details

### 3. Create an Event

1. Click **Create Event** in the navigation (requires login)
2. Fill in the event form:
   - Title, Description, Category
   - Location type (Physical/Virtual/Hybrid)
   - Date & Time
   - Capacity (optional)
   - Ticket price (0 or null = free)
   - Organization name (optional)
3. Choose **Save as Draft** or **Publish**
4. Published events appear in the public events list

### 4. Register for an Event

1. View an event detail page
2. Click **Register for Event**
3. Fill in optional details:
   - Guest count
   - Special notes
4. Confirmation appears immediately
5. View your registrations in the Dashboard

### 5. Manage Events (Dashboard)

1. Click **Dashboard** in navigation
2. View your profile information
3. See two sections:
   - **My Events**: Events you've created (edit/delete)
   - **My Registrations**: Events you've registered for

### 6. Edit/Delete Events

1. From the Dashboard, find your event
2. Click **Edit** icon to modify event details
3. Click **Delete** icon to remove event (with confirmation)
4. Only event owners can edit/delete their events

---

## Key Features Implemented

### MVP Features (Completed)

- **User Authentication**: Email/password + Google OAuth
- **Event Discovery**: Browse and filter events by category, location, price
- **Event Creation**: Rich event creation with draft/publish workflow
- **Event Registration**: User RSVPs with capacity management
- **User Dashboard**: View created events and registrations
- **Event Management**: Edit and delete owned events
- **Capacity Tracking**: Real-time capacity monitoring
- **Organization Names**: Simple text field for organization attribution
- **Responsive Design**: Mobile-first dark space theme

### Post-MVP Features (Not Implemented)

- Advanced search (full-text search)
- Email notifications
- Waitlist functionality
- Calendar integrations
- Event tags and advanced filtering
- Image uploads (currently uses URLs)
- Recurring events
- Social features (comments, discussions)
- Payment processing

---

## Project Structure

```
event-horizon-2/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Global styles + Tailwind
│   ├── auth/                    # Authentication pages
│   │   ├── login/page.tsx      # Login page
│   │   ├── signup/page.tsx     # Signup page
│   │   └── callback/route.ts   # OAuth callback
│   ├── events/                  # Event pages
│   │   ├── page.tsx            # Events listing
│   │   ├── [slug]/page.tsx     # Event detail
│   │   ├── new/page.tsx        # Create event
│   │   └── edit/[slug]/page.tsx # Edit event
│   └── dashboard/               # User dashboard
│       └── page.tsx
├── components/                   # React components
│   ├── ui/                      # shadcn UI components
│   ├── navigation.tsx           # Main navigation
│   ├── event-card.tsx           # Event card component
│   ├── event-filters.tsx        # Filter controls
│   ├── event-form.tsx           # Event creation form
│   ├── registration-button.tsx  # Registration UI
│   └── delete-event-button.tsx  # Delete confirmation
├── lib/                         # Utility functions
│   ├── supabase/               # Supabase clients
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware
│   ├── types/                  # TypeScript types
│   │   └── database.ts         # Database types
│   └── utils.ts                # Helper functions
├── middleware.ts                # Next.js middleware
├── .env.local.example          # Environment template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind config
└── next.config.ts              # Next.js config
```

---

## Troubleshooting

### Issue: "Invalid API key" error

**Solution:** Double-check your `.env.local` file:
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct
- Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the anon/public key (not service role)
- Restart the dev server after changing environment variables

### Issue: User signup succeeds but profile not created

**Solution:** Check Supabase database triggers:
1. Go to Supabase SQL Editor
2. Verify `handle_new_user()` function exists
3. Verify trigger `on_auth_user_created` is attached to `auth.users`
4. The trigger should auto-create profile on signup

### Issue: Events not showing up

**Solution:**
- Ensure events have `status = 'published'` (not 'draft')
- Check that `start_datetime` is in the future
- Verify RLS policies allow read access
- Check browser console for errors

### Issue: "Row Level Security" error when creating events

**Solution:**
- Ensure you're logged in (check auth state)
- Verify `owner_id` is set to current user's ID
- Check RLS policies in Supabase Dashboard

### Issue: Google OAuth not working

**Solution:**
1. Verify Google OAuth is enabled in Supabase Dashboard
2. Check redirect URI matches Supabase settings
3. Ensure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set (if using custom credentials)
4. Clear browser cookies and try again

### Issue: Images not displaying

**Solution:**
- Event images use URL strings in MVP (no file uploads)
- Use publicly accessible image URLs (e.g., Unsplash, NASA imagery)
- Check browser console for CORS errors
- Verify image URL is valid and accessible

### Issue: Build fails with TypeScript errors

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

---

## Next Steps

### Recommended Enhancements

1. **Email Notifications**: Integrate Resend or SendGrid for registration confirmations
2. **Full-Text Search**: Add search bar with PostgreSQL full-text search
3. **Image Uploads**: Integrate Supabase Storage for event images
4. **Waitlist**: Implement waitlist when events reach capacity
5. **Calendar Export**: Add iCal/Google Calendar integration
6. **Event Tags**: Add flexible tagging system for topics (Mars, Astrophotography, etc.)
7. **Analytics**: Add event analytics dashboard for organizers
8. **Social Features**: Comments, Q&A, event discussions

### Deployment to Production

When ready to deploy:

1. **Vercel** (Recommended):
   ```bash
   npm install -g vercel
   vercel
   ```

2. Set environment variables in Vercel Dashboard
3. Update Supabase redirect URLs for production domain
4. Configure custom domain (optional)

---

## Support

For issues or questions:
- Check the [mvp-requirements.md](/home/spacedev/Documents/claude-code/cc-projects/event-horizon-2/mvp-requirements.md) for detailed specifications
- Review the [CLAUDE.md](/home/spacedev/Documents/claude-code/cc-projects/event-horizon-2/CLAUDE.md) for project context
- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Check Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)

---

**Event Horizon** - Where Space Enthusiasts Gather
