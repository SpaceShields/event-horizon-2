# Event Horizon - Product Requirements Document

**Last Updated:** December 20, 2024
**Version:** 2.0
**Status:** In Development

---

## Executive Summary

**Event Horizon** is a specialized event management platform for the space industry, astronomy community, and space enthusiasts. It serves as the central hub for discovering, organizing, and attending space-related events including conferences, stargazing sessions, rocket launches, workshops, and space industry networking. The platform bridges professional aerospace organizations with public space education, making space exploration and astronomy accessible to everyone from NASA scientists to amateur stargazers.

---

## Product Overview

### Product Name
Event Horizon

### Vision Statement
To create the universe's premier platform for space-related events, connecting professionals, educators, and enthusiasts in their shared passion for space exploration, astronomy, and the cosmos.

### Tagline
*"Where Space Enthusiasts Gather"*

### Problem Statement

**For**: Space professionals, astronomers, educators, and space enthusiasts
**The problem is**: Space-related events (conferences, stargazing nights, rocket launches, workshops) are scattered across multiple platforms, astronomy clubs, space agencies, and private organizations with no central discovery system
**The impact of this problem**:
- Amateur astronomers miss local stargazing events and workshops
- Space professionals can't easily find industry networking opportunities
- Educational institutions struggle to promote STEM space programs
- Commercial space companies have limited reach for tourism and educational events
- NASA/ESA public events get low attendance due to poor discoverability

**A successful solution would**: Centralize all space-related events in one platform, making it easy to discover meteor showers, rocket launches, space conferences, telescope workshops, and astronomy socials while enabling organizers to reach their target audience efficiently.

---

## Target Users and Personas

### Primary User Segments

**Segment 1: Space Professionals** - Aerospace engineers, astrophysicists, mission specialists, and space industry professionals seeking conferences, workshops, and networking

**Segment 2: Amateur Astronomers** - Hobbyist stargazers looking for telescope nights, meteor shower viewing parties, and astronomy club meetups

**Segment 3: Space Organizations** - NASA, ESA, SpaceX, Blue Origin, astronomy clubs, observatories, and space education nonprofits organizing public events

**Segment 4: Space Enthusiasts & Families** - General public interested in space tourism, educational programs, planetarium shows, and family-friendly space events

**Segment 5: STEM Educators** - Teachers and institutions seeking field trips, student workshops, and educational space programs

### User Personas

#### Persona 1: Dr. Sarah Chen, Astrophysicist & Conference Organizer

- **Role**: Research Astrophysicist at NASA
- **Goals**:
  - Organize annual space symposium with 500+ attendees
  - Find speaking opportunities at space conferences
  - Network with international space research community
  - Promote space science to public through educational events
- **Pain Points**:
  - Current platforms aren't designed for technical space events
  - Hard to target aerospace professionals vs general public
  - No way to categorize by space topics (exoplanets, Mars, etc.)
  - Limited options for hybrid virtual/in-person events
- **Technical Proficiency**: Advanced
- **Key Behaviors**: Attends 5-6 conferences annually, organizes quarterly webinars, active in space research community

#### Persona 2: Commander Marcus Williams, Former NASA Astronaut

- **Role**: Public Speaker & Space Education Advocate
- **Goals**:
  - Inspire next generation through school visits and public talks
  - Find opportunities to share astronaut experiences
  - Connect with space tourism companies for speaking events
  - Support STEM education initiatives
- **Pain Points**:
  - Schools don't know how to find him for events
  - Space tourism companies lack platform to promote experiences
  - No centralized calendar of space education opportunities
- **Technical Proficiency**: Intermediate
- **Key Behaviors**: Travels extensively, manages tight schedule, active on social media

#### Persona 3: Elena Rodriguez, Amateur Astronomer

- **Role**: Software engineer by day, astronomy enthusiast by night
- **Goals**:
  - Find local stargazing events and meteor shower parties
  - Attend telescope workshops to improve skills
  - Join astronomy club meetups in her area
  - Share her astrophotography and discoveries
- **Pain Points**:
  - Events scattered across Facebook, Meetup, observatory websites
  - Misses celestial events (eclipses, meteor showers) due to lack of notifications
  - Can't filter events by beginner vs advanced
  - Hard to find equipment-specific workshops (astrophotography, telescope making)
- **Technical Proficiency**: Intermediate
- **Key Behaviors**: Checks weather and astronomy apps daily, owns telescope, follows space news

#### Persona 4: David Kim, Aerospace Engineering Student

- **Role**: Graduate student studying rocket propulsion
- **Goals**:
  - Network with space industry professionals for career opportunities
  - Attend career fairs and recruiting events at space companies
  - Find workshops on satellite technology and rocket science
  - Participate in space hackathons and competitions
- **Pain Points**:
  - Doesn't know about SpaceX/Blue Origin career events until too late
  - Competition information fragmented across university portals
  - Can't find mentor matching events with industry professionals
- **Technical Proficiency**: Advanced
- **Key Behaviors**: Active in university aerospace club, follows space startups, seeks internships

---

## Core Features and Functional Requirements

### Feature 1: Space Event Discovery & Browsing

**Description**: Users can discover space events through intuitive search, filtering, and browsing with space-specific categorization.

#### User Stories

**Story 1**: Event Browsing (MVP)
- **As a** space enthusiast, **I want to** browse upcoming space events by category (conferences, stargazing, launches, workshops), **so that** I can find events that match my interests
- **Acceptance Criteria**:
  1. Events categorized into: Conference, Workshop, Networking, Entertainment (stargazing), Community, Charity, Sports (zero-g), Other
  2. Each category displays custom icon and color coding
  3. Events show: title, date, location (physical/virtual), organizer, attendee count, price
  4. Event cards display thumbnail images from space imagery
  5. Load upcoming events within 1 second

**Story 2**: Event Filtering (Extended Feature)
- **As an** amateur astronomer, **I want to** filter events by category, location type, and price, **so that** I find relevant events quickly
- **Acceptance Criteria**:
  1. Category filter: Conference, Workshop, Networking, Entertainment, Sports, Community, Charity, Other
  2. Location filter: Physical, Virtual, or Hybrid
  3. Price filter: Free or Paid events
  4. Date range filter: Upcoming, This Week, This Month
  5. Filters apply immediately without page reload
  6. Clear all filters button
- **Post-MVP**: Advanced tag filtering (Astronomy, Rocket Science, Mars Exploration, etc.)

**Story 3**: Event Search (Extended Feature)
- **As a** user, **I want to** search for events by keywords like "Mars", "rocket launch", or "astrophotography", **so that** I can quickly find specific events
- **Acceptance Criteria**:
  1. Search bar prominently displayed on events page
  2. Full-text search across event title and description
  3. Search results update as user types (debounced)
  4. Show "No results" message with suggestions
  5. Recent searches saved locally

### Feature 2: Event Creation & Management

**Description**: Organizers can create and manage space events with rich details specific to astronomy and space activities.

#### User Stories

**Story 1**: Create Space Event (MVP)
- **As a** space organization or individual, **I want to** create an event for my rocket propulsion workshop, **so that** aerospace students can register
- **Acceptance Criteria**:
  1. Event form includes: Title, Description, Category, Start/End Date & Time
  2. Location options: Physical (address), Virtual (meeting URL), or Hybrid (both)
  3. Event details: Capacity limit, Ticket price (display only), Registration deadline
  4. Optional organization name field (simple text input, e.g., "International Space Exploration Society")
  5. Media upload: Event image/banner (space imagery recommended)
  6. Draft/Publish workflow: Save as draft before publishing
  7. Auto-generate SEO-friendly URL slug from title
  8. Registration instructions field (optional text for payment/registration details)
- **Post-MVP**: Rich text editor for description, tag selection, organization logos

**Story 2**: Organization Name Display (Extended Feature)
- **As the** International Space Exploration Society, **I want to** add our organization name to events, **so that** attendees know it's an official event
- **Acceptance Criteria**:
  1. Event creation form has optional "Organization Name" text field
  2. If provided, organization name displays on event card and detail page
  3. Organization name is searchable via full-text search
  4. Users can filter/search events by organization name
- **Post-MVP**: Full organization management (logos, members, roles, dedicated org pages)

**Story 3**: Event Status Management (MVP)
- **As an** event organizer, **I want to** manage event lifecycle (draft, published, ongoing, completed, cancelled), **so that** attendees see accurate event status
- **Acceptance Criteria**:
  1. Event status options: Draft, Published, Ongoing, Completed, Cancelled
  2. Only published events visible to public
  3. Draft events only visible to creator
  4. Organizer can cancel events with notification to registered users
  5. Status automatically updates based on start/end dates (optional)

### Feature 3: Event Registration & RSVP

**Description**: Users can register for space events and manage their attendance.

#### User Stories

**Story 1**: Event Registration (MVP)
- **As an** astronomy enthusiast, **I want to** register for the Perseid Meteor Shower viewing party, **so that** I can attend and receive updates
- **Acceptance Criteria**:
  1. "Register" button clearly visible on event page
  2. Registration requires user login (Google OAuth or email/password)
  3. Registration form includes: Guest count (optional), Special notes
  4. If event has ticket price, display price and payment instructions
  5. Registration confirmation shown immediately
  6. Notification sent to user confirming registration
  7. Organizer receives notification of new registration

**Story 2**: Capacity Management & Waitlist (Capacity = MVP | Waitlist Extended Feature)
- **As an** event organizer, **I want to** set capacity limits and automatically waitlist users when full, **so that** I don't overbook the venue
- **Acceptance Criteria**:
  1. Organizer sets capacity limit (or leave unlimited)
  2. Event page shows "X / Y spots filled" or "Unlimited capacity"
  3. When capacity reached, event marked as "Full"
  4. New registrations automatically added to waitlist
  5. Waitlist users notified when spot opens up (future feature)
  6. "Waitlist" badge displayed on event card

**Story 3**: Registration Management (MVP)
- **As a** registered user, **I want to** view my upcoming space events and cancel if needed, **so that** I can manage my schedule
- **Acceptance Criteria**:
  1. User profile shows "My Events" section
  2. Events grouped: Upcoming, Past, Cancelled
  3. Each event shows: Title, Date, Location, Registration status
  4. "Cancel Registration" button available for upcoming events
  5. Cancellation asks for confirmation
  6. Organizer notified when user cancels

### Feature 4: User Profiles & Authentication

**Description**: Users create profiles to register for events and manage their space interests.

#### User Stories

**Story 1**: User Registration with Google OAuth (MVP)
- **As a** new user, **I want to** sign up using my Google account, **so that** I can quickly create an account without filling forms
- **Acceptance Criteria**:
  1. "Sign in with Google" button on landing page
  2. OAuth flow redirects to Google authentication
  3. On successful auth, profile auto-created with: Email, Full name, Avatar from Google
  4. User redirected to events page after signup
  5. Session persists for 30 days

**Story 2**: User Profile Customization (Extended Feature)
- **As a** user, **I want to** add a bio and customize my profile, **so that** other space enthusiasts know my interests
- **Acceptance Criteria**:
  1. Profile page includes: Avatar, Full name, Bio (250 chars), Email
  2. Bio supports text description of space interests
  3. Avatar upload or use Google profile picture
  4. Email notifications toggle (enable/disable event reminders)
  5. Changes save immediately with confirmation

**Story 3**: Email/Password Authentication (Backup | MVP)
- **As a** user without Google, **I want to** register with email and password, **so that** I can still create an account
- **Acceptance Criteria**:
  1. "Sign up with Email" option available
  2. Form includes: Email, Password, Confirm Password, Full Name
  3. Password minimum 8 characters
  4. Email verification sent (optional for MVP)
  5. Login with email/password supported

### Feature 5: Notifications & Reminders (Extended Feature)

**Description**: Users receive notifications about event registrations, updates, and reminders.

**MVP Approach**: Registration confirmation shown on screen after successful registration. No email notifications or in-app notification center for MVP.

**Post-MVP User Stories**:

**Story 1**: Registration Confirmation (Extended Feature)
- **As a** user, **I want to** receive confirmation via email when I register for a space event, **so that** I have a record
- **Acceptance Criteria**:
  1. Email notification sent to user after registration
  2. Email includes: Event title, Date, Location, Registration details
  3. In-app notification center with registration confirmations
  4. Mark as read/unread functionality

**Story 2**: Event Reminders (Extended Feature)
- **As a** registered user, **I want to** receive reminders before events, **so that** I don't forget to attend
- **Acceptance Criteria**:
  1. Email reminder sent 24 hours before event
  2. Reminder includes: Event title, Start time, Location/Meeting link
  3. User can opt-out of reminders in profile settings

**Story 3**: Event Updates (Extended Feature)
- **As a** registered user, **I want to** be notified if event is updated or cancelled, **so that** I know about changes
- **Acceptance Criteria**:
  1. Notification sent when event time/location changes
  2. Notification sent when event is cancelled
  3. Notification shows what changed (time, location, etc.)
  4. Option to un-register if changes don't work for user

---

## Technical Requirements

### Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Shadcn, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage), Next.js server components
- **Authentication**: Supabase Auth (Google OAuth, Email/Password)
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage (event images, user avatars, org logos)
- **Hosting**: Vercel
- **Email**: Supabase Edge Functions with email service

### Database Schema (MVP)

**Core Tables** (4 tables for MVP):
- `profiles` - User profiles extending Supabase Auth
- `event_categories` - Predefined categories (Conference, Workshop, Networking, Entertainment, Sports, Community, Charity, Other)
- `events` - Core event data with owner_id (references profiles) and optional organization_name TEXT field
- `event_registrations` - User RSVPs and attendance tracking

**Post-MVP Additions** (to be added later):
- `event_tags` - Flexible tagging system for space topics
- `event_tag_mappings` - Many-to-many events ↔ tags
- `notifications` - In-app notification system
- `organizations` - Full organization management with logos and membership

**Key Features**:
- Row Level Security (RLS) for data access control (MVP)
- Automatic profile creation on user signup (via database trigger) (MVP)
- Capacity checking (MVP)
- auto-waitlist (via database trigger) (Extended Feature)
- Full-text search on events (title, description, organization_name) (Extended Feature)
- Database views for common queries (events_with_stats, upcoming_events) (MVP)
- Auto-generated event slugs for SEO-friendly URLs (MVP)

### API Design

Supabase provides REST API automatically. Key MVP operations:

- `GET /events` - List upcoming events (with filters for category, location, price)
- `GET /events/:id` - Get event details
- `POST /events` - Create new event (authenticated, sets owner_id to current user)
- `PATCH /events/:id` - Update event (owner only via RLS)
- `DELETE /events/:id` - Delete event (owner only via RLS)
- `POST /event_registrations` - Register for event (authenticated)
- `DELETE /event_registrations/:id` - Cancel registration (user only via RLS)
- `GET /profiles/:id` - Get user profile
- `GET /event_categories` - List all event categories

### Authentication Flow

1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. On success, Supabase creates auth.users record
4. Database trigger auto-creates profile in public.profiles
5. JWT token issued, stored in cookie
6. User redirected to events page
7. Session persists for 30 days (configurable)

### Storage Structure

**MVP will include string url's for event images**

**Buckets** (Extended Feature):
- `event-images` - Event cover images and banners (public, authenticated users can upload)
- `avatars` - User profile pictures (public, users can upload their own)

**Image Handling** (Extended Feature):
- Max upload size: 5MB
- Accepted formats: JPG, PNG, WebP
- Auto-resize to standard dimensions
- Served via Supabase CDN

---

## Non-Functional Requirements

### Performance

- Page load time < 2 seconds for 95% of users
- Event listing loads within 1 second
- Search results appear < 500ms after input
- Image thumbnails lazy-loaded
- Infinite scroll for event listings
- Real-time updates via Supabase Realtime (registration counts)

### Reliability and Availability

- 99.9% uptime target (Vercel + Supabase SLA)
- Automated backups via Supabase
- Graceful error handling with user-friendly messages
- Offline detection and messaging

### Security

- All data transmitted over HTTPS
- Passwords hashed via Supabase Auth (bcrypt)
- Row Level Security on all database tables
- OWASP Top 10 security practices
- No sensitive data in client logs
- Rate limiting on API endpoints

### Scalability

- Initial MVP designed for a small company to manage events
- Designed for 10,000+ concurrent users (Future)
- Database indexes on frequently queried fields
- CDN for static assets and images
- Horizontal scaling via Vercel Edge Functions

### Usability

- Responsive design: Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- Dark mode minimalistic with space theme aesthetic (stars, black holes)
- Accessible (WCAG 2.1 AA)
- Keyboard navigation support
- Touch-friendly UI for mobile
- Clear error messages and loading states

### Accessibility

- Semantic HTML with ARIA labels
- Alt text for all images
- Focus indicators for keyboard navigation
- Screen reader compatible
- Color contrast ratio > 4.5:1

---

## Out of Scope (MVP Phase)

Explicitly NOT included in initial release:

- Mobile native apps (iOS/Android)
- Payment processing (tickets listed but contact organizer for payment)
- Advanced analytics and reporting
- Social features (comments, event discussions)
- Calendar integration (Google Calendar, iCal export)
- Multi-language support
- Recurring events (weekly astronomy club, monthly meetups)
- Live streaming integration
- Event check-in system (QR codes)
- Sponsor/exhibitor management
- Custom event registration forms
- Event merchandise/swag sales
- Referral/affiliate program
- Advanced permissions (co-organizers, event teams)
- Event cloning/templates

These features are candidates for Phase 3 based on user feedback.

---

## Success Metrics

### Launch Goals (First 3 Months)

| Metric | Target | Measurement |
|--------|--------|-------------|
| User Signups | 20 users | Supabase Auth analytics |
| Events Created | 20 events | Database count |
| Event Registrations | 100 registrations | Database count |
| Monthly Active Users | 60% of signups | Active sessions |

### Key Performance Indicators (Ongoing)

- Average events per organization: > 3
- Registration to attendance ratio: > 70%
- Search success rate: > 80% (user finds event within 3 searches)
- Mobile vs Desktop traffic split
- Event category popularity distribution
- Geographic distribution of events

---

## Space Event Categories & Examples

### Conference
- International Space Symposiums
- Commercial spaceflight summits
- Planetary science conferences
- Asteroid mining forums

### Workshop
- Rocket propulsion hands-on labs
- Astrophotography workshops
- Telescope building classes
- Mars habitat design challenges
- Satellite technology training

### Networking
- Space professionals mixers
- Aerospace career fairs
- Industry meetups
- Startup pitch nights

### Entertainment
- Meteor shower viewing parties
- Eclipse watching events
- Planetarium shows
- Space movie nights
- Astronomy festivals

### Community
- Stargazing socials
- Telescope nights
- Astronomy club meetups
- Zero-gravity yoga
- Space trivia nights

### Charity
- STEM education fundraisers
- Telescope donation drives
- Space camp scholarships
- Observatory funding events

### Sports
- Zero-gravity competitions
- Astronomy challenges
- Space-themed runs/walks
- Rocket launch competitions

---

## Assumptions and Dependencies

### Key Assumptions

- Users have stable internet connection
- Users comfortable with web applications
- Space community will adopt centralized platform
- Organizations willing to migrate from existing platforms
- Event images available (Unsplash, NASA imagery, user uploads)

### Dependencies

- Supabase (database, auth, storage, edge functions)
- Vercel (hosting, edge network)
- Google OAuth (authentication)
- Email service (Resend or SendGrid for notifications)
- Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## Timeline and Milestones

### Phase 1: MVP Development (Weeks 1-8)

**Weeks 1-2: Foundation**
- Supabase project setup
- Database schema implementation
- Authentication (Google OAuth)
- Next.js project structure

**Weeks 3-4: Core Features**
- Event browsing
- Event search (Extended Feature)
- Event creation and management
- User profiles (Extended Feature)
- Organization setup (Extended Feature)

**Weeks 5-6: Registration & Notifications**
- Event registration flow
- Capacity
- Waitlist (Extended Feature)
- Notification system (Extended Feature)
- Email integration (Extended Feature)

**Weeks 7-8: Polish & Launch**
- UI/UX refinement (dark space theme)
- Testing and bug fixes
- Seed data with space events
- MVP Production deployment

### Phase 2: Post-MVP Enhancements

- Calendar integrations (Google Calendar, iCal)
- Advanced search (location-based, date ranges)
- Event discussions and Q&A
- Recurring events
- Enhanced analytics for organizers
- Mobile native apps

---

## Glossary

- **Event**: A space-related gathering (conference, stargazing, workshop, etc.)
- **Registration**: User RSVP to attend an event
- **Organization**: Space agency, astronomy club, or company hosting events
- **Tag**: Keyword for categorizing events (e.g., "Mars", "Telescope")
- **Capacity**: Maximum number of attendees for an event
- **Waitlist**: Queue for users when event reaches capacity
- **RLS**: Row Level Security - Supabase security feature

---

## Document Metadata

- **Document Owner**: Development Team
- **Last Updated**: December 20, 2024
- **Version**: 2.0
- **Status**: In Development
- **Next Review Date**: February 1, 2025

---

## References

- Event Horizon Codebase: `/event-horizon-2`
- Database Schema: `/lib/supabase/schema.sql`
- Seed Data: `/lib/supabase/seed.sql`
- Figma Design: (TBD)
- API Documentation: Supabase Auto-generated REST API

---

**Event Horizon** - Where Space Enthusiasts Gather 🚀✨
