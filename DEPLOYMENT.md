# Event Horizon - Deployment Guide

Step-by-step guide for deploying Event Horizon to production.

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] RLS policies verified
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] All dependencies up to date

---

## Option 1: Deploy to Vercel (Recommended)

Vercel is the recommended platform for Next.js applications.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From the project root:

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- Project name? `event-horizon` (or your preferred name)
- Directory? `./` (current directory)
- Override settings? **No**

### Step 4: Configure Environment Variables

After deployment, go to your Vercel project dashboard:

1. Navigate to **Settings** → **Environment Variables**
2. Add the following variables for **Production**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id (if using OAuth)
```

3. Click **Save**

### Step 5: Update Supabase Settings

1. Go to your Supabase project
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to:
   - **Site URL**: `https://your-domain.vercel.app`
   - **Redirect URLs**: Add `https://your-domain.vercel.app/auth/callback`

### Step 6: Redeploy

Trigger a new deployment to apply environment variables:

```bash
vercel --prod
```

Your site is now live at: `https://your-domain.vercel.app`

---

## Option 2: Deploy to Other Platforms

### Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build the project:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod
```

4. Set environment variables in Netlify Dashboard

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t event-horizon .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=your-url event-horizon
```

---

## Post-Deployment Steps

### 1. Verify Deployment

- [ ] Visit your production URL
- [ ] Test user signup
- [ ] Test user login
- [ ] Create a test event
- [ ] Register for an event
- [ ] Check dashboard
- [ ] Test on mobile devices

### 2. Configure Custom Domain (Optional)

#### On Vercel:
1. Go to **Settings** → **Domains**
2. Add your domain: `yourdomain.com`
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` environment variable
5. Update Supabase redirect URLs

### 3. Set Up Analytics (Optional)

#### Vercel Analytics:
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### Google Analytics:
Add to `app/layout.tsx`:
```typescript
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_ID" />
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_ID');
  `}
</Script>
```

### 4. Set Up Error Monitoring (Optional)

#### Sentry:
```bash
npm install @sentry/nextjs
```

Follow Sentry Next.js setup wizard:
```bash
npx @sentry/wizard -i nextjs
```

---

## Environment-Specific Configuration

### Development
```env
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Staging (Optional)
```env
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SITE_URL=https://staging.yourdomain.com
```

### Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Database Considerations

### Production Database

Consider using a separate Supabase project for production:

1. Create new Supabase project for production
2. Run the same migrations
3. Use production credentials in Vercel
4. Keep development and production data separate

### Backup Strategy

Supabase provides automatic backups, but consider:

- Enable Point-in-Time Recovery (PITR)
- Export data regularly
- Document restoration procedures

---

## Security Checklist

### Before Going Live

- [ ] All API keys in environment variables (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] RLS policies enabled on all tables
- [ ] Service role key only used server-side
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] CORS configured correctly
- [ ] Rate limiting considered (Vercel Edge Config)
- [ ] Google OAuth redirect URLs configured
- [ ] No console.logs with sensitive data

---

## Performance Optimization

### Before Launch

1. **Enable Compression**
   - Automatic on Vercel

2. **Image Optimization**
   - Use Next.js Image component (already implemented)

3. **Database Indexes**
   - Already created on key fields

4. **Caching**
   - Configure in `next.config.ts` if needed

5. **Edge Functions**
   - Consider for high-traffic routes

---

## Monitoring & Maintenance

### Set Up Monitoring

1. **Uptime Monitoring**
   - UptimeRobot (free)
   - StatusCake
   - Pingdom

2. **Performance Monitoring**
   - Vercel Analytics
   - Google PageSpeed Insights
   - Web Vitals

3. **Error Tracking**
   - Sentry
   - LogRocket
   - Rollbar

### Regular Maintenance

- Weekly: Check error logs
- Monthly: Review performance metrics
- Quarterly: Update dependencies
- As needed: Scale database resources

---

## Scaling Considerations

### When You Grow

1. **Database**
   - Upgrade Supabase plan
   - Add read replicas
   - Optimize slow queries

2. **Application**
   - Vercel scales automatically
   - Consider Edge Runtime for API routes
   - Implement caching strategies

3. **Storage**
   - Upgrade Supabase Storage
   - Consider CDN for images

---

## Rollback Procedure

If deployment fails or has issues:

### On Vercel

1. Go to **Deployments** in Vercel Dashboard
2. Find the last working deployment
3. Click **⋮** → **Promote to Production**

### Manual Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or force push previous commit
git reset --hard HEAD~1
git push --force origin main
```

---

## DNS Configuration

If using a custom domain, configure DNS:

### For Vercel

Add these records to your DNS provider:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Wait for DNS propagation (5 minutes - 24 hours).

---

## SSL/TLS Certificate

### Vercel
- Automatic SSL via Let's Encrypt
- Certificate auto-renewal
- HTTP to HTTPS redirect enabled by default

### Other Platforms
- Use Certbot for Let's Encrypt
- Configure Cloudflare SSL

---

## Common Deployment Issues

### Issue: Build Fails

**Solution:**
- Check build logs in Vercel
- Verify all dependencies are in `package.json`
- Ensure TypeScript compiles locally

### Issue: Environment Variables Not Working

**Solution:**
- Restart Vercel build after adding variables
- Ensure variables are added to correct environment (Production/Preview)
- Variables must start with `NEXT_PUBLIC_` to be available in browser

### Issue: 404 on Routes

**Solution:**
- Verify route files exist
- Check file naming conventions
- Rebuild and redeploy

### Issue: Database Connection Fails

**Solution:**
- Verify Supabase URL and keys
- Check Supabase project is active
- Verify RLS policies allow access

---

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Next.js Community**: https://github.com/vercel/next.js/discussions

---

## Launch Checklist

Final check before going live:

- [ ] Production build succeeds
- [ ] All environment variables set
- [ ] Supabase configured for production domain
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Google OAuth working (if enabled)
- [ ] Test user signup/login
- [ ] Test event creation
- [ ] Test event registration
- [ ] Mobile responsive verified
- [ ] Analytics configured (if applicable)
- [ ] Error monitoring set up (if applicable)
- [ ] Backup strategy in place
- [ ] Documentation updated

---

**Ready to launch!**

**Event Horizon** - Deployment Guide
