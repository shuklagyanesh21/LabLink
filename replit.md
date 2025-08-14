# SharmaG_omics Lab Management System

## Overview

This is a lab management web application for SharmaG_omics Lab featuring a shared calendar, member management, presentation rotation system, and announcements dashboard. The application is designed as a desktop-first, mobile-responsive single-instance web app that operates without authentication - instead using a simple "Admin Mode" toggle for management controls. The system manages lab members, schedules meetings/presentations, tracks presentation rotation, and displays announcements, all with data persistence in PostgreSQL and an optional in-memory storage fallback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: React Context for global admin mode state, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas
- **Date Handling**: date-fns library for date manipulation and formatting

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints with JSON responses
- **Validation**: Zod schemas shared between client and server
- **Development**: Vite middleware integration for hot reloading

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Fallback Storage**: In-memory storage with optional JSON file persistence
- **Data Models**: Members, Meetings, Rotation, Announcements, and Audit Logs

### Authentication and Authorization
- **No Traditional Auth**: Uses a simple frontend toggle for "Admin Mode"
- **Public Access**: Read-only access by default for all users
- **Admin Controls**: Management features only visible when admin mode is enabled
- **Session Management**: No user sessions or login system required

### Key Design Patterns
- **Shared Schema**: TypeScript types and Zod validation schemas shared between frontend and backend
- **Storage Abstraction**: Interface-based storage layer supporting both database and in-memory backends
- **Component Architecture**: Modular React components with clear separation of concerns
- **Form Management**: Centralized form handling with consistent validation patterns
- **Error Handling**: Comprehensive error boundaries and toast notifications

## External Dependencies

- **Database**: Neon serverless PostgreSQL for production data persistence
- **UI Components**: Radix UI primitives for accessible component foundations
- **Build Tools**: Vite for fast development and optimized production builds
- **Validation**: Zod for runtime type checking and form validation
- **Date Management**: date-fns for timezone-aware date operations (IST/Asia/Kolkata)
- **Development**: Replit-specific plugins for enhanced development experience
- **Styling**: Tailwind CSS for utility-first styling approach