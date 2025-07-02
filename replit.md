# Joyville Toy Store - Full Stack Web Application

## Overview

Joyville is a full-stack toy-selling web application built with React, Express, and PostgreSQL. The application features two distinct sections (retail and wholesale) with separate inventories, managed by a superadmin. The design targets children with a joyful, colorful aesthetic using a custom color palette.

## System Architecture

The application follows a modern full-stack architecture:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based authentication
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state

## Key Components

### Frontend Architecture
- **React Router**: wouter for client-side routing
- **UI Framework**: shadcn/ui components with custom Joyville theme
- **Styling**: Tailwind CSS with custom color variables (mint, sky, sunny, purple, coral, turquoise)
- **Forms**: React Hook Form with Zod validation
- **API Client**: Custom fetch wrapper with TanStack Query

### Backend Architecture
- **Server**: Express.js with middleware for logging, CORS, and error handling
- **Authentication**: Express sessions with bcrypt password hashing
- **Database**: Drizzle ORM with Neon PostgreSQL
- **API Design**: RESTful endpoints for CRUD operations

### Database Schema
- **Users**: Authentication with role-based access (superadmin, customer)
- **Categories**: Toy categories with icons and colors
- **Products**: Separate inventories for retail/wholesale sections
- **Cart**: Session-based shopping cart
- **Orders**: Order management with line items

## Data Flow

1. **User Authentication**: Session-based auth with secure password hashing
2. **Product Management**: Superadmin can CRUD products in separate retail/wholesale inventories
3. **Shopping Experience**: Customers browse categories, search products, and manage cart
4. **Order Processing**: Cart items convert to orders with tracking

## External Dependencies

- **Database**: Neon PostgreSQL (@neondatabase/serverless)
- **UI Components**: Radix UI primitives via shadcn/ui
- **Validation**: Zod for schema validation
- **Authentication**: bcrypt for password hashing
- **Session Store**: connect-pg-simple for PostgreSQL session storage

## Deployment Strategy

- **Development**: Vite dev server with Express API server
- **Build Process**: Vite builds frontend to dist/public, esbuild bundles backend
- **Production**: Node.js serves built Express app with static files
- **Database**: Drizzle migrations via `npm run db:push`

## Changelog

- July 02, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.