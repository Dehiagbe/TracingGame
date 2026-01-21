# TracingGame - Vercel Serverless Refactoring

## Overview

This application has been completely refactored from a monolithic Express.js architecture to a serverless architecture optimized for Vercel deployment.

## What Changed

### Architecture Transformation

**Before (Monolithic):**
- Single Express.js server with port binding
- `pg.Pool` for database connections
- Development middleware bundled with production code
- Custom esbuild bundling process
- Session management and static file serving

**After (Serverless):**
- Serverless API functions in `/api` directory
- Neon serverless-compatible database client
- Separated development and production concerns
- Vite-only build process
- No server state or sessions

### Directory Structure

```
Adaptive-Trace-Gamification/
├── api/                      # Serverless API endpoints
│   ├── attempts.ts          # GET/POST /api/attempts
│   └── health.ts            # GET /api/health
├── client/                  # React frontend (unchanged)
│   ├── src/
│   └── index.html
├── lib/                     # Shared backend logic
│   ├── db.ts               # Neon database client
│   └── storage.ts          # Database operations
├── shared/                  # Shared types/schemas
│   ├── schema.ts           # Database schema
│   └── routes.ts           # API route definitions
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore patterns
├── DEPLOYMENT.md           # Deployment instructions
├── package.json            # Updated dependencies
├── vite.config.ts          # Simplified Vite config
└── vercel.json             # Vercel configuration (root level)
```

### Files Removed

The following files were incompatible with serverless and have been deleted:

- `server/index.ts` - Monolithic Express server
- `server/vite.ts` - Development middleware
- `server/static.ts` - Static file serving
- `server/routes.ts` - Express routes
- `server/db.ts` - pg.Pool connection
- `server/storage.ts` - Moved to `lib/storage.ts`
- `script/build.ts` - Custom build script

### New Files Created

- `api/attempts.ts` - Serverless function for attempts CRUD
- `api/health.ts` - Health check endpoint
- `lib/db.ts` - Neon serverless database client
- `lib/storage.ts` - Database operations (refactored from server/)
- `vercel.json` - Vercel deployment configuration
- `.env.example` - Environment variable template
- `.gitignore` - Build artifacts and dependencies
- `DEPLOYMENT.md` - Comprehensive deployment guide

### Dependency Changes

**Added:**
- `@vercel/node` - Vercel serverless function types
- `@neondatabase/serverless` - Serverless-compatible PostgreSQL driver

**Removed:**
- `pg` - Traditional PostgreSQL driver (not serverless-friendly)
- `express` - No longer needed (Vercel handles routing)
- `express-session` - Session management removed
- `connect-pg-simple` - Session store removed
- `passport` - Authentication removed
- `passport-local` - Authentication removed
- `memorystore` - Session store removed
- `ws` - WebSocket support removed
- `esbuild` - No longer needed for custom builds

### Configuration Updates

**package.json scripts:**
```json
{
  "dev": "vite",                    // Direct Vite dev server
  "build": "vite build && tsc",     // Simple Vite build + type check
  "preview": "vite preview",        // Preview production build
  "check": "tsc",                   // Type checking
  "db:push": "drizzle-kit push"     // Database migrations
}
```

**vite.config.ts:**
- Removed development-specific plugins
- Simplified build configuration
- Changed output directory from `dist/public` to `dist`

**tsconfig.json:**
- Updated includes: `["client/src/**/*", "shared/**/*", "api/**/*", "lib/**/*"]`
- Removed `server/**/*` include

## API Endpoints

### POST /api/attempts
Creates a new tracing attempt.

**Request Body:**
```json
{
  "shape": "circle",
  "attentionScore": 85,
  "precisionScore": 90,
  "assistanceCount": 2,
  "durationMs": 15000
}
```

**Response:** 201 Created
```json
{
  "id": 1,
  "shape": "circle",
  "attentionScore": 85,
  "precisionScore": 90,
  "assistanceCount": 2,
  "durationMs": 15000,
  "completedAt": "2026-01-08T00:00:00.000Z"
}
```

### GET /api/attempts
Retrieves all tracing attempts, ordered by completion time.

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "shape": "circle",
    "attentionScore": 85,
    "precisionScore": 90,
    "assistanceCount": 2,
    "durationMs": 15000,
    "completedAt": "2026-01-08T00:00:00.000Z"
  }
]
```

### GET /api/health
Health check endpoint.

**Response:** 200 OK
```json
{
  "status": "healthy",
  "timestamp": "2026-01-08T00:00:00.000Z"
}
```

## Database

The application uses **Neon** (neon.tech) for PostgreSQL hosting, which is optimized for serverless architectures:

- **Connection Management**: HTTP-based connections, no connection pooling required
- **Cold Start Optimization**: Fast initialization for serverless functions
- **Auto-scaling**: Automatically scales with traffic
- **Auto-suspend**: Free tier pauses after inactivity to save resources

### Schema

```sql
CREATE TABLE attempts (
  id SERIAL PRIMARY KEY,
  shape TEXT NOT NULL,
  attention_score INTEGER NOT NULL,
  precision_score INTEGER NOT NULL,
  assistance_count INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

Required environment variables (set in Vercel dashboard):

- `DATABASE_URL` - Neon PostgreSQL connection string
- `NODE_ENV` - Set to "production"

Example Neon connection string:
```
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy:**
```bash
# 1. Set up Neon database and get connection string
# 2. Push schema to database
export DATABASE_URL="your-neon-connection-string"
npm run db:push

# 3. Deploy to Vercel
vercel --prod
```

## Development

### Local Development Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Get your Neon database connection string from https://console.neon.tech

3. Update `.env` with your actual database credentials (replace the placeholder values):
   ```
   DATABASE_URL=postgresql://your_username:your_password@your_hostname.neon.tech/your_database?sslmode=require&channel_binding=require
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Push database schema:
   ```bash
   npm run db:push
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

The Vite dev server will run on http://localhost:5173

**Note:** In development, API calls will need to point to your deployed Vercel API or a local serverless function emulator.

## Benefits of Serverless Architecture

1. **Auto-scaling**: Handles traffic spikes automatically
2. **Cost-effective**: Pay only for actual usage
3. **Zero maintenance**: No servers to manage
4. **Global CDN**: Fast content delivery worldwide
5. **Instant deployments**: Push to deploy in seconds
6. **Zero downtime**: Rolling deployments
7. **Better DX**: Simplified development workflow

## Frontend

The React frontend remains unchanged and continues to:
- Display tracing game canvas
- Track user attempts with attention and precision metrics
- Submit results to the API
- Display leaderboard/history

All game functionality is preserved identically.

## Testing

After deployment, verify:
1. ✅ Frontend loads at root URL
2. ✅ POST to `/api/attempts` creates records
3. ✅ GET from `/api/attempts` retrieves records
4. ✅ Canvas game works identically to original
5. ✅ No console errors
6. ✅ Database connections work without cold start issues

## Troubleshooting

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for common issues and solutions.

## License

MIT
