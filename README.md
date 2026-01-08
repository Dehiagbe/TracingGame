# TracingGame - Adaptive Trace Gamification

A full-stack React + Express application with PostgreSQL database for adaptive tracing gamification.

## Project Structure

The main application is located in the `Adaptive-Trace-Gamification/` directory:
- **Frontend**: React + Vite (outputs to `dist/public`)
- **Backend**: Express.js with TypeScript (in `server/`)
- **Database**: PostgreSQL with Drizzle ORM
- **API Routes**: RESTful API endpoints under `/api`

## Local Development

### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Dehiagbe/TracingGame.git
cd TracingGame/Adaptive-Trace-Gamification
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your actual database credentials
```

4. Push database schema:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Deployment to Vercel

### Prerequisites

- Vercel account (free or paid)
- PostgreSQL database (Vercel Postgres, Neon, Supabase, or any PostgreSQL provider)

### Step 1: Prepare Your Database

1. **Option A: Vercel Postgres**
   - In your Vercel project, go to "Storage" tab
   - Create a new Postgres database
   - Vercel will automatically set the `DATABASE_URL` environment variable

2. **Option B: External PostgreSQL Provider (Neon, Supabase, etc.)**
   - Create a PostgreSQL database with your provider
   - Copy the connection string (it should look like: `postgresql://user:password@host:port/database`)

### Step 2: Deploy to Vercel

#### Via Vercel CLI:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the repository root:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy: Yes
   - Which scope: Select your account/team
   - Link to existing project: No (or Yes if re-deploying)
   - Project name: Choose a name
   - Directory: `./` (repository root)

#### Via Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

### Step 3: Configure Environment Variables

In the Vercel Dashboard for your project:

1. Go to "Settings" → "Environment Variables"
2. Add the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:password@host:port/database` | PostgreSQL connection string |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Server port (optional, Vercel handles this) |

3. Click "Save"

### Step 4: Push Database Schema (First Time Only)

After deployment, you need to push your database schema:

1. Install Vercel CLI locally if not already installed
2. Pull environment variables:
```bash
cd Adaptive-Trace-Gamification
vercel env pull .env.local
```

3. Push database schema:
```bash
npm run db:push
```

### Step 5: Redeploy (if needed)

If you added environment variables after initial deployment:
```bash
vercel --prod
```

## Environment Variables Reference

Create a `.env` file in the `Adaptive-Trace-Gamification/` directory with:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database_name

# Server Configuration
NODE_ENV=production
PORT=5000
```

See `.env.example` for a template.

## Build Configuration

The project uses:
- **Vite** for frontend builds (outputs to `dist/public`)
- **esbuild** for backend bundling (outputs to `dist/index.cjs`)
- **Vercel Serverless Functions** for API routes

Build command: `npm run build`

## API Routes

All API endpoints are prefixed with `/api`:
- `POST /api/attempts/create` - Create a new attempt
- `GET /api/attempts/list` - List all attempts

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Radix UI
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL, Drizzle ORM
- **Deployment**: Vercel (Serverless Functions)
- **Authentication**: Passport.js (ready for session management)

## Troubleshooting

### Build Errors

If builds fail:
1. Check that all environment variables are set
2. Ensure `DATABASE_URL` is properly formatted
3. Check Vercel build logs for specific errors

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check that your database allows connections from Vercel's IP ranges
3. For Vercel Postgres, ensure connection pooling is configured

### API Routes Not Working

1. Verify the `vercel.json` configuration is in the repository root
2. Check that `api/index.js` exists in `Adaptive-Trace-Gamification/`
3. Review Vercel function logs for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT
