import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc, sum } from "drizzle-orm";
import { 
  dailyMessageCounts, 
  guildConfigs, 
  type DailyMessageCount as PgDailyMessageCount, 
  type GuildConfig as PgGuildConfig,
  type InsertDailyMessageCount,
  type InsertGuildConfig 
} from "../shared/bot-schema.js";
import mongoose from 'mongoose';
import { 
  DailyMessageCountModel, 
  GuildConfigModel,
  type DailyMessageCount,
  type GuildConfig
} from "../shared/mongodb-schema.js";

// Unified types for consistency across storage implementations
type UnifiedDailyMessageCount = {
  date: string;
  guildId: string;
  userId: string;
  username: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type UnifiedGuildConfig = {
  guildId: string;
  logChannelId?: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface IBotStorage {
  getDailyMessageCount(date: string, guildId: string, userId: string): Promise<UnifiedDailyMessageCount | undefined>;
  incrementMessageCount(date: string, guildId: string, userId: string, username: string): Promise<UnifiedDailyMessageCount>;
  getDailyRanking(date: string, guildId: string, limit?: number): Promise<UnifiedDailyMessageCount[]>;
  getUserDailyStats(date: string, guildId: string, userId: string): Promise<UnifiedDailyMessageCount | undefined>;
  getTotalMessagesForDay(date: string, guildId: string): Promise<number>;
  getGuildConfig(guildId: string): Promise<UnifiedGuildConfig | undefined>;
  setGuildLogChannel(guildId: string, logChannelId: string | null): Promise<UnifiedGuildConfig>;
}

class PostgresBotStorage implements IBotStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getDailyMessageCount(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined> {
    const result = await this.db
      .select()
      .from(dailyMessageCounts)
      .where(
        and(
          eq(dailyMessageCounts.date, date),
          eq(dailyMessageCounts.guildId, guildId),
          eq(dailyMessageCounts.userId, userId)
        )
      )
      .limit(1);

    return result[0] as DailyMessageCount | undefined;
  }

  async incrementMessageCount(date: string, guildId: string, userId: string, username: string): Promise<DailyMessageCount> {
    // Try to get existing record
    const existing = await this.getDailyMessageCount(date, guildId, userId);
    
    if (existing) {
      // Update existing record
      const updated = await this.db
        .update(dailyMessageCounts)
        .set({ 
          messageCount: existing.messageCount + 1,
          username: username, // Update username in case it changed
          updatedAt: new Date()
        })
        .where(
          and(
            eq(dailyMessageCounts.date, date),
            eq(dailyMessageCounts.guildId, guildId),
            eq(dailyMessageCounts.userId, userId)
          )
        )
        .returning();
      
      return updated[0];
    } else {
      // Insert new record
      const inserted = await this.db
        .insert(dailyMessageCounts)
        .values({
          date,
          guildId,
          userId,
          username,
          messageCount: 1
        })
        .returning();
      
      return inserted[0];
    }
  }

  async getDailyRanking(date: string, guildId: string, limit: number = 100): Promise<DailyMessageCount[]> {
    return await this.db
      .select()
      .from(dailyMessageCounts)
      .where(
        and(
          eq(dailyMessageCounts.date, date),
          eq(dailyMessageCounts.guildId, guildId)
        )
      )
      .orderBy(desc(dailyMessageCounts.messageCount))
      .limit(limit);
  }

  async getUserDailyStats(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined> {
    return this.getDailyMessageCount(date, guildId, userId);
  }

  async getTotalMessagesForDay(date: string, guildId: string): Promise<number> {
    const result = await this.db
      .select({ total: sum(dailyMessageCounts.messageCount) })
      .from(dailyMessageCounts)
      .where(
        and(
          eq(dailyMessageCounts.date, date),
          eq(dailyMessageCounts.guildId, guildId)
        )
      );

    return Number(result[0]?.total || 0);
  }

  async getGuildConfig(guildId: string): Promise<GuildConfig | undefined> {
    const result = await this.db
      .select()
      .from(guildConfigs)
      .where(eq(guildConfigs.guildId, guildId))
      .limit(1);

    return result[0];
  }

  async setGuildLogChannel(guildId: string, logChannelId: string | null): Promise<GuildConfig> {
    const existing = await this.getGuildConfig(guildId);
    
    if (existing) {
      const updated = await this.db
        .update(guildConfigs)
        .set({ 
          logChannelId: logChannelId,
          updatedAt: new Date()
        })
        .where(eq(guildConfigs.guildId, guildId))
        .returning();
      
      return updated[0];
    } else {
      const inserted = await this.db
        .insert(guildConfigs)
        .values({
          guildId,
          logChannelId: logChannelId,
          timezone: "UTC"
        })
        .returning();
      
      return inserted[0];
    }
  }
}

class MongoStorage implements IBotStorage {
  async connect(): Promise<void> {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required");
    }
    
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  async getDailyMessageCount(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined> {
    const result = await DailyMessageCountModel.findOne({ date, guildId, userId }).lean();
    if (!result) return undefined;
    
    return {
      date: result.date,
      guildId: result.guildId,
      userId: result.userId,
      username: result.username,
      messageCount: result.messageCount,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  async incrementMessageCount(date: string, guildId: string, userId: string, username: string): Promise<DailyMessageCount> {
    const result = await DailyMessageCountModel.findOneAndUpdate(
      { date, guildId, userId },
      { 
        $inc: { messageCount: 1 },
        $set: { username },
        $setOnInsert: { date, guildId, userId, messageCount: 0 }
      },
      { 
        upsert: true, 
        new: true,
        lean: true
      }
    );

    return {
      date: result.date,
      guildId: result.guildId,
      userId: result.userId,
      username: result.username,
      messageCount: result.messageCount,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  async getDailyRanking(date: string, guildId: string, limit: number = 100): Promise<DailyMessageCount[]> {
    const results = await DailyMessageCountModel.find({ date, guildId })
      .sort({ messageCount: -1 })
      .limit(limit)
      .lean();

    return results.map(result => ({
      date: result.date,
      guildId: result.guildId,
      userId: result.userId,
      username: result.username,
      messageCount: result.messageCount,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }));
  }

  async getUserDailyStats(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined> {
    return this.getDailyMessageCount(date, guildId, userId);
  }

  async getTotalMessagesForDay(date: string, guildId: string): Promise<number> {
    const result = await DailyMessageCountModel.aggregate([
      { $match: { date, guildId } },
      { $group: { _id: null, total: { $sum: '$messageCount' } } }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async getGuildConfig(guildId: string): Promise<GuildConfig | undefined> {
    const result = await GuildConfigModel.findOne({ guildId }).lean();
    if (!result) return undefined;

    return {
      guildId: result.guildId,
      logChannelId: result.logChannelId,
      timezone: result.timezone,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  async setGuildLogChannel(guildId: string, logChannelId: string | null): Promise<GuildConfig> {
    const result = await GuildConfigModel.findOneAndUpdate(
      { guildId },
      { 
        $set: { logChannelId },
        $setOnInsert: { guildId, timezone: "UTC" }
      },
      { 
        upsert: true, 
        new: true,
        lean: true
      }
    );

    return {
      guildId: result.guildId,
      logChannelId: result.logChannelId,
      timezone: result.timezone,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }
}

class MemoryBotStorage implements IBotStorage {
  private messageCount: Map<string, DailyMessageCount> = new Map();
  private guildConfig: Map<string, GuildConfig> = new Map();

  private getKey(date: string, guildId: string, userId: string): string {
    return `${date}-${guildId}-${userId}`;
  }

  async getDailyMessageCount(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined> {
    return this.messageCount.get(this.getKey(date, guildId, userId));
  }

  async incrementMessageCount(date: string, guildId: string, userId: string, username: string): Promise<DailyMessageCount> {
    const key = this.getKey(date, guildId, userId);
    const existing = this.messageCount.get(key);
    
    if (existing) {
      existing.messageCount += 1;
      existing.username = username;
      existing.updatedAt = new Date();
      return existing;
    } else {
      const newRecord: DailyMessageCount = {
        date,
        guildId,
        userId,
        username,
        messageCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.messageCount.set(key, newRecord);
      return newRecord;
    }
  }

  async getDailyRanking(date: string, guildId: string, limit: number = 100): Promise<DailyMessageCount[]> {
    const results = Array.from(this.messageCount.values())
      .filter(record => record.date === date && record.guildId === guildId)
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, limit);
    
    return results;
  }

  async getUserDailyStats(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined> {
    return this.getDailyMessageCount(date, guildId, userId);
  }

  async getTotalMessagesForDay(date: string, guildId: string): Promise<number> {
    return Array.from(this.messageCount.values())
      .filter(record => record.date === date && record.guildId === guildId)
      .reduce((total, record) => total + record.messageCount, 0);
  }

  async getGuildConfig(guildId: string): Promise<GuildConfig | undefined> {
    return this.guildConfig.get(guildId);
  }

  async setGuildLogChannel(guildId: string, logChannelId: string | null): Promise<GuildConfig> {
    const existing = this.guildConfig.get(guildId);
    
    if (existing) {
      existing.logChannelId = logChannelId;
      existing.updatedAt = new Date();
      return existing;
    } else {
      const newConfig: GuildConfig = {
        guildId,
        logChannelId: logChannelId,
        timezone: "UTC",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.guildConfig.set(guildId, newConfig);
      return newConfig;
    }
  }
}

let storage: IBotStorage;

export async function initStorage(): Promise<void> {
  if (process.env.MONGODB_URI) {
    const mongoStorage = new MongoStorage();
    await mongoStorage.connect();
    storage = mongoStorage;
    console.log('✅ Using MongoDB storage');
  } else if (process.env.DATABASE_URL) {
    storage = new PostgresBotStorage();
    console.log('✅ Using PostgreSQL storage');
  } else {
    storage = new MemoryBotStorage();
    console.log('⚠️ Using memory storage (data will be lost on restart)');
  }
}

export function getStorage(): IBotStorage {
  if (!storage) {
    throw new Error('Storage not initialized. Call initStorage() first.');
  }
  return storage;
}
