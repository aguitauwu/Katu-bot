# Overview

Katu Bot is a Discord bot application built with Node.js that tracks daily message counts for users across Discord servers. The system provides ranking functionality, user statistics, and configurable logging channels. The application is designed for 24/7 uptime on Replit and is a pure Discord bot without any web interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture

The backend is built using **Express.js** with TypeScript and follows a modular structure:

- **Discord Bot Integration**: Uses Discord.js v14 to handle Discord API interactions, message events, and command processing
- **Command System**: Implements a prefix-based command system (`!` prefix) with separate handler functions for each command type
- **Event-Driven Architecture**: Listens to Discord message events to automatically count user messages and respond to commands
- **Keep-Alive System**: Custom keep-alive mechanism designed for Replit hosting to maintain 24/7 uptime

## Server Architecture

The server component is minimal and only provides:

- **Express.js** minimal server for health checks
- **Health endpoint** at `/health` for Replit keep-alive functionality
- **No web interface** - pure Discord bot functionality

## Data Storage

The application uses **Drizzle ORM** with PostgreSQL for data persistence:

- **Daily Message Counts Table**: Stores user message counts organized by date, guild, and user
- **Guild Configurations Table**: Manages per-server settings like log channels and timezones
- **In-Memory Fallback**: Includes a memory-based storage implementation for development/fallback scenarios

## Key Design Decisions

### Discord Bot Commands
- **User Commands**: `!ranking`, `!mystats`, `!stats`, `!help` - accessible to all users
- **Admin Commands**: `!setlog`, `!removelog` - restricted to server administrators
- **Daily Reset System**: Automatically resets message counts at configurable intervals

### Database Schema
- **Composite Keys**: Uses date + guildId + userId for unique daily message tracking
- **Flexible Guild Config**: Supports per-server customization of log channels and settings
- **Timestamp Tracking**: Maintains created/updated timestamps for audit purposes

### Replit Optimization
- **Keep-Alive Service**: Pings the application every 5 minutes to prevent Replit from sleeping
- **Environment Detection**: Automatically adjusts behavior based on Replit environment variables
- **Health Endpoint**: Provides a `/health` endpoint for uptime monitoring

# External Dependencies

## Discord Integration
- **Discord.js v14**: Official Discord API library for bot functionality
- **Discord Bot Token**: Required environment variable for Discord API authentication

## Database
- **PostgreSQL**: Primary database using Neon Database serverless PostgreSQL
- **Drizzle ORM**: Type-safe ORM for database operations and schema management
- **Connection Pooling**: Uses @neondatabase/serverless for optimized connections

## Core Libraries
- **Discord.js v14**: Official Discord API library for bot functionality

## Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Type safety and development experience
- **TSX**: TypeScript execution for development

## Hosting Platform
- **Replit**: Cloud-based hosting platform with automatic deployment
- **Environment Variables**: Discord token, database URL, and configuration settings
- **24/7 Uptime**: Keep-alive system to maintain continuous operation