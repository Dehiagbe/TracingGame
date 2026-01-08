# Adaptive Tracing Assessment Game

## Overview

This is an adaptive tracing assessment game designed for evaluating attention, precision, and behavior through shape-tracing exercises. The application presents users with various geometric shapes (lines, circles, squares, stars, etc.) that they must trace with their finger or pointer. The game tracks performance metrics including attention score, precision score, assistance count, and duration, storing results in a PostgreSQL database for later analysis.

The application is built as a full-stack TypeScript project with a React frontend using HTML5 Canvas for the tracing interface, and an Express backend for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Animations**: Framer Motion for UI transitions and overlays
- **Canvas Rendering**: Native HTML5 Canvas API for shape drawing and tracing detection
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Structure**: Simple REST endpoints defined in shared/routes.ts with Zod validation
- **Development**: Vite middleware integration for HMR during development

### Data Storage
- **Database**: PostgreSQL (required via DATABASE_URL environment variable)
- **Schema Location**: shared/schema.ts defines the `attempts` table
- **Migrations**: Drizzle Kit with migrations output to ./migrations folder
- **Session Storage**: Uses connect-pg-simple for PostgreSQL session storage

### Key Design Patterns
- **Shared Types**: Schema and route definitions in /shared folder are consumed by both client and server
- **Type-safe API**: Zod schemas validate both input and output at API boundaries
- **Component Architecture**: Presentational components in /client/src/components, page components in /client/src/pages

### Game Mechanics
- Shape tracing with safe zone boundary detection
- 5-second idle timeout triggers ghost trace demonstration
- Intro demo shows pointer tracing the shape before user interaction
- Adaptive scaling to fill 85% of viewport on any device
- Support for both portrait and landscape orientations

## External Dependencies

### Database
- **PostgreSQL**: Required for data persistence. Connection via DATABASE_URL environment variable.

### UI Libraries
- **Radix UI**: Full suite of accessible, unstyled UI primitives
- **Shadcn/ui**: Pre-configured component library using Radix + Tailwind

### Animation & Effects
- **Framer Motion**: Animation library for React components
- **Canvas Confetti**: Celebration effects on shape completion

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **Vite**: Frontend build tool with React plugin
- **TSX**: TypeScript execution for server
- **Replit Plugins**: Error overlay, cartographer, and dev banner for Replit environment