# Expedition America Traveler Support Hub

## Overview

This is a comprehensive traveler support and customer service web application designed to provide 24/7 assistance to travelers using Expedition America and SBA City Guide services. The platform combines real-time customer service, smart itinerary management, and AI-powered travel assistance to ensure travelers feel personally looked after throughout their journey.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **UI Components**: Radix UI primitives for accessibility and consistency

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Real-time Communication**: WebSocket for live chat functionality
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with WebSocket support

### Database Schema
The application uses PostgreSQL with the following key entities:
- **Users**: Multi-role system (traveler, agent, admin) with authentication
- **Trips**: Travel itineraries with dates, destinations, and status tracking
- **Activities**: Individual trip activities with scheduling and details
- **Chat Messages**: Real-time messaging between travelers and agents
- **Support Requests**: Ticketing system for customer service issues
- **Notifications**: Alert system for important updates
- **Access Codes**: Secure authentication mechanism for travelers

## Key Components

### Multi-User Dashboard System
- **Traveler Dashboard**: Personal trip management, chat support, and notifications
- **Agent Panel**: Customer service interface for managing assigned travelers
- **Admin Console**: System management, user administration, and analytics

### Real-time Communication
- **Live Chat Widget**: Embedded chat for immediate support
- **WebSocket Integration**: Real-time messaging with fallback to HTTP polling
- **Public Chat Widget**: Embeddable widget for external websites

### Customer Service Features
- **Support Request System**: Ticketing system with priority levels
- **Emergency SOS**: Instant emergency contact functionality
- **Proactive Notifications**: Automated alerts and reminders
- **Trip Modification**: Booking changes and activity management

### External Integration
- **Public Chat Widget**: Standalone JavaScript widget for external sites
- **API Endpoints**: RESTful services for third-party integrations
- **CORS Configuration**: Cross-origin support for widget embedding

## Data Flow

1. **Authentication**: Users authenticate via secure access codes
2. **Trip Management**: Travelers view and manage their active trips
3. **Real-time Support**: Chat messages flow through WebSocket connections
4. **Notification System**: Alerts are pushed to users based on trip events
5. **Support Ticketing**: Issues are tracked from creation to resolution

## External Dependencies

- **@neondatabase/serverless**: Database connectivity
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **express-session**: Session management
- **ws**: WebSocket implementation
- **@radix-ui/react-***: UI component primitives
- **tailwindcss**: Utility-first CSS framework

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:
- **Development**: `npm run dev` runs both frontend and backend
- **Production Build**: `npm run build` creates optimized builds
- **Database Migrations**: `npm run db:push` for schema updates
- **Environment Variables**: DATABASE_URL for PostgreSQL connection

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 06, 2025. Initial setup