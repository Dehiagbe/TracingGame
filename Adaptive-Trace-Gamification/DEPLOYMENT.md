# Deployment Guide for TracingGame on Vercel

This guide will walk you through deploying the TracingGame application to Vercel with a Neon PostgreSQL database.

## Prerequisites

- A [Vercel](https://vercel.com) account
- A [Neon](https://neon.tech) account for serverless PostgreSQL
- Git repository connected to Vercel

## Step 1: Set Up Neon Database

1. **Create a Neon Project**
   - Go to [Neon Console](https://console.neon.tech)
   - Create a new project
   - Choose a region close to your users
   - Copy the connection string (it will look like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)

2. **Run Database Migrations**
   ```bash
   cd Adaptive-Trace-Gamification
   
   # Set your DATABASE_URL
   export DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   
   # Push the schema to your database
   npm run db:push
   ```

## Step 2: Configure Vercel

1. **Import Your Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `cd Adaptive-Trace-Gamification && npm install && npm run build`
   - Output Directory: `Adaptive-Trace-Gamification/dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the following variables:
     - `DATABASE_URL`: Your Neon connection string
     - `NODE_ENV`: `production`

## Step 3: Deploy

1. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```
   
   Or push to your main branch if you have automatic deployments enabled.

2. **Verify Deployment**
   - Frontend should be accessible at your Vercel URL
   - Test API endpoints:
     - `GET https://your-domain.vercel.app/api/health`
     - `GET https://your-domain.vercel.app/api/attempts`
     - `POST https://your-domain.vercel.app/api/attempts`

## Architecture Overview

The application has been refactored for serverless deployment:

### Directory Structure
```
/
├── api/                      # Serverless API functions
│   ├── attempts.ts          # CRUD operations for attempts
│   └── health.ts            # Health check endpoint
├── client/                  # React frontend
├── lib/                     # Shared backend logic
│   ├── db.ts               # Neon serverless database client
│   └── storage.ts          # Database operations
├── shared/                  # Shared types and schemas
├── vercel.json             # Vercel configuration
└── package.json
```

### Key Changes from Monolithic Architecture

1. **Serverless Functions**: Each API endpoint is now a separate serverless function in the `api/` directory
2. **Neon Database**: Uses `@neondatabase/serverless` driver instead of `pg` Pool for serverless compatibility
3. **No Server Process**: Removed Express server, port binding, and session management
4. **Static Frontend**: Vite builds static files served by Vercel's CDN
5. **Environment Variables**: All configuration through Vercel environment variables

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` includes `?sslmode=require` for Neon
- Check that your Neon project is active (free tier projects pause after inactivity)
- Verify the connection string has the correct credentials

### Cold Start Issues
- Neon serverless driver is optimized for cold starts
- First request after idle period may take longer
- Consider upgrading Neon plan for better performance

### Build Failures
- Check that all dependencies are installed
- Verify TypeScript compiles without errors: `npm run check`
- Review build logs in Vercel dashboard

### API Errors
- Check Vercel Function Logs in the dashboard
- Verify environment variables are set correctly
- Test API endpoints directly with curl or Postman

## Monitoring

- **Vercel Analytics**: Monitor page views and performance
- **Vercel Logs**: Real-time logs for serverless functions
- **Neon Console**: Database query performance and connection metrics

## Scaling

The serverless architecture automatically scales with traffic:
- Vercel handles frontend CDN and function scaling
- Neon scales database connections automatically
- No manual infrastructure management required

## Cost Optimization

- **Vercel Free Tier**: Includes generous limits for hobby projects
- **Neon Free Tier**: 0.5 GB storage, auto-suspend after inactivity
- **Upgrade When Needed**: Both platforms offer paid tiers for production workloads

## Support

- Vercel Documentation: https://vercel.com/docs
- Neon Documentation: https://neon.tech/docs
- Project Issues: https://github.com/Dehiagbe/TracingGame/issues
