# Event Horizon MVP - Implementation Plan

## Overview

Build Event Horizon MVP - a space-themed event management platform with event discovery, creation, registration, and user authentication using Next.js 16, Supabase, and Tailwind CSS v4 with shadcn/ui.

**Custom Assets to Integrate:**
- `public/black-hole-bg.svg` - Dark theme background (hero, body)
- `public/light-bg.svg` - Light theme alternative
- `public/moon.svg` - Decorative elements, empty states
- `public/linear.png` - Logo/branding in header

**✅ Already Completed:**
- Supabase project created
- Environment variables configured in `.env.local`
- Dependencies installed (including shadcn/ui)
- Google OAuth configured in Supabase dashboard

**🎯 Next Immediate Steps:**
1. Create database schema (`/lib/supabase/schema.sql`)
2. Create Supabase client utilities
3. Set up authentication pages and middleware
4. Implement space theme with custom assets

---

## Phase 1: Supabase Client & Database (Week 1)

### 1.1 ✅ COMPLETED: Dependencies & Environment
- Supabase packages installed
- `.env.local` configured with Supabase keys
- shadcn/ui installed for component library

### 1.2 ✅ COMPLETED: Google OAuth
- Google OAuth provider enabled in Supabase
- Redirect URLs configured

### 1.3 Create Supabase Client Utilities
**Files to create:**
- `/lib/supabase/client.ts` - Browser client for Client Components
- `/lib/supabase/server.ts` - Server client for Server Components
- `/middleware.ts` - Auth middleware for protected routes

### 1.4 Database Schema
**File:** `/lib/supabase/schema.sql`

**4 Core Tables:**
1. **profiles** - User profiles (id, email, full_name, avatar_url, bio)
2. **event_categories** - 8 categories (Conference, Workshop, Networking, Entertainment, Sports, Community, Charity, Other)
3. **events** - Event data (title, description, slug, category_id, owner_id, organization_name, location_type, dates, capacity, price_display, status, image_url)
4. **event_registrations** - RSVPs (event_id, user_id, guest_count, special_notes, status)

**Key Features:**
- Row Level Security (RLS) on all tables
- Auto-generate slugs (database trigger)
- Auto-create profile on signup (database trigger)
- Auto-update timestamps trigger
- Database view: `events_with_stats` (includes registration_count, total_attendees, is_full)

**Indexes:**
```sql
CREATE INDEX idx_events_owner ON events(owner_id);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_slug ON events(slug);
```

### 1.5 Seed Data
**File:** `/lib/supabase/seed.sql`

Seed 8 event categories with icons and colors:
- Conference (building, #3B82F6)
- Workshop (wrench, #8B5CF6)
- Networking (users, #10B981)
- Entertainment (star, #F59E0B)
- Sports (trophy, #EF4444)
- Community (heart, #EC4899)
- Charity (gift, #6366F1)
- Other (globe, #6B7280)

---

## Phase 2: Type Definitions & Utilities (Week 1-2)

### 2.1 Generate Types
**Files to create:**
- `/types/database.types.ts` - Auto-generated from Supabase CLI
- `/types/index.ts` - Application types (Profile, Event, EventWithStats, etc.)

### 2.2 Validation Schemas
**File:** `/lib/validations.ts`

Create Zod schemas:
- `eventFormSchema` - Event creation/editing
- `registrationFormSchema` - Event registration
- `profileUpdateSchema` - Profile updates

### 2.3 Utility Functions
**File:** `/lib/utils.ts`

Date formatting, slug generation, capacity helpers, location display

---

## Phase 3: Authentication (Week 2)

### 3.1 Configure Supabase Auth
- Enable Google OAuth provider
- Enable Email/Password auth
- Set redirect URLs: `http://localhost:3000/auth/callback`

### 3.2 Auth Pages & Routes
**Create:**
- `/app/auth/login/page.tsx` - Login page
- `/app/auth/signup/page.tsx` - Signup page
- `/app/auth/callback/route.ts` - OAuth callback handler
- `/app/auth/signout/route.ts` - Sign out route

### 3.3 Auth Components
**Create:**
- `/components/auth/LoginForm.tsx` - Email/password login
- `/components/auth/SignupForm.tsx` - Email/password signup
- `/components/auth/GoogleButton.tsx` - Google OAuth button

### 3.4 Middleware
**Update:** `/middleware.ts`

Protect routes: `/events/create`, `/profile/*`

---

## Phase 4: Layout & Theme with Assets (Week 2-3)

### 4.1 Update Global Styles
**Edit:** `/app/globals.css`

```css
@import "tailwindcss";

:root {
  --space-black: #0a0a0a;
  --space-dark: #1a1a2e;
  --space-purple: #6366f1;
  --space-blue: #3b82f6;
  --space-text: #ededed;
  --background: var(--space-black);
  --foreground: var(--space-text);
}

body {
  background: var(--background);
  color: var(--foreground);
  background-image: url('/black-hole-bg.svg');
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.7);
  z-index: -1;
}
```

### 4.2 Layout Components
**Create:**
- `/components/layout/Header.tsx` - Navigation with `linear.png` logo
- `/components/layout/Footer.tsx` - Footer links
- `/components/layout/Navigation.tsx` - Mobile/desktop nav
- `/components/layout/UserMenu.tsx` - User dropdown menu

**Header design:**
- Logo: `/public/linear.png` on left
- Nav links: Events, Create Event
- User menu (authenticated) or Sign In button
- Responsive hamburger menu for mobile

### 4.3 Update Root Layout
**Edit:** `/app/layout.tsx`

Add Header and Footer components

---

## Phase 5: UI Components with shadcn/ui (Week 3)

### 5.1 Install shadcn/ui Components
**Use shadcn/ui CLI to add components:**
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add skeleton
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add alert
```

### 5.2 Customize shadcn Components for Space Theme
**Edit:** `/components/ui/card.tsx`
- Add glassmorphism variant: `backdrop-blur-lg bg-white/5 border border-white/10`
- Add space theme colors to badge variants

### 5.2 Event Components
**Create:** `/components/events/`
- **EventCard.tsx** - Grid item showing:
  - Event image or `moon.svg` placeholder
  - Category badge (colored with icon)
  - Title, date, time
  - Location type (Physical/Virtual/Hybrid)
  - Organization name
  - Capacity indicator
  - Register button or "Full" badge

- **EventCardSkeleton.tsx** - Loading state
- **EventList.tsx** - Grid container
- **EventFilters.tsx** - Category, location, price filters
- **EventDetails.tsx** - Full event view
- **EventRegistrationButton.tsx** - Context-aware button
- **EventStatus.tsx** - Status badge
- **CategoryBadge.tsx** - Colored category indicator
- **CapacityIndicator.tsx** - Shows "X/Y spots" or "Unlimited"

### 5.3 Form Components
**Create:** `/components/forms/`
- EventForm.tsx - Create/edit event
- RegistrationForm.tsx - Register for event
- ProfileForm.tsx - Edit profile
- DateTimePicker.tsx - Date/time selection

---

## Phase 6: Event Pages (Week 3-4)

### 6.1 Landing Page
**Replace:** `/app/page.tsx`

**Design:**
- Hero section with `black-hole-bg.svg` background
- Tagline: "Where Space Enthusiasts Gather"
- CTA buttons: "Browse Events", "Create Event"
- Featured upcoming events (3-4 cards)
- Category showcase with icons

### 6.2 Event Listing Page
**Create:** `/app/events/page.tsx` (Server Component)

**Features:**
- Fetch events from `events_with_stats` view
- Filter by category, location type (URL params)
- Display in responsive grid (1/2/3 columns)
- Server Component for SEO

**Create:** `/app/events/loading.tsx` - Skeleton grid

### 6.3 Event Detail Page
**Create:** `/app/events/[slug]/page.tsx` (Server Component)

**Features:**
- Fetch event by slug with category, owner, registrations
- Display full details
- Registration section (if published)
- Edit button (if owner)
- Dynamic metadata for SEO

**Create:** `/app/events/[slug]/not-found.tsx` - 404 with `moon.svg`

### 6.4 Event Creation Page
**Create:** `/app/events/create/page.tsx` (Protected)

**Form fields:**
- Title, Description, Category
- Location type (Physical/Virtual/Hybrid)
- Address or Virtual URL
- Start/End date & time
- Capacity (optional)
- Price display (text, e.g., "Free", "$50")
- Registration instructions
- Image URL (text input for MVP)
- Organization name (optional)
- Draft/Publish toggle

**Create:** `/app/events/[slug]/edit/page.tsx` - Edit form (owner only)

---

## Phase 7: Server Actions (Week 4)

### 7.1 Event Actions
**Create:** `/app/actions/events.ts`

```typescript
'use server';

export async function createEvent(formData: FormData)
export async function updateEvent(eventId: string, formData: FormData)
export async function deleteEvent(eventId: string)
export async function publishEvent(eventId: string)
```

### 7.2 Registration Actions
**Create:** `/app/actions/registrations.ts`

```typescript
'use server';

export async function registerForEvent(eventId: string, data: {
  guest_count: number;
  special_notes?: string;
})
export async function cancelRegistration(registrationId: string)
```

**Capacity check logic:**
- Query `events_with_stats` view
- Check if `total_attendees + guest_count <= capacity`
- Return error if full, otherwise insert registration

### 7.3 Profile Actions
**Create:** `/app/actions/profile.ts`

```typescript
'use server';

export async function updateProfile(data: ProfileUpdate)
```

---

## Phase 8: User Profile & Dashboard (Week 4-5)

### 8.1 Profile Page
**Create:** `/app/profile/page.tsx` (Protected)

**Tabs:**
- Overview (profile info, stats)
- Created Events (events owned by user)
- My Registrations (events user registered for)

### 8.2 My Events
**Create:** `/app/profile/events/page.tsx`

Display user's created events with Draft/Published status

### 8.3 My Registrations
**Create:** `/app/profile/registrations/page.tsx`

Display events user registered for with cancel option

---

## Phase 9: Registration Flow (Week 5)

### 9.1 Registration Button Component
**Update:** `/components/events/EventRegistrationButton.tsx`

**States:**
- Not logged in → "Sign in to register" (redirect to login)
- Already registered → "Registered ✓" (show cancel option)
- Event full → "Event Full" (disabled)
- Can register → "Register" (open modal)

### 9.2 Registration Modal
**Create:** `/components/events/RegistrationModal.tsx`

Form fields:
- Guest count (number, default 1)
- Special notes (textarea, optional)
- Capacity warning if spots limited

Submit → Call server action → Show confirmation

### 9.3 Capacity Management
Check capacity in server action before insert:
```typescript
const { data: event } = await supabase
  .from('events_with_stats')
  .select('*')
  .eq('id', eventId)
  .single();

if (event.capacity && event.total_attendees + guest_count > event.capacity) {
  return { error: 'Event is full' };
}
```

---

## Phase 10: Error Handling & Loading (Week 6)

### 10.1 Error Boundaries
**Create:**
- `/app/error.tsx` - Global error
- `/app/events/error.tsx` - Events section errors
- `/app/events/[slug]/error.tsx` - Event detail errors

Use `moon.svg` in error states with friendly messages

### 10.2 Loading States
**Create:**
- `/app/loading.tsx` - Global loading
- `/app/events/loading.tsx` - Event list skeleton
- `/app/events/[slug]/loading.tsx` - Event detail skeleton

---

## Phase 11: SEO & Metadata (Week 6)

### 11.1 Root Metadata
**Update:** `/app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: {
    default: 'Event Horizon - Where Space Enthusiasts Gather',
    template: '%s | Event Horizon',
  },
  description: 'Discover space events, conferences, stargazing parties, and astronomy workshops.',
  openGraph: { /* ... */ },
  twitter: { /* ... */ },
};
```

### 11.2 Dynamic Metadata
**Add to:** `/app/events/[slug]/page.tsx`

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  return {
    title: event.title,
    description: event.description.slice(0, 160),
    openGraph: { /* event details */ },
  };
}
```

### 11.3 Structured Data
Add JSON-LD Event schema to event detail pages

---

## Phase 12: Mobile Responsiveness (Week 7)

### 12.1 Responsive Patterns
- Mobile-first Tailwind classes
- Touch-friendly buttons (min-height: 44px)
- Hamburger navigation on mobile
- Bottom sheets for modals on mobile
- Horizontal scroll for category filters
- Sticky header on scroll

### 12.2 Test Breakpoints
- Mobile: 320px - 640px
- Tablet: 768px - 1024px
- Desktop: 1024px+

---

## Phase 13: Testing & Deployment (Week 7-8)

### 13.1 Manual Testing Checklist
- [ ] Sign up with Google OAuth
- [ ] Sign up with email/password
- [ ] Create draft event
- [ ] Publish event
- [ ] Browse and filter events
- [ ] Register for event
- [ ] Capacity limits enforced
- [ ] Cancel registration
- [ ] Edit own event (not others')
- [ ] Mobile navigation works
- [ ] All forms validate correctly

### 13.2 Vercel Deployment
1. Connect GitHub repo to Vercel
2. Configure environment variables
3. Deploy to production
4. Update Supabase OAuth redirect URLs
5. Test in production

---

## Development Order (Step-by-Step)

### ✅ Already Completed
1. ✅ Installed Supabase packages
2. ✅ Created Supabase project & got credentials
3. ✅ Set up environment variables in `.env.local`
4. ✅ Configured Google OAuth in Supabase dashboard
5. ✅ Installed shadcn/ui for component library

### Week 1: Database & Client Setup (CURRENT PHASE)
1. **Create database schema** - `/lib/supabase/schema.sql` and run in Supabase SQL Editor
2. **Seed event categories** - Run `/lib/supabase/seed.sql`
3. **Create Supabase client utilities:**
   - `/lib/supabase/client.ts` (browser client)
   - `/lib/supabase/server.ts` (server client)
4. **Generate types** - Use Supabase CLI to generate `/types/database.types.ts`
5. **Create application types** - `/types/index.ts`
6. **Create validation schemas** - `/lib/validations.ts` with Zod
7. **Create utility functions** - `/lib/utils.ts`

### Week 2: Auth Pages & Theme
1. Create auth route handlers (`/app/auth/callback/route.ts`, `/app/auth/signout/route.ts`)
2. Create auth pages (`/app/auth/login/page.tsx`, `/app/auth/signup/page.tsx`)
3. Create auth components using shadcn (LoginForm, SignupForm, GoogleButton)
4. Implement middleware for protected routes (`/middleware.ts`)
5. Update `globals.css` with space theme and `black-hole-bg.svg`
6. Create Header component with `linear.png` logo
7. Create Footer component
8. Update `/app/layout.tsx` with Header/Footer

### Week 3: Events Core
1. **Install shadcn/ui components** - button, card, badge, input, select, dialog, skeleton, etc.
2. **Customize shadcn components** - Add glassmorphism and space theme variants
3. **Create EventCard component** - Use `moon.svg` for empty images
4. **Create event listing page** - `/app/events/page.tsx` (Server Component)
5. **Implement event filters** - Client component with shadcn Select
6. **Create event detail page** - `/app/events/[slug]/page.tsx`
7. **Create EventForm component** - Using shadcn form components
8. **Create event creation page** - `/app/events/create/page.tsx`
9. **Create server actions** - `/app/actions/events.ts` for CRUD operations

### Week 4: Registration & Profile
1. Create RegistrationModal component
2. Create EventRegistrationButton component
3. Implement registration server action with capacity check
4. Create `/app/profile/page.tsx` with tabs
5. Create "My Events" page
6. Create "My Registrations" page
7. Implement cancel registration

### Week 5: Polish
1. Replace landing page (`/app/page.tsx`) with hero + featured events
2. Add edit event functionality
3. Add event status management (draft/published/cancelled)
4. Implement event deletion
5. Add loading states and skeletons
6. Add error boundaries with `moon.svg`

### Week 6: SEO & UX
1. Add dynamic metadata to event pages
2. Add structured data (JSON-LD)
3. Improve form validation and error messages
4. Add success/confirmation messages
5. Optimize images and assets
6. Test accessibility

### Week 7: Mobile & Testing
1. Test all pages on mobile devices
2. Refine responsive navigation
3. Optimize touch interactions
4. Run through full testing checklist
5. Fix bugs and edge cases
6. Performance optimization

### Week 8: Launch
1. Set up Vercel project
2. Configure production environment variables
3. Run database migrations in production Supabase
4. Seed production categories
5. Update OAuth redirect URLs for production
6. Deploy to production
7. Final production testing
8. Monitor for errors

---

## Critical Files Summary

**Database:**
- `/lib/supabase/schema.sql` - Complete database schema with RLS
- `/lib/supabase/seed.sql` - Event categories seed data

**Infrastructure:**
- `/lib/supabase/client.ts` - Browser Supabase client
- `/lib/supabase/server.ts` - Server Supabase client
- `/middleware.ts` - Auth middleware

**Types:**
- `/types/database.types.ts` - Generated from Supabase
- `/types/index.ts` - Application types
- `/lib/validations.ts` - Zod schemas

**Theme:**
- `/app/globals.css` - Space theme with `black-hole-bg.svg`
- `/components/layout/Header.tsx` - Logo with `linear.png`

**Core Components:**
- `/components/events/EventCard.tsx` - Uses `moon.svg` as fallback
- `/components/events/EventRegistrationButton.tsx` - Registration logic
- `/components/ui/Card.tsx` - Glassmorphism styling

**Pages:**
- `/app/page.tsx` - Landing page with space theme
- `/app/events/page.tsx` - Event listing (Server Component)
- `/app/events/[slug]/page.tsx` - Event detail with dynamic metadata
- `/app/events/create/page.tsx` - Event creation form

**Server Actions:**
- `/app/actions/events.ts` - Event CRUD operations
- `/app/actions/registrations.ts` - Registration with capacity check

---

## Asset Integration Strategy

### Background (`black-hole-bg.svg`)
- Applied to `body` in `globals.css` with fixed attachment
- Semi-transparent overlay (70% opacity) for readability
- Used on landing page hero section

### Logo (`linear.png`)
- Header component top-left
- Size: ~40px height on desktop, ~32px on mobile
- Link to home page

### Decorative (`moon.svg`)
- Event card placeholder when no image provided
- Empty states ("No events found")
- 404 pages
- Loading states background

### Light Background (`light-bg.svg`)
- Reserved for future light mode implementation
- Not used in MVP (dark mode only)

---

## Post-MVP Features (Future)

- Full-text search with PostgreSQL
- Event tagging system (Mars, Rockets, Astrophotography)
- Waitlist when event reaches capacity
- Email notifications (registration, reminders, updates)
- Calendar integration (Google Calendar, iCal export)
- Supabase Storage for image uploads
- Organization profiles with logos
- Recurring events
- Event discussions/comments
- Advanced analytics for organizers
