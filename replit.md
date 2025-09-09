# Katu Bot - Discord Message Tracking & AI Chat Bot

## Overview

Katu Bot is a Discord bot built with TypeScript and Discord.js that tracks daily message counts for users, generates rankings, and provides AI-powered conversations using Google's Gemini API. The bot features a robust multi-storage architecture with automatic failover between PostgreSQL, MongoDB, and in-memory storage systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Bot Architecture
The bot follows a modular architecture with separate handlers for different concerns:
- **Discord Bot Core** (`discord-bot.ts`): Main bot client handling Discord events and message routing
- **Command System** (`discord-commands.ts`): Handles bot commands like rankings, stats, and configuration
- **Conversation Handler** (`conversation-handler.ts`): Manages AI-powered conversations and determines when to respond
- **Message Tracking**: Automatically counts and stores daily message statistics per user per guild

### Storage Layer Architecture
The bot implements a multi-tier storage strategy with automatic failover:
- **Primary Storage**: PostgreSQL with Drizzle ORM for production reliability
- **Secondary Storage**: MongoDB for NoSQL flexibility and backup
- **Fallback Storage**: In-memory storage for development and emergency scenarios
- **Auto-failover**: Automatically switches between storage systems if one fails

The storage abstraction (`IBotStorage` interface) ensures consistent data operations across all storage implementations.

### AI Integration
- **Gemini AI Service** (`gemini-ai.ts`): Integrates Google's Gemini API for natural language conversations
- **Conversation Context**: Maintains conversation history and user preferences
- **Personality System**: Bot has a self-doubting, humor-attempting personality with bad jokes
- **Response Intelligence**: Determines when to respond based on mentions, keywords, and random chance

### Data Models
- **Daily Message Counts**: Tracks user message activity per day per guild
- **Guild Configurations**: Stores per-guild settings like log channels and timezones
- **Conversation History**: Maintains AI conversation context and user interactions

### Architecture Benefits
- **Resilience**: Multiple storage backends ensure data persistence even during outages
- **Scalability**: Modular design allows easy addition of new features and storage systems
- **Consistency**: Unified interfaces abstract storage implementation details
- **Flexibility**: Can run in development with memory storage or production with databases

## External Dependencies

### Core Dependencies
- **Discord.js v14+**: Discord API integration and bot functionality
- **Google Gemini AI**: Natural language processing and conversation generation
- **TypeScript**: Type safety and modern JavaScript features

### Database Systems
- **PostgreSQL**: Primary production database via Neon serverless
- **MongoDB**: Secondary NoSQL database with Mongoose ODM
- **Drizzle ORM**: Type-safe PostgreSQL operations and migrations

### Development Tools
- **Vite**: Frontend build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundling for production builds

### UI Components (Dashboard)
- **React**: Frontend framework for web dashboard
- **Radix UI**: Accessible component library
- **TanStack Query**: Data fetching and caching
- **Tailwind CSS**: Utility-first CSS framework

### Hosting & Deployment
- **Replit**: Primary hosting platform with integrated development environment
- **Neon Database**: Serverless PostgreSQL hosting
- **Environment Variables**: Secure configuration management for API keys and database URLs