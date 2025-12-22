# Docker Setup for Event Horizon

This setup runs the Next.js client in a Docker container while connecting to cloud Supabase.

## Quick Start

### 1. Stop any running dev servers
```bash
# If you have npm run dev running, stop it first (Ctrl+C)
```

### 2. Build and run with Docker Compose
```bash
docker-compose up --build
```

The app will be available at: **http://localhost:3000**

### 3. Stop the containers
```bash
# Ctrl+C in the terminal, or in a new terminal:
docker-compose down
```

## Docker Commands

### Build the image
```bash
docker-compose build
```

### Start in detached mode (background)
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f event-horizon-app
```

### Restart the container
```bash
docker-compose restart
```

### Stop and remove containers
```bash
docker-compose down
```

### Rebuild from scratch (clear cache)
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## How It Works

### Dockerfile
- Uses Node.js 20 Alpine (lightweight)
- Installs dependencies
- Runs `npm run dev` for hot reload

### docker-compose.yml
- Runs the Next.js app in a container
- Mounts your source code for live updates
- Passes environment variables from `.env.local`
- Exposes port 3000

### Volumes
- **Source code**: Mounted for hot reload (changes reflect immediately)
- **node_modules**: Anonymous volume (prevents overwriting)
- **.next**: Anonymous volume (Next.js build cache)

## Environment Variables

The container uses `.env.local` for configuration:
- `NEXT_PUBLIC_SUPABASE_URL` - Cloud Supabase instance
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public API key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side key

## Hot Reload

Thanks to volume mounting, **code changes are reflected immediately** without rebuilding:
1. Edit any file in your IDE
2. Next.js detects the change
3. Browser auto-refreshes

## Troubleshooting

### Port already in use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Dependencies out of sync
```bash
# Rebuild the container
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Can't connect to Supabase
- Verify `.env.local` has correct cloud Supabase URL
- Check internet connection (cloud Supabase requires network access)

### Changes not reflecting
```bash
# Restart the container
docker-compose restart
```

## Development Workflow

1. **Start containers**: `docker-compose up`
2. **Code changes**: Edit files in your IDE (auto-reloads)
3. **View logs**: Check terminal for errors
4. **Test**: Access http://localhost:3000
5. **Stop**: `Ctrl+C` or `docker-compose down`

## Production Build

To test a production build:

```bash
# Update Dockerfile CMD to:
# CMD ["npm", "run", "build", "&&", "npm", "start"]

# Or create a separate docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up --build
```
