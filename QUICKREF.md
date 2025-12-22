# Event Horizon - Quick Reference

Fast reference for common development tasks.

---

## Environment Setup

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit with your Supabase credentials
# Get from: https://app.supabase.com/project/_/settings/api
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

---

## Common File Paths

### Pages
- Landing: `app/page.tsx`
- Login: `app/auth/login/page.tsx`
- Signup: `app/auth/signup/page.tsx`
- Events List: `app/events/page.tsx`
- Event Detail: `app/events/[slug]/page.tsx`
- Create Event: `app/events/new/page.tsx`
- Edit Event: `app/events/edit/[slug]/page.tsx`
- Dashboard: `app/dashboard/page.tsx`

### Components
- Navigation: `components/navigation.tsx`
- Event Card: `components/event-card.tsx`
- Event Form: `components/event-form.tsx`
- Filters: `components/event-filters.tsx`

### Config
- Supabase Browser: `lib/supabase/client.ts`
- Supabase Server: `lib/supabase/server.ts`
- Middleware: `middleware.ts`
- Database Types: `lib/types/database.ts`
- Utilities: `lib/utils.ts`

---

## Supabase Database

### Tables
- `profiles` - User profiles (auto-created on signup)
- `event_categories` - 8 pre-seeded categories
- `events` - Event data
- `event_registrations` - User RSVPs
- `events_with_stats` - View with registration counts

### Quick Queries

```sql
-- View all events
SELECT * FROM events ORDER BY start_datetime DESC;

-- View events with stats
SELECT * FROM events_with_stats WHERE status = 'published';

-- View user registrations
SELECT * FROM event_registrations WHERE user_id = 'user-uuid';

-- View categories
SELECT * FROM event_categories;

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## Common Supabase Operations

### From Browser (Client Component)
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Sign in
await supabase.auth.signInWithPassword({ email, password })

// Sign out
await supabase.auth.signOut()

// Query data
const { data } = await supabase
  .from('events')
  .select('*')
  .eq('status', 'published')
```

### From Server (Server Component/Action)
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()

// Same API as browser client
const { data } = await supabase.from('events').select('*')
```

---

## Adding a New Page

1. Create file in `app/` directory
```typescript
// app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page</div>
}
```

2. Add to navigation (optional)
```typescript
// components/navigation.tsx
<Link href="/new-page">New Page</Link>
```

3. Protect route (if needed)
```typescript
// lib/supabase/middleware.ts
if (!user && request.nextUrl.pathname.startsWith('/new-page')) {
  return NextResponse.redirect('/auth/login')
}
```

---

## Adding a New Component

```bash
# Create component file
touch components/my-component.tsx
```

```typescript
// components/my-component.tsx
export function MyComponent() {
  return <div>My Component</div>
}
```

```typescript
// Import and use
import { MyComponent } from '@/components/my-component'
```

---

## Database Migrations

Using Supabase MCP:

```typescript
// Example migration
await mcp__supabase__apply_migration({
  name: 'add_new_column',
  query: `
    ALTER TABLE events
    ADD COLUMN new_column TEXT;
  `
})
```

Or use Supabase SQL Editor directly.

---

## Common Issues & Fixes

### "Invalid API key"
- Check `.env.local` has correct Supabase URL and keys
- Restart dev server after changing env vars

### Build fails
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Auth not working
- Check Supabase Auth is enabled
- Verify redirect URLs in Supabase Dashboard
- Clear browser cookies

### Database query fails
- Check RLS policies in Supabase
- Verify user is authenticated
- Check table permissions

---

## Deployment Quick Steps

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# Update Supabase redirect URLs for production domain
```

---

## Helpful Commands

```bash
# Check TypeScript errors
npx tsc --noEmit

# Format code (if prettier configured)
npx prettier --write .

# Clear Next.js cache
rm -rf .next

# View all routes
npx next info

# Analyze bundle size
npm run build && npx @next/bundle-analyzer
```

---

## URLs for Testing

- Dev server: http://localhost:3000
- Supabase Studio: http://localhost:3001 (if using local Supabase)
- Supabase Dashboard: https://app.supabase.com

---

## Key Keyboard Shortcuts (VS Code)

- `Ctrl+P` - Quick file open
- `Ctrl+Shift+P` - Command palette
- `F12` - Go to definition
- `Ctrl+/` - Toggle comment
- `Ctrl+Space` - Trigger autocomplete

---

## Environment-Specific URLs

### Development
- Site: http://localhost:3000
- Supabase: Your project URL

### Production
- Site: Your domain
- Supabase: Same project URL (or separate prod project)

---

## Git Workflow

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push
git push origin main

# Pull latest
git pull origin main
```

---

## Documentation Links

- **Full Setup**: [SETUP.md](./SETUP.md)
- **Quick Start**: [README.md](./README.md)
- **Requirements**: [mvp-requirements.md](./mvp-requirements.md)
- **Architecture**: [CLAUDE.md](./CLAUDE.md)
- **Summary**: [MVP-SUMMARY.md](./MVP-SUMMARY.md)

---

**Event Horizon** - Quick Reference Card
