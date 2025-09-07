import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc, sum } from "drizzle-orm";
import { 
  dailyMessageCounts, 
  guildConfigs, 
  type DailyMessageCount, 
  type GuildConfig,
  type InsertDailyMessageCount,
  type InsertGuildConfig 
} from "../shared/bot-schema.js";

export interface IBotStorage {
  getDailyMessageCount(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined>;
  incrementMessageCount(date: string, guildId: string, userId: string, username: string): Promise<DailyMessageCount>;
  getDailyRanking(date: string, guildId: string, limit?: number): Promise<DailyMessageCount[]>;
  getUserDailyStats(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined>;
  getTotalMessagesForDay(date: string, guildId: string): Promise<number>;
  getGuildConfig(guildId: string): Promise<GuildConfig | undefined>;
  setGuildLogChannel(guildId: string, logChannelId: string | null): Promise<GuildConfig>;
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

    return result[0];
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
      existing.logChannelId = logChannelId || undefined;
      existing.updatedAt = new Date();
      return existing;
    } else {
      const newConfig: GuildConfig = {
        guildId,
        logChannelId: logChannelId || undefined,
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
  if (process.env.DATABASE_URL) {
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
