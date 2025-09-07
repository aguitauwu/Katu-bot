# KATU BOT - Discord Message Counter

## Overview

KATU BOT is a kawaii-themed Discord bot designed to track daily message counts across multiple Discord servers. The bot provides ranking systems, user statistics, and administrative features with a cute cat-themed personality. It counts messages per user per day, generates daily rankings, and manages server-specific configurations with automatic daily resets at midnight UTC.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Bot Architecture
The system follows a modular Discord bot architecture built with Discord.js v14 and TypeScript. The main bot class (`KatuBot`) handles Discord events, message processing, and command routing. Commands are separated into dedicated handlers for ranking, statistics, and administrative functions.

### Multi-Database Storage Strategy
The bot implements a flexible storage system with multiple database backends and automatic failover:

**Primary Storage**: MongoDB with Mongoose ODM for NoSQL document storage
- Optimized for Discord's data patterns with compound indexes
- Flexible schema for user and guild data
- Real-time message counting with upsert operations

**Secondary Storage**: PostgreSQL with Drizzle ORM as an alternative relational database option
- Structured schema with proper foreign key relationships
- Type-safe database operations with Drizzle
- Migration support for schema changes

**Fallback Storage**: In-memory storage system for high availability
- Automatic failover when database connections fail
- Temporary data persistence during outages
- Seamless switching between storage backends

### Message Processing System
The bot processes Discord messages in real-time with:
- Daily message counting per user per guild
- Automatic username updates and tracking
- UTC-based daily reset mechanism
- Efficient ranking calculations with pagination support

### Command System
Prefix-based command system (`!` prefix) with role-based permissions:
- Public commands: `!ranking`, `!mystats`, `!stats`, `!help`
- Admin commands: `!setlog`, `!removelog`
- Built-in help system with command descriptions
- Rich embed responses with Discord's embed system

### Logging and Monitoring
Comprehensive logging system with emoji-based categorization:
- Component-based logging (Discord, Database, Storage, etc.)
- Automatic log channel integration for guild notifications
- Startup/shutdown logging with graceful exit handling
- Debug mode support for development environments

## External Dependencies

### Core Dependencies
- **Discord.js v14**: Discord API client library for bot functionality
- **TypeScript**: Type-safe JavaScript development
- **Node.js 18+**: Runtime environment

### Database Systems
- **MongoDB**: Primary NoSQL database with Mongoose ODM
- **PostgreSQL**: Secondary relational database via Neon serverless
- **Drizzle ORM**: Type-safe PostgreSQL operations and migrations
- **@neondatabase/serverless**: Serverless PostgreSQL connection

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **TSX**: TypeScript execution for development
- **ESBuild**: Fast TypeScript compilation for production
- **Vite**: Frontend build tool (for potential web dashboard)

### UI Libraries (Future Web Dashboard)
- **React**: Frontend framework
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Data fetching and caching
- **Tailwind CSS**: Utility-first CSS framework (implied by Radix usage)

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (Neon)
- **MONGODB_URI**: MongoDB connection string
- **DISCORD_BOT_TOKEN**: Discord bot authentication token
- **NODE_ENV**: Environment specification (development/production)